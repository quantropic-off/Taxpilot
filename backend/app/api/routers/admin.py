from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from database.models import GSTPracticeCase, TDSPracticeCase, ITRPracticeCase

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/system-health")
def get_system_health():
    """
    Get system health and stats for admin dashboard.
    """
    return {
        "status": "healthy",
        "active_users": 1248,
        "simulated_filings": 8432
    }

@router.get("/students/stats")
def get_student_stats(db: Session = Depends(get_db)):
    """
    Get live progress stats for all students based on their practice cases.
    """
    gst_stats = db.query(
        GSTPracticeCase.student_id,
        func.count(GSTPracticeCase.id).label('gst_count')
    ).group_by(GSTPracticeCase.student_id).all()

    tds_stats = db.query(
        TDSPracticeCase.student_id,
        func.count(TDSPracticeCase.id).label('tds_count')
    ).group_by(TDSPracticeCase.student_id).all()

    itr_stats = db.query(
        ITRPracticeCase.student_id,
        func.count(ITRPracticeCase.id).label('itr_count')
    ).group_by(ITRPracticeCase.student_id).all()

    # Aggregate by student_id
    students = {}
    
    def add_stat(stats_list, key):
        for stat in stats_list:
            sid = stat.student_id or "Unknown"
            if sid not in students:
                students[sid] = {"student_id": sid, "gst_cases": 0, "tds_cases": 0, "itr_cases": 0}
            students[sid][key] = stat[1]

    add_stat(gst_stats, "gst_cases")
    add_stat(tds_stats, "tds_cases")
    add_stat(itr_stats, "itr_cases")

    return {
        "status": "success",
        "data": list(students.values())
    }

@router.post("/reset-mock-data")
def reset_mock_data(db: Session = Depends(get_db)):
    """
    Reset mock databases for a user or global testing environment.
    """
    # Simply delete all cases for now
    db.query(GSTPracticeCase).delete()
    db.query(TDSPracticeCase).delete()
    db.query(ITRPracticeCase).delete()
    db.commit()
    return {"status": "success", "message": "All practice cases deleted."}
