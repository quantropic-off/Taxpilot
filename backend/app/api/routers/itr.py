from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date
from database.database import get_db
from database.models import ITRPracticeCase, ITRIncomeSource, ITRDeduction
import re
import uuid

router = APIRouter(prefix="/itr", tags=["ITR Simulator"])

# Schemas
class ITRCaseCreate(BaseModel):
    student_id: str
    pan: str
    assessment_year: str
    itr_type: str = "ITR-1"

    @validator('pan')
    def validate_pan(cls, v):
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", v):
            raise ValueError("Invalid PAN format. Expected e.g., ABCDE1234F")
        return v

class IncomeItem(BaseModel):
    head_of_income: str
    amount: float

class DeductionItem(BaseModel):
    section: str
    amount_claimed: float

class ComputeTaxRequest(BaseModel):
    incomes: List[IncomeItem]
    deductions: List[DeductionItem]

class AckResponse(BaseModel):
    ack_number: str
    status: str

# Tax Logic Helpers
def calculate_tax(income: float, slabs: list) -> float:
    tax = 0.0
    for slab in slabs:
        if income > slab[0]:
            taxable_in_slab = min(income, slab[1]) - slab[0]
            tax += taxable_in_slab * slab[2]
    return tax

def calc_old_regime(net_income: float) -> float:
    slabs = [
        (0, 250000, 0.0),
        (250000, 500000, 0.05),
        (500000, 1000000, 0.20),
        (1000000, float('inf'), 0.30)
    ]
    return calculate_tax(net_income, slabs)

def calc_new_regime(gross_income: float) -> float:
    slabs = [
        (0, 300000, 0.0),
        (300000, 600000, 0.05),
        (600000, 900000, 0.10),
        (900000, 1200000, 0.15),
        (1200000, 1500000, 0.20),
        (1500000, float('inf'), 0.30)
    ]
    return calculate_tax(gross_income, slabs)

# API Endpoints
@router.post("/cases", response_model=dict)
def create_itr_case(case: ITRCaseCreate, db: Session = Depends(get_db)):
    try:
        db_case = ITRPracticeCase(**case.model_dump())
    except AttributeError:
        db_case = ITRPracticeCase(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return {"status": "success", "case_id": db_case.id}

@router.post("/cases/{case_id}/compute")
def compute_tax_liability(case_id: int, req: ComputeTaxRequest, db: Session = Depends(get_db)):
    db_case = db.query(ITRPracticeCase).filter(ITRPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="ITR Case not found")
        
    # Clear existing entries
    db.query(ITRIncomeSource).filter(ITRIncomeSource.itr_case_id == case_id).delete()
    db.query(ITRDeduction).filter(ITRDeduction.itr_case_id == case_id).delete()
    
    # Calculate GTI
    gti = 0.0
    for inc in req.incomes:
        gti += inc.amount
        db.add(ITRIncomeSource(itr_case_id=case_id, head_of_income=inc.head_of_income, amount=inc.amount))
        
    # Calculate Deductions (apply 80C capping)
    total_80c_claimed = 0.0
    for ded in req.deductions:
        if ded.section == "80C":
            total_80c_claimed += ded.amount_claimed
            
    total_80c_eligible = min(total_80c_claimed, 150000.0)
    
    for ded in req.deductions:
        eligible = total_80c_eligible if ded.section == "80C" else ded.amount_claimed # simplified
        db.add(ITRDeduction(itr_case_id=case_id, section=ded.section, amount_claimed=ded.amount_claimed, amount_eligible=eligible))
        
    total_eligible_deductions = total_80c_eligible
    
    # Compute Taxes
    net_taxable_old = max(0, gti - total_eligible_deductions)
    old_tax = calc_old_regime(net_taxable_old)
    new_tax = calc_new_regime(gti)
    
    # Recommend
    recommended = "New Regime" if new_tax <= old_tax else "Old Regime"
    
    # Update Case
    db_case.gross_total_income = gti
    db_case.total_deductions = total_eligible_deductions
    db_case.net_taxable_income = net_taxable_old
    db_case.old_regime_tax = old_tax
    db_case.new_regime_tax = new_tax
    db_case.recommended_regime = recommended
    db.commit()
    
    return {
        "status": "success", 
        "gti": gti,
        "deductions": total_eligible_deductions,
        "old_tax": old_tax,
        "new_tax": new_tax,
        "recommended": recommended
    }

@router.post("/cases/{case_id}/file", response_model=AckResponse)
def file_itr(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(ITRPracticeCase).filter(ITRPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Mock Acknowledgement Number
    random_digits = str(uuid.uuid4().int)[:15]
    ack = f"{random_digits}"
    
    db_case.validation_status = "Filed"
    db_case.ack_number = ack
    db.commit()
    
    return {"ack_number": ack, "status": "Filed"}
