from fastapi import APIRouter

router = APIRouter(prefix="/mock-portals", tags=["Mock Portals"])

@router.post("/gst/submit")
def mock_gst_submit(payload: dict):
    """
    Mock external endpoint for GST portal submission.
    """
    return {"status": "success", "acknowledgement_number": "ACK123456789GST"}

@router.post("/traces/submit")
def mock_traces_submit(payload: dict):
    """
    Mock external endpoint for TRACES return submission.
    """
    return {"status": "success", "token_number": "PRN9876543210"}

@router.post("/incometax/verify")
def mock_itax_verify(payload: dict):
    """
    Mock external endpoint for Income Tax return e-verification.
    """
    return {"status": "success", "message": "Return successfully e-verified."}
