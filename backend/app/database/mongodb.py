from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL, tz_aware=True)
db = client[settings.DATABASE_NAME]