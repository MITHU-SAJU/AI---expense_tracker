from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str
    type: Literal["expense", "income"]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    type: Optional[Literal["expense", "income"]] = None
    updated_at: Optional[datetime] = None