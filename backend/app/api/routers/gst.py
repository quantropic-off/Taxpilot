from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date
from database.database import get_db
from database.models import GSTPracticeCase, GSTInvoiceEntry
import re
import uuid

router = APIRouter(prefix="/gst", tags=["GST Simulator"])

# Pydantic Schemas
class GSTCaseBase(BaseModel):
    student_id: str
    gstin: str
    return_period: str
    place_of_supply: str # State code e.g., '27' for Maharashtra
    transaction_type: str

    @validator('gstin')
    def validate_gstin(cls, v):
        pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid GSTIN format. Expected e.g., 27ABCDE1234F1Z5")
        return v

class GSTCaseCreate(GSTCaseBase):
    pass

class GSTInvoiceCreate(BaseModel):
    invoice_number: str
    date: date
    invoice_type: str
    hsn: str
    taxable_value: float
    tax_rate: float

class ARNResponse(BaseModel):
    arn: str
    status: str

# API Endpoints
@router.get("/cases")
def get_gst_cases(student_id: str, db: Session = Depends(get_db)):
    cases = db.query(GSTPracticeCase).filter(GSTPracticeCase.student_id == student_id).all()
    return {"status": "success", "cases": cases}

@router.post("/cases", response_model=dict)
def create_gst_case(case: GSTCaseCreate, db: Session = Depends(get_db)):
    try:
        db_case = GSTPracticeCase(**case.model_dump())
    except AttributeError:
        db_case = GSTPracticeCase(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return {"status": "success", "case_id": db_case.id}

@router.post("/cases/{case_id}/invoices")
def add_invoice(case_id: int, invoice: GSTInvoiceCreate, db: Session = Depends(get_db)):
    db_case = db.query(GSTPracticeCase).filter(GSTPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="GST Case not found")
    
    # Intra vs Inter state logic
    gstin_state_code = db_case.gstin[:2]
    pos_code = db_case.place_of_supply[:2]
    
    is_intra = (gstin_state_code == pos_code)
    
    total_tax = invoice.taxable_value * (invoice.tax_rate / 100)
    cgst, sgst, igst = 0.0, 0.0, 0.0
    
    if is_intra:
        cgst = total_tax / 2
        sgst = total_tax / 2
    else:
        igst = total_tax
        
    db_invoice = GSTInvoiceEntry(
        gst_case_id=case_id,
        invoice_number=invoice.invoice_number,
        date=invoice.date,
        invoice_type=invoice.invoice_type,
        hsn=invoice.hsn,
        taxable_value=invoice.taxable_value,
        tax_rate=invoice.tax_rate,
        cgst_amount=cgst,
        sgst_amount=sgst,
        igst_amount=igst
    )
    db.add(db_invoice)
    
    # Update Case Totals
    db_case.total_taxable_value += invoice.taxable_value
    db_case.total_cgst += cgst
    db_case.total_sgst += sgst
    db_case.total_igst += igst
    db.commit()
    
    return {"status": "success", "invoice_id": db_invoice.id}

@router.post("/cases/{case_id}/generate-gstr1")
def generate_gstr1(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(GSTPracticeCase).filter(GSTPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    invoices = db.query(GSTInvoiceEntry).filter(GSTInvoiceEntry.gst_case_id == case_id).all()
    
    # Construct NIC compatible JSON
    b2b_invoices = []
    for inv in invoices:
        b2b_invoices.append({
            "inum": inv.invoice_number,
            "idt": inv.date.strftime("%d-%m-%Y"),
            "val": inv.taxable_value + inv.cgst_amount + inv.sgst_amount + inv.igst_amount,
            "itms": [{
                "num": 1,
                "itm_det": {
                    "txval": inv.taxable_value,
                    "rt": inv.tax_rate,
                    "camt": inv.cgst_amount,
                    "samt": inv.sgst_amount,
                    "iamt": inv.igst_amount
                }
            }]
        })
        
    gstr1_json = {
        "gstin": db_case.gstin,
        "fp": db_case.return_period,
        "b2b": [{"ctin": "00XXXXX0000X0X0", "inv": b2b_invoices}] if b2b_invoices else []
    }
    return {"status": "success", "gstr1_json": gstr1_json}

@router.post("/cases/{case_id}/simulate-arn", response_model=ARNResponse)
def simulate_arn(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(GSTPracticeCase).filter(GSTPracticeCase.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Format: AA{STATE}{YYYY}{MM}{######}
    state = db_case.gstin[:2]
    period_year = "2024" # Mocked for now
    period_month = "05"
    random_digits = str(uuid.uuid4().int)[:6]
    arn = f"AA{state}{period_year}{period_month}{random_digits}"
    
    db_case.validation_status = "Filed"
    db_case.arn = arn
    db.commit()
    
    return {"arn": arn, "status": "Filed"}
