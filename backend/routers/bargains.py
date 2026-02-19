from fastapi import APIRouter, Depends, HTTPException
from auth import verify_token
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.bargain_hunter import find_bargains
from supabase import create_client, Client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.get("/")
def get_bargain_opportunities(user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        # Get active subscriptions for this user
        # Note: In a real app we might cache this or store bargains in a table 
        # instead of computing on-the-fly every time. 
        # For this prototype, on-the-fly is fine (maybe slow).
        
        # Optimization: We can check if we already have computed bargains recently.
        # But let's keep it simple: Compute on request.
        
        opportunities = find_bargains(user_id, supabase)
        return {"count": len(opportunities), "data": opportunities}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
