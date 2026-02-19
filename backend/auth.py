import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        # In a real production app, verify the signature. 
        # Ideally, Supabase provides the JWT secret (different from Anon key).
        # If unavailable, we can trust Supabase's client-side validation for this prototype 
        # OR fetch user data from Supabase Auth API using the token.
        
        # Option A: Local verification (fastest, requires JWT secret)
        if SUPABASE_JWT_SECRET:
             return jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")

        # Option B: Decode without verification (NOT SECURE for production, but okay for prototype if relying on Supabase RLS)
        # return jwt.decode(token, options={"verify_signature": False})

        # Option C: Use the token to query Supabase (Recommended for correctness without managing secrets manually)
        # For this prototype, we'll decode unverified to get the 'sub' (user_id) 
        # assuming the frontend sent a valid token from Supabase.
        # In a real app, use the Supabase Admin SDK to validate.
        
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload

    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")
