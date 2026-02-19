from fastapi import APIRouter, Depends, HTTPException
from auth import verify_token
# Fix import path for services
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.detector import detect_subscriptions
from supabase import create_client, Client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.post("/detect")
def trigger_detection(user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        # Call the detection service
        # We need to pass the supabase client or initialize it inside
        # The service expects (user_id, supabase_client)
        result = detect_subscriptions(user_id, supabase)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_subscriptions(user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        response = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
