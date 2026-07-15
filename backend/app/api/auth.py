import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.database.mongodb import db
from app.schemas.user import UserCreate, UserLogin, UserResponse, WebAuthnCredential
from app.services.auth_service import (
    verify_password, get_password_hash, create_access_token,
    SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES,
    generate_registration_options, verify_registration_response,
    generate_authentication_options, verify_authentication_response,
    RP_ID, RP_NAME, ORIGIN
)
from webauthn.helpers import bytes_to_base64url, base64url_to_bytes
from webauthn.helpers.structs import (
    RegistrationCredential, AuthenticationCredential,
    AuthenticatorSelectionCriteria, UserVerificationRequirement,
    ResidentKeyRequirement, AuthenticatorAttachment
)
from datetime import timedelta
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

users_collection = db.users
expenses_collection = db.expenses

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
        
    user["id"] = str(user["_id"])
    return user

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    existing_user = users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "hashed_password": hashed_password,
        "webauthn_credentials": []
    }
    
    # Insert new user
    result = users_collection.insert_one(new_user)
    
    # If this is the FIRST user ever registered, reassign all existing orphaned expenses to them
    # (as requested by user)
    user_count = users_collection.count_documents({})
    if user_count == 1:
        expenses_collection.update_many(
            {"user_id": {"$exists": False}},
            {"$set": {"user_id": str(result.inserted_id)}}
        )
        
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(db_user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "id": current_user["id"]}

# WEBAUTHN REGISTRATION
@router.get("/webauthn/register/generate")
async def webauthn_register_generate(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    req_origin = request.headers.get("origin") or ORIGIN
    from urllib.parse import urlparse
    parsed = urlparse(req_origin)
    req_rp_id = parsed.hostname or RP_ID
    
    # Generate random bytes for user ID if needed, or use string
    options = generate_registration_options(
        rp_id=req_rp_id,
        rp_name=RP_NAME,
        user_id=user_id.encode('utf-8'),
        user_name=current_user["username"],
        user_display_name=current_user["username"],
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=None,
            resident_key=ResidentKeyRequirement.REQUIRED,
            user_verification=UserVerificationRequirement.PREFERRED,
        ),
        exclude_credentials=[
            {"id": base64url_to_bytes(cred["credential_id"]), "type": "public-key"}
            for cred in current_user.get("webauthn_credentials", [])
        ]
    )
    
    # Store challenge
    challenge_b64 = bytes_to_base64url(options.challenge)
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"current_challenge": challenge_b64}}
    )
    
    from webauthn import options_to_json
    import json
    return json.loads(options_to_json(options))

@router.post("/webauthn/register/verify")
async def webauthn_register_verify(request: Request, credential: dict, current_user: dict = Depends(get_current_user)):
    expected_challenge_b64 = current_user.get("current_challenge")
    if not expected_challenge_b64:
        raise HTTPException(status_code=400, detail="Challenge not found")
        
    req_origin = request.headers.get("origin") or ORIGIN
    from urllib.parse import urlparse
    parsed = urlparse(req_origin)
    req_rp_id = parsed.hostname or RP_ID
        
    try:
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(expected_challenge_b64),
            expected_origin=req_origin,
            expected_rp_id=req_rp_id,
            require_user_verification=False
        )
        
        # Save credential
        new_cred = {
            "credential_id": bytes_to_base64url(verification.credential_id),
            "public_key": bytes_to_base64url(verification.credential_public_key),
            "sign_count": verification.sign_count,
            "transports": [] # simplification
        }
        
        users_collection.update_one(
            {"_id": current_user["_id"]},
            {
                "$push": {"webauthn_credentials": new_cred},
                "$unset": {"current_challenge": ""}
            }
        )
        return {"verified": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

challenges_collection = db.webauthn_challenges

# WEBAUTHN LOGIN
@router.get("/webauthn/login/generate")
async def webauthn_login_generate(request: Request):
    req_origin = request.headers.get("origin") or ORIGIN
    from urllib.parse import urlparse
    parsed = urlparse(req_origin)
    req_rp_id = parsed.hostname or RP_ID
        
    options = generate_authentication_options(
        rp_id=req_rp_id,
        user_verification=UserVerificationRequirement.PREFERRED,
    )
    
    challenge_b64 = bytes_to_base64url(options.challenge)
    
    # Store challenge globally
    challenges_collection.insert_one({"challenge": challenge_b64})
    
    from webauthn import options_to_json
    import json
    return json.loads(options_to_json(options))

@router.post("/webauthn/login/verify")
async def webauthn_login_verify(request: Request, credential: dict):
    req_origin = request.headers.get("origin") or ORIGIN
    from urllib.parse import urlparse
    import json
    
    parsed = urlparse(req_origin)
    req_rp_id = parsed.hostname or RP_ID
        
    try:
        # Extract challenge from client data
        client_data_bytes = base64url_to_bytes(credential["response"]["clientDataJSON"])
        client_data = json.loads(client_data_bytes.decode('utf-8'))
        client_challenge_b64 = client_data.get("challenge")
        
        # Verify challenge was generated by us
        stored_challenge = challenges_collection.find_one_and_delete({"challenge": client_challenge_b64})
        if not stored_challenge:
            raise HTTPException(status_code=400, detail="Invalid or expired challenge")
            
        # Find user by credential ID
        cred_id = credential["id"]
        user = users_collection.find_one({"webauthn_credentials.credential_id": cred_id})
        
        if not user:
            raise HTTPException(status_code=400, detail="Credential not found in database")
            
        stored_cred = next(
            (c for c in user.get("webauthn_credentials", []) 
             if c["credential_id"] == cred_id),
            None
        )

        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(client_challenge_b64),
            expected_origin=req_origin,
            expected_rp_id=req_rp_id,
            credential_public_key=base64url_to_bytes(stored_cred["public_key"]),
            credential_current_sign_count=stored_cred["sign_count"],
            require_user_verification=False,
        )
        
        # Update sign count
        users_collection.update_one(
            {"_id": user["_id"], "webauthn_credentials.credential_id": credential["id"]},
            {
                "$set": {"webauthn_credentials.$.sign_count": verification.new_sign_count}
            }
        )
        
        # Login success, generate JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"], "user_id": str(user["_id"])}, 
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "username": user["username"]}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
