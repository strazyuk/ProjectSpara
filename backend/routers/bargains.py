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

from datetime import datetime, timedelta

@router.get("/")
def get_bargain_opportunities(refresh: bool = False, user_payload: dict = Depends(verify_token)):
    user_id = user_payload.get("sub")
    
    try:
        # Check Cache first
        cache_response = supabase.table("bargain_cache") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()
            
        cached_data = None
        is_fresh = False
        
        if cache_response.data:
            cached_row = cache_response.data[0]
            last_checked = datetime.fromisoformat(cached_row["last_checked_at"].replace('Z', '+00:00'))
            
            # Check if cache is fresh (less than 24 hours old)
            if datetime.now(last_checked.tzinfo) - last_checked < timedelta(hours=24):
                is_fresh = True
                cached_data = cached_row["data"]
                
        # DECISION LOGIC:
        # 1. If NOT refreshing -> Return cache if exists (regardless of age), else fetch.
        # 2. If REFRESHING -> Only fetch if cache is OLD (>24h). If fresh, refuse to update (save cost).
        
        if not refresh:
            if cached_data is not None:
                return {"count": len(cached_data), "data": cached_data, "source": "cache"}
        
        # If refreshing, but data is already fresh (<24h), return it anyway to save API costs
        if refresh and is_fresh:
            print(f"Skipping refresh for {user_id}: Data is fresh (<24h old).")
            return {"count": len(cached_data), "data": cached_data, "source": "cache_fresh_hit"}

        # Perform Analysis (Expensive)
        opportunities = find_bargains(user_id, supabase)
        return {"count": len(opportunities), "data": opportunities, "source": "fresh_analysis"}
        
    except Exception as e:
        print(f"Error in get_bargain_opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))
