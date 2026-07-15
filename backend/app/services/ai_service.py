import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

class ParsedExpense(BaseModel):
    amount: float = Field(description="The numeric amount of the expense or income.")
    category: str = Field(description="The category. One of: Food, Petrol, Shopping, Salary, Bills, Entertainment, Others")
    description: str = Field(description="A short description of the transaction.")
    type: str = Field(description="Either 'expense' or 'income'")

def parse_expense_text(text: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "AI not configured. Missing GEMINI_API_KEY"}
        
    try:
        client = genai.Client(api_key=api_key)
        prompt = "Extract the expense details from the user's statement."
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{prompt}\n\nUser statement: {text}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedExpense
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

def get_ai_chat_response(prompt: str, expenses_context: list) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "AI not configured. Missing GEMINI_API_KEY"
        
    # Format recent expenses for context
    context_str = "Recent Expenses Context:\n"
    for e in expenses_context[:50]: # Limit to 50 for context window
        context_str += f"- {e.get('type', 'expense')}: {e.get('category')} - ₹{e.get('amount')} ({e.get('description', '')})\n"
        
    system_prompt = f"""
You are an AI Expense Assistant for the 'AI Expense Tracker' application.
Use the following context about the user's finances to answer their question.
If the answer is not in the context, you can say you don't have enough data or make a reasonable assumption.
Be concise and helpful.

{context_str}
"""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
