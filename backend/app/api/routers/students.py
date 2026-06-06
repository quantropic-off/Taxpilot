from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import date
from database.database import get_db
from database.models import Student, Course, Batch, PracticeCase
from auth.utils import get_password_hash

router = APIRouter(prefix="/students", tags=["Student Management"])

# Schemas
class StudentBase(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = None
    dob: Optional[date] = None
    enrollment_date: Optional[date] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    status: str = "Active"

class StudentCreate(StudentBase):
    password: str

class StudentResponse(StudentBase):
    id: int
    progress_percent: float
    total_score: float
    enrollment_date: Optional[date]

    class Config:
        from_attributes = True

class BatchBase(BaseModel):
    name: str
    course_id: int
    academic_year: str
    start_date: date
    end_date: date
    max_students: int
    instructor: str

    @validator('end_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError("End date must be after start date")
        return v

class BatchCreate(BatchBase):
    pass

class PracticeCaseBase(BaseModel):
    title: str
    case_type: str
    difficulty: str
    student_id: int
    batch_id: int

class PracticeCaseUpdate(BaseModel):
    status: str
    score: float
    completion_date: Optional[date] = None

# Routes
@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.email == student.email).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    student_data = student.dict()
    password = student_data.pop("password")
    hashed_password = get_password_hash(password)
    
    new_student = Student(**student_data, hashed_password=hashed_password)
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("/", response_model=List[StudentResponse])
def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = db.query(Student).offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}/progress")
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    cases = db.query(PracticeCase).filter(PracticeCase.student_id == student_id).all()
    total_cases = len(cases)
    if total_cases == 0:
        return {"progress_percent": 0.0, "total_score": 0.0, "cases": []}
    
    completed_cases = [c for c in cases if c.status == "Completed"]
    progress = (len(completed_cases) / total_cases) * 100
    total_score = sum(c.score for c in completed_cases)
    
    student.progress_percent = progress
    student.total_score = total_score
    db.commit()
    
    return {
        "student_id": student.id,
        "progress_percent": progress,
        "total_score": total_score,
        "cases_completed": len(completed_cases),
        "total_cases": total_cases
    }

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    from database.models import GSTPracticeCase, TDSPracticeCase, ITRPracticeCase
    
    # Get all practice cases for this student
    practice_cases = db.query(PracticeCase).filter(PracticeCase.student_id == student_id).all()
    pc_ids = [pc.id for pc in practice_cases]
    
    # Delete child cases matching EITHER student_id string OR linked to the practice cases
    # We use .all() and loop over them to trigger cascade delete for their entries
    gst_query = db.query(GSTPracticeCase).filter(GSTPracticeCase.student_id == str(student_id))
    if pc_ids:
        gst_query = db.query(GSTPracticeCase).filter((GSTPracticeCase.student_id == str(student_id)) | (GSTPracticeCase.practice_case_id.in_(pc_ids)))
    for gc in gst_query.all():
        db.delete(gc)
        
    tds_query = db.query(TDSPracticeCase).filter(TDSPracticeCase.student_id == str(student_id))
    if pc_ids:
        tds_query = db.query(TDSPracticeCase).filter((TDSPracticeCase.student_id == str(student_id)) | (TDSPracticeCase.practice_case_id.in_(pc_ids)))
    for tc in tds_query.all():
        db.delete(tc)
        
    itr_query = db.query(ITRPracticeCase).filter(ITRPracticeCase.student_id == str(student_id))
    if pc_ids:
        itr_query = db.query(ITRPracticeCase).filter((ITRPracticeCase.student_id == str(student_id)) | (ITRPracticeCase.practice_case_id.in_(pc_ids)))
    for ic in itr_query.all():
        db.delete(ic)
    
    # Now safely delete the parent practice cases
    for pc in practice_cases:
        db.delete(pc)
    
    db.delete(student)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete student: {str(e)}")
        
    return {"message": "Student deleted successfully"}

@router.post("/batch/")
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    try:
        new_batch = Batch(**batch.model_dump())
    except AttributeError:
        new_batch = Batch(**batch.dict())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch
