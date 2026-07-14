import os
import json
from openai import OpenAI
from pydantic import BaseModel, Field

# Initialize OpenAI client
client = None
if os.environ.get("OPENAI_API_KEY"):
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    except Exception:
        pass

class ParsedExpense(BaseModel):
    amount: float = Field(description="The numeric amount of the expense or income.")
    category: str = Field(description="The category. One of: Food, Petrol, Shopping, Salary, Bills, Entertainment, Others")
    description: str = Field(description="A short description of the transaction.")
    type: str = Field(description="Either 'expense' or 'income'")

def parse_expense_text(text: str) -> dict:
    if not client:
        return {"error": "AI not configured. Missing OPENAI_API_KEY"}
        
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Extract the expense details from the user's statement."},
                {"role": "user", "content": text}
            ],
            response_format=ParsedExpense,
        )
        # return as dict
        return completion.choices[0].message.parsed.model_dump()
    except Exception as e:
        return {"error": str(e)}

def get_ai_chat_response(prompt: str, expenses_context: list) -> str:
    if not client:
        return "AI not configured. Missing OPENAI_API_KEY"
        
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
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"
