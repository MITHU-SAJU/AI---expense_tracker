from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str

class WebAuthnCredential(BaseModel):
    credential_id: str
    public_key: str
    sign_count: int
    transports: Optional[List[str]] = None

class User(BaseModel):
    id: str = Field(alias="_id")
    username: str
    hashed_password: str
    webauthn_credentials: List[WebAuthnCredential] = []
    current_challenge: Optional[str] = None
