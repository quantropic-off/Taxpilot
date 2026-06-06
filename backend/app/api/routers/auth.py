from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Student, User, UserRole
from auth.utils import verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    # Fallback/Auto-create Admin if it's the specific admin fallback credentials
    if creds.email == "admin@taxpro.com" and creds.password == "admin":
        admin_user = db.query(User).filter(User.email == creds.email).first()
        if not admin_user:
            admin_user = User(
                email=creds.email,
                hashed_password=get_password_hash(creds.password),
                full_name="System Admin",
                role=UserRole.ADMIN
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        return {"status": "success", "user": {"id": str(admin_user.id), "name": admin_user.full_name, "role": "admin"}}

    # Check if it's an Admin/User
    user = db.query(User).filter(User.email == creds.email).first()
    if user and verify_password(creds.password, user.hashed_password):
        return {"status": "success", "user": {"id": str(user.id), "name": user.full_name, "role": "admin"}}

    # Check if it's a Student
    student = db.query(Student).filter(Student.email == creds.email).first()
    if student and student.hashed_password and verify_password(creds.password, student.hashed_password):
        return {"status": "success", "user": {"id": str(student.id), "name": student.name, "role": "student"}}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
