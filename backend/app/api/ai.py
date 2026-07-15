from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_service import parse_expense_text, get_ai_chat_response
from app.services.expense_service import fetch_expenses
from app.api.auth import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

class ParseRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str

@router.post("/parse")
def parse_text(request: ParseRequest, current_user: dict = Depends(get_current_user)):
    result = parse_expense_text(request.text)
    return result

@router.post("/chat")
def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    expenses = fetch_expenses(current_user["id"])
    response = get_ai_chat_response(request.message, expenses)
    return {"reply": response}
