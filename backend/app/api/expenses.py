from fastapi import APIRouter, HTTPException

from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.services.expense_service import (
    add_expense,
    fetch_expenses,
    remove_expense,
    edit_expense,
    fetch_dashboard_stats
)


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/")
def create(expense: ExpenseCreate):
    return add_expense(expense.model_dump())


@router.get("/")
def get_all():
    return fetch_expenses()

@router.delete("/{expense_id}")
def delete(expense_id: str):
    success = remove_expense(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found or invalid ID")
    return {"message": "Expense deleted successfully"}

@router.put("/{expense_id}")
def update(expense_id: str, expense: ExpenseUpdate):
    success = edit_expense(expense_id, expense.model_dump(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found or invalid ID")
    return {"message": "Expense updated successfully"}

@router.get("/dashboard/stats")
def get_dashboard_stats():
    return fetch_dashboard_stats()