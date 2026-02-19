import os
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from auth import verify_token
from teller_service import client as teller_client
from supabase import create_client, Client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.post("/sync")
def sync_transactions(payload: dict, user_payload: dict = Depends(verify_token)):
    access_token = payload.get("access_token") # Teller access token
    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access_token")
    
    user_id = user_payload.get("sub")

    try:
        # 1. List accounts to get account_ids
        accounts = teller_client.list_accounts(access_token)
        
        total_synced = 0
        
        for account in accounts:
            account_id = account['id']
            # account_name = account['name']
            
            # 2. Fetch transactions for each account
            # Teller provides 90 days of history by default for free tier
            transactions = teller_client.get_transactions(access_token, account_id)
            
            for t in transactions:
                # Map Teller transaction to our DB schema
                # Teller trans keys: id, account_id, amount, date, description, type, status, links
                
                amount = float(t['amount'])
                # Teller amounts are strings. Positive for credit, negative for debit
                # We might want to standardize. Let's keep as is for now or flip based on schema preference.
                # Usually expense = positive in personal finance apps, but banking APIs vary.
                # Plaid: + is money out. Teller: - is money out.
                # Let's flip Teller to match Plaid convention if desired, or just store raw.
                # For now, storing raw magnitude might be safer, but let's just convert to float.
                
                data = {
                    "user_id": user_id,
                    "teller_transaction_id": t['id'],
                    "account_id": t['account_id'],
                    "name": t['description'], 
                    "merchant_name": t.get('details', {}).get('counterparty', {}).get('name'), # basic attempt to parse
                    "amount": amount,
                    "date": t['date'],
                    "category": t.get('details', {}).get('category'), # Teller might not provide this in basic
                    "raw_json": t
                }
                
                try:
                    supabase.table("transactions").upsert(data, on_conflict="teller_transaction_id").execute()
                    total_synced += 1
                except Exception as e:
                    print(f"Error saving transaction {t['id']}: {e}")

        return {"message": "Sync complete", "total_synced": total_synced}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
