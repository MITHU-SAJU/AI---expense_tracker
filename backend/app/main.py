from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import db
from app.api.expenses import router as expense_router
from app.api.ai import router as ai_router

app = FastAPI(
    title="AI Expense Tracker API",
    description="Backend API for AI Expense Tracker",
    version="1.0.0"
)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(expense_router)
app.include_router(ai_router)

@app.get("/")
def root():
    try:
        db.command("ping")
        return {"message": "MongoDB Connected Successfully ✅"}
    except Exception as e:
        return {"message": str(e)}