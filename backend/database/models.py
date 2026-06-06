from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, JSON, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TRAINER = "trainer"
    MENTOR = "mentor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    clients = relationship("Client", back_populates="owner")
    documents = relationship("Document", back_populates="owner")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    pan = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="clients")
    gst_data = relationship("GSTData", back_populates="client")
    tds_data = relationship("TDSData", back_populates="client")
    itr_data = relationship("ITRData", back_populates="client")

class GSTData(Base):
    __tablename__ = "gst_data"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    return_type = Column(String) # e.g., GSTR-1, GSTR-3B
    period = Column(String)
    data = Column(JSON) # Store raw mock form data here
    
    client = relationship("Client", back_populates="gst_data")

class TDSData(Base):
    __tablename__ = "tds_data"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    form_type = Column(String) # e.g., 24Q, 26Q
    quarter = Column(String)
    data = Column(JSON)
    
    client = relationship("Client", back_populates="tds_data")

class ITRData(Base):
    __tablename__ = "itr_data"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    form_type = Column(String) # e.g., ITR-1, ITR-2
    assessment_year = Column(String)
    data = Column(JSON)
    
    client = relationship("Client", back_populates="itr_data")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    url = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="documents")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    duration_weeks = Column(Integer)
    is_active = Column(Boolean, default=True)

    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="course")

class CourseModule(Base):
    __tablename__ = "course_modules"
    id = Column(Integer, primary_key=True, index=True)
    module_name = Column(String, nullable=False)
    weightage = Column(Float, default=0.0)
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="modules")

class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    academic_year = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    max_students = Column(Integer)
    instructor = Column(String)

    course = relationship("Course", back_populates="batches")
    students = relationship("Student", back_populates="batch")
    practice_cases = relationship("PracticeCase", back_populates="batch")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Making it nullable so existing entries don't break immediately
    mobile = Column(String)
    dob = Column(Date)
    course_id = Column(Integer, ForeignKey("courses.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    enrollment_date = Column(Date)
    progress_percent = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    status = Column(String, default="Active")

    course = relationship("Course")
    batch = relationship("Batch", back_populates="students")
    practice_cases = relationship("PracticeCase", back_populates="student")

class PracticeCase(Base):
    __tablename__ = "practice_cases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    case_type = Column(String, nullable=False) # GST, TDS, ITR
    difficulty = Column(String) # Beginner, Intermediate, Advanced
    student_id = Column(Integer, ForeignKey("students.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    start_date = Column(Date)
    completion_date = Column(Date)
    status = Column(String, default="Not Started") # Not Started, In Progress, Completed
    score = Column(Float, default=0.0)

    student = relationship("Student", back_populates="practice_cases")
    batch = relationship("Batch", back_populates="practice_cases")

class GSTPracticeCase(Base):
    __tablename__ = "gst_practice_cases"
    id = Column(Integer, primary_key=True, index=True)
    practice_case_id = Column(Integer, ForeignKey("practice_cases.id"), nullable=True)
    student_id = Column(String, index=True)
    gstin = Column(String, index=True)
    return_period = Column(String)
    place_of_supply = Column(String)
    transaction_type = Column(String)
    total_taxable_value = Column(Float, default=0.0)
    total_cgst = Column(Float, default=0.0)
    total_sgst = Column(Float, default=0.0)
    total_igst = Column(Float, default=0.0)
    total_cess = Column(Float, default=0.0)
    validation_status = Column(String, default="Draft")
    arn = Column(String)

    practice_case = relationship("PracticeCase")
    invoice_entries = relationship("GSTInvoiceEntry", back_populates="gst_case", cascade="all, delete-orphan")

class GSTInvoiceEntry(Base):
    __tablename__ = "gst_invoice_entries"
    id = Column(Integer, primary_key=True, index=True)
    gst_case_id = Column(Integer, ForeignKey("gst_practice_cases.id"))
    invoice_number = Column(String, index=True)
    date = Column(Date)
    invoice_type = Column(String)
    hsn = Column(String)
    taxable_value = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    cgst_amount = Column(Float, default=0.0)
    sgst_amount = Column(Float, default=0.0)
    igst_amount = Column(Float, default=0.0)

    gst_case = relationship("GSTPracticeCase", back_populates="invoice_entries")

class TDSPracticeCase(Base):
    __tablename__ = "tds_practice_cases"
    id = Column(Integer, primary_key=True, index=True)
    practice_case_id = Column(Integer, ForeignKey("practice_cases.id"), nullable=True)
    student_id = Column(String, index=True)
    deductor_tan = Column(String, index=True)
    deductor_pan = Column(String)
    financial_year = Column(String)
    quarter = Column(String)
    form_type = Column(String)
    total_payment_amount = Column(Float, default=0.0)
    total_tds_deducted = Column(Float, default=0.0)
    validation_status = Column(String, default="Draft")
    receipt_number = Column(String)

    practice_case = relationship("PracticeCase")
    deduction_entries = relationship("TDSDeductionEntry", back_populates="tds_case", cascade="all, delete-orphan")

class TDSDeductionEntry(Base):
    __tablename__ = "tds_deduction_entries"
    id = Column(Integer, primary_key=True, index=True)
    tds_case_id = Column(Integer, ForeignKey("tds_practice_cases.id"))
    deductee_pan = Column(String, index=True)
    section_code = Column(String)
    payment_amount = Column(Float, default=0.0)
    deduction_date = Column(Date)
    tax_rate = Column(Float, default=0.0)
    tds_amount = Column(Float, default=0.0)

    tds_case = relationship("TDSPracticeCase", back_populates="deduction_entries")

class ITRPracticeCase(Base):
    __tablename__ = "itr_practice_cases"
    id = Column(Integer, primary_key=True, index=True)
    practice_case_id = Column(Integer, ForeignKey("practice_cases.id"), nullable=True)
    student_id = Column(String, index=True)
    pan = Column(String, index=True)
    assessment_year = Column(String)
    itr_type = Column(String, default="ITR-1")
    gross_total_income = Column(Float, default=0.0)
    total_deductions = Column(Float, default=0.0)
    net_taxable_income = Column(Float, default=0.0)
    old_regime_tax = Column(Float, default=0.0)
    new_regime_tax = Column(Float, default=0.0)
    recommended_regime = Column(String)
    validation_status = Column(String, default="Draft")
    ack_number = Column(String)

    practice_case = relationship("PracticeCase")
    incomes = relationship("ITRIncomeSource", back_populates="itr_case", cascade="all, delete-orphan")
    deductions = relationship("ITRDeduction", back_populates="itr_case", cascade="all, delete-orphan")

class ITRIncomeSource(Base):
    __tablename__ = "itr_income_sources"
    id = Column(Integer, primary_key=True, index=True)
    itr_case_id = Column(Integer, ForeignKey("itr_practice_cases.id"))
    head_of_income = Column(String)
    amount = Column(Float, default=0.0)

    itr_case = relationship("ITRPracticeCase", back_populates="incomes")

class ITRDeduction(Base):
    __tablename__ = "itr_deductions"
    id = Column(Integer, primary_key=True, index=True)
    itr_case_id = Column(Integer, ForeignKey("itr_practice_cases.id"))
    section = Column(String)
    amount_claimed = Column(Float, default=0.0)
    amount_eligible = Column(Float, default=0.0)

    itr_case = relationship("ITRPracticeCase", back_populates="deductions")
