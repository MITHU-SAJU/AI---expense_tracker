from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import parse_expense_text, get_ai_chat_response
from app.services.expense_service import fetch_expenses

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

class ParseRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str

@router.post("/parse")
def parse_text(request: ParseRequest):
    result = parse_expense_text(request.text)
    return result

@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    # Fetch recent expenses for context
    recent_expenses = fetch_expenses()
    response_text = get_ai_chat_response(request.message, recent_expenses)
    return {"reply": response_text}
