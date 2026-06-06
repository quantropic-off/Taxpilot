from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date
from database.database import get_db
from database.models import TDSPracticeCase, TDSDeductionEntry
import re
import uuid

router = APIRouter(prefix="/tds", tags=["TDS Simulator"])

# Schemas
class TDSCaseCreate(BaseModel):
    student_id: str
    deductor_tan: str
    deductor_pan: str
    financial_year: str
    quarter: str
    form_type: str = "26Q"

    @validator('deductor_tan')
    def validate_tan(cls, v):
        if not re.match(r"^[A-Z]{4}[0-9]{5}[A-Z]{1}$", v):
            raise ValueError("Invalid TAN format. Expected e.g., DELD12345E")
        return v
        
    @validator('deductor_pan')
    def validate_pan(cls, v):
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", v):
            raise ValueError("Invalid PAN format. Expected e.g., ABCDE1234F")
        return v

class TDSDeductionCreate(BaseModel):
    deductee_pan: str
    section_code: str
    payment_amount: float
    deduction_date: date

class PRNResponse(BaseModel):
    receipt_number: str
    status: str

# API Endpoints
@router.post("/cases", response_model=dict)
def create_tds_case(case: TDSCaseCreate, db: Session = Depends(get_db)):
    try:
        db_case = TDSPracticeCase(**case.model_dump())
    except AttributeError:
        db_case = TDSPracticeCase(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return {"status": "success", "case_id": db_case.id}

@router.post("/cases/{case_id}/deductions")
def add_deduction(case_id: int, deduction: TDSDeductionCreate, db: Session = Depends(get_db)):
    db_case = db.query(TDSPracticeCase).filter(TDSPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="TDS Case not found")
        
    # Validation logic
    is_valid_pan = bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", deduction.deductee_pan))
    
    # Section code tax logic
    section_rates = {
        "194J": 10.0,
        "194C": 1.0,  # 1% for individual/HUF, assuming 1% for mock
        "194I": 10.0,
        "192": 0.0    # Salary requires dynamic calc, 0 for generic mock unless specified
    }
    
    tax_rate = section_rates.get(deduction.section_code, 10.0)
    
    # 20% if PAN is invalid/missing
    if not is_valid_pan:
        tax_rate = 20.0
        
    tds_amount = deduction.payment_amount * (tax_rate / 100)
    
    db_deduction = TDSDeductionEntry(
        tds_case_id=case_id,
        deductee_pan=deduction.deductee_pan,
        section_code=deduction.section_code,
        payment_amount=deduction.payment_amount,
        deduction_date=deduction.deduction_date,
        tax_rate=tax_rate,
        tds_amount=tds_amount
    )
    db.add(db_deduction)
    
    db_case.total_payment_amount += deduction.payment_amount
    db_case.total_tds_deducted += tds_amount
    db.commit()
    
    return {"status": "success", "deduction_id": db_deduction.id}

@router.post("/cases/{case_id}/generate-challan")
def generate_challan(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(TDSPracticeCase).filter(TDSPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Mock ITNS 281 payload
    challan = {
        "tan": db_case.deductor_tan,
        "assessment_year": f"20{db_case.financial_year.split('-')[1]}-{int(db_case.financial_year.split('-')[1])+1}",
        "type_of_payment": "200", # TDS/TCS Payable by Taxpayer
        "nature_of_payment": "Generic",
        "income_tax": db_case.total_tds_deducted,
        "surcharge": 0.0,
        "cess": 0.0,
        "interest": 0.0,
        "penalty": 0.0,
        "total_amount": db_case.total_tds_deducted,
        "bsr_code": "0123456",
        "challan_serial_no": str(uuid.uuid4().int)[:5]
    }
    return {"status": "success", "challan": challan}

@router.post("/cases/{case_id}/file-26q", response_model=PRNResponse)
def file_26q(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(TDSPracticeCase).filter(TDSPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Mock Provisional Receipt Number
    random_digits = str(uuid.uuid4().int)[:15]
    prn = f"{random_digits}"
    
    db_case.validation_status = "Filed"
    db_case.receipt_number = prn
    db.commit()
    
    return {"receipt_number": prn, "status": "Filed"}
