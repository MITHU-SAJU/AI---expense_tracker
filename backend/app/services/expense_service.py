from app.repositories.expense_repository import (
    create_expense,
    get_all_expenses,
    delete_expense,
    update_expense,
    get_dashboard_stats
)


def add_expense(expense_data: dict):
    return create_expense(expense_data)


def fetch_expenses():
    return get_all_expenses()

def remove_expense(expense_id: str):
    return delete_expense(expense_id)

def edit_expense(expense_id: str, update_data: dict):
    return update_expense(expense_id, update_data)

def fetch_dashboard_stats():
    return get_dashboard_stats()