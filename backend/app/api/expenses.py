from fastapi import APIRouter, HTTPException, Depends, Query
from app.api.auth import get_current_user

from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.services.expense_service import (
    add_expense,
    fetch_expenses,
    remove_expense,
    edit_expense,
    fetch_dashboard_stats,
    fetch_expenses_paginated
)


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/")
def create(expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    return add_expense(expense.model_dump(), current_user["id"])


@router.get("/")
def get_all(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200, description="Number of expenses to return"),
    skip: int = Query(default=0, ge=0, description="Number of expenses to skip")
):
    return fetch_expenses_paginated(current_user["id"], limit=limit, skip=skip)

@router.delete("/{expense_id}")
def delete(expense_id: str, current_user: dict = Depends(get_current_user)):
    success = remove_expense(expense_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found or invalid ID")
    return {"message": "Expense deleted successfully"}

@router.put("/{expense_id}")
def update(expense_id: str, expense: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    success = edit_expense(expense_id, expense.model_dump(exclude_unset=True), current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found or invalid ID")
    return {"message": "Expense updated successfully"}

@router.get("/dashboard/stats")
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    return fetch_dashboard_stats(current_user["id"])