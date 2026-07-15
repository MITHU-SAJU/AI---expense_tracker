from app.repositories.expense_repository import (
    create_expense,
    get_all_expenses,
    delete_expense,
    update_expense,
    get_dashboard_stats
)


def add_expense(expense_data: dict, user_id: str):
    return create_expense(expense_data, user_id)


def fetch_expenses(user_id: str):
    return get_all_expenses(user_id)

def remove_expense(expense_id: str, user_id: str):
    return delete_expense(expense_id, user_id)

def edit_expense(expense_id: str, update_data: dict, user_id: str):
    return update_expense(expense_id, update_data, user_id)

def fetch_dashboard_stats(user_id: str):
    return get_dashboard_stats(user_id)