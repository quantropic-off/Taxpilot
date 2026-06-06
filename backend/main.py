from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import gst, tds, itr, mock_portals, admin, students, auth, ai
from database.database import engine
from database import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaxPro Academy API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gst.router, prefix="/api/v1")
app.include_router(tds.router, prefix="/api/v1")
app.include_router(itr.router, prefix="/api/v1")
app.include_router(mock_portals.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(students.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Taxpilot Academy API"}
