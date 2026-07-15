from app.database.collections import expense_collection
from bson import ObjectId
from datetime import datetime, timezone


def create_expense(expense_data: dict, user_id: str):
    expense_data["created_at"] = datetime.now(timezone.utc)
    expense_data["updated_at"] = datetime.now(timezone.utc)
    expense_data["user_id"] = user_id
    result = expense_collection.insert_one(expense_data)

    expense_data["_id"] = str(result.inserted_id)

    return expense_data


def get_all_expenses(user_id: str):
    expenses = []

    # Sort by created_at descending (latest first)
    for expense in expense_collection.find({"user_id": user_id}).sort("created_at", -1):
        expense["_id"] = str(expense["_id"])
        expenses.append(expense)

    return expenses

def delete_expense(expense_id: str, user_id: str):
    result = expense_collection.delete_one({"_id": ObjectId(expense_id), "user_id": user_id})
    return result.deleted_count > 0

def update_expense(expense_id: str, update_data: dict, user_id: str):
    update_data["updated_at"] = datetime.now(timezone.utc)
    # Remove any None values so we don't overwrite existing data with None
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    result = expense_collection.update_one(
        {"_id": ObjectId(expense_id), "user_id": user_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

def get_dashboard_stats(user_id: str):
    pipeline = [
        {
            "$match": {"user_id": user_id}
        },
        {
            "$group": {
                "_id": "$type",
                "totalAmount": {"$sum": "$amount"},
                "count": {"$sum": 1}
            }
        }
    ]
    
    results = list(expense_collection.aggregate(pipeline))
    
    total_expenses = 0
    total_income = 0
    transactions = 0
    
    for r in results:
        if r["_id"] == "expense":
            total_expenses = r["totalAmount"]
            transactions += r["count"]
        elif r["_id"] == "income":
            total_income = r["totalAmount"]
            transactions += r["count"]
            
    balance = total_income - total_expenses
    
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    
    today_pipeline = [
        {"$match": {"type": "expense", "created_at": {"$gte": today_start}, "user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    today_res = list(expense_collection.aggregate(today_pipeline))
    today_expenses = today_res[0]["total"] if today_res else 0
    
    month_pipeline = [
        {"$match": {"type": "expense", "created_at": {"$gte": month_start}, "user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    month_res = list(expense_collection.aggregate(month_pipeline))
    month_expenses = month_res[0]["total"] if month_res else 0

    return {
        "total_expenses": total_expenses,
        "total_income": total_income,
        "balance": balance,
        "total_transactions": transactions,
        "today_expenses": today_expenses,
        "this_month_expenses": month_expenses
    }