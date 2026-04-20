from fastapi import APIRouter, Depends, HTTPException
from auth import verify_token
from datetime import datetime, timedelta
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
        # 1. Fetch subscriptions
        sub_resp = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
        subscriptions = sub_resp.data
        
        if not subscriptions:
            return []
            
        # 2. Fetch recent transactions to project next billing
        # KISS: Look back 45 days to find the last occurrence
        forty_five_days_ago = (datetime.now() - timedelta(days=45)).date().isoformat()
        tx_resp = supabase.table("transactions") \
            .select("merchant_name, name, date") \
            .eq("user_id", user_id) \
            .gte("date", forty_five_days_ago) \
            .order("date", desc=True) \
            .execute()
        
        transactions = tx_resp.data
        
        # 3. Enrich subscriptions
        enriched_subs = []
        today = datetime.now().date()
        
        for sub in subscriptions:
            # Try to find last transaction date
            last_tx_date = None
            for tx in transactions:
                # Match by merchant_name or name
                if (sub.get("merchant_name") and tx.get("merchant_name") == sub.get("merchant_name")) or \
                   (tx.get("name") and sub.get("name") in tx.get("name")):
                    last_tx_date = datetime.strptime(tx["date"], "%Y-%m-%d").date()
                    break
            
            # Project next date
            if last_tx_date:
                next_date = last_tx_date + timedelta(days=30)
                # If the projected date is in the past, keep adding 30 days until it's future
                while next_date <= today:
                    next_date += timedelta(days=30)
            else:
                # Fallback (KISS): 30 days from today if no history found
                next_date = today + timedelta(days=30)
                
            sub["next_billing_date"] = next_date.isoformat()
            enriched_subs.append(sub)
            
        return enriched_subs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
