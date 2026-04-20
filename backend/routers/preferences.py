from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import verify_token
import os
from supabase import create_client, Client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class BudgetUpdate(BaseModel):
    monthly_budget: float

@router.get("/")
def get_preferences(user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        response = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        if response.data:
            return response.data[0]
        # Return default if not found
        return {"user_id": user_id, "monthly_budget": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/")
def update_preferences(budget_data: BudgetUpdate, user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        # Upsert logic
        data = {
            "user_id": user_id,
            "monthly_budget": budget_data.monthly_budget,
            "updated_at": "now()"
        }
        response = supabase.table("user_preferences").upsert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
