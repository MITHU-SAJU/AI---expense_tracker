import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database.mongodb import db
from app.api.expenses import router as expense_router
from app.api.ai import router as ai_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="AI Expense Tracker API",
    description="Backend API for AI Expense Tracker",
    version="1.0.0"
)

# CORS: allow every origin. This is safe because we use Bearer tokens
# (Authorization header), NOT cookies. allow_credentials is False so
# the browser will accept Access-Control-Allow-Origin: *.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler – ensures that even unhandled 500 errors
# return a proper JSON body instead of crashing without CORS headers.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()          # still prints the traceback to Render logs
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

app.include_router(auth_router)
app.include_router(expense_router)
app.include_router(ai_router)

@app.get("/")
def root():
    try:
        db.command("ping")
        return {"message": "MongoDB Connected Successfully ✅"}
    except Exception as e:
        return {"message": str(e)}