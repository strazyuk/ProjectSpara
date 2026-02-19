import os
import sys
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Add parent dir to path if run from backend dir
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials missing!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed_transactions(user_id):
    print(f"Seeding data for user: {user_id}")
    
    # TEST CASES FOR TIMELINE FILTERING:
    # 1. Netflix: Recent Only (Started 5 months ago) -> Should appear in 6M & All Time
    # 2. Gym ABC: Historic Only (Cancelled 7 months ago) -> Should ONLY appear in All Time, NOT 6M
    # 3. AWS: Continuous (Active for 2 years) -> Should appear in both
    
    today = datetime.now()
    transactions = []
    
    # Generate 24 months of data (2 Years)
    for i in range(24):
        # Approximate 30 days per month
        date = (today - timedelta(days=30 * i)).date().isoformat()
        
        # 1. Netflix - NEW Subscription (Only last 5 months, i < 6)
        if i < 6:
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_netflix_{i}",
                "account_id": "seed_acc_1",
                "name": "Netflix.com",
                "merchant_name": "Netflix",
                "amount": 15.49,
                "date": date,
                "category": "Entertainment",
                "raw_json": {"source": "seed_script"}
            })
        
        # 2. Gym ABC - OLD Subscription (Cancelled 6 months ago, i >= 6)
        # This checks if the Filter correctly excludes these for "6 Months" view
        if i >= 6:
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_gym_{i}",
                "account_id": "seed_acc_1",
                "name": "Gym ABC",
                "merchant_name": "Gym ABC",
                "amount": 49.99,
                "date": date,
                "category": "Health",
                "raw_json": {"source": "seed_script"}
            })

        # 3. AWS - CONTINUOUS Subscription (All 24 months)
        # Variable amount to show trends
        base_aws = 35.00
        variation = (i % 3) * 5.0 
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_aws_{i}",
            "account_id": "seed_acc_1",
            "name": "AWS Service Bill",
            "merchant_name": "Amazon Web Services",
            "amount": base_aws + variation,
            "date": date,
            "category": "Technology",
            "raw_json": {"source": "seed_script"}
        })
        
        # 4. Spotify - Intermittent (Every other month)
        if i % 2 == 0:
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_spotify_{i}",
                "account_id": "seed_acc_1",
                "name": "Spotify Family",
                "merchant_name": "Spotify",
                "amount": 16.99,
                "date": date,
                "category": "Entertainment",
                "raw_json": {"source": "seed_script"}
            })

    print(f"Prepared {len(transactions)} synthetic transactions.")
    
    success_count = 0
    for t in transactions:
        try:
            supabase.table("transactions").upsert(t, on_conflict="teller_transaction_id").execute()
            success_count += 1
        except Exception as e:
            print(f"Error inserting: {e}")
            
    print(f"Successfully seeded {success_count} transactions.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python seed_data.py <USER_UUID>")
        print("You can find your User UUID in Supabase Auth or via the /me endpoint.")
        exit(1)
        
    user_id = sys.argv[1]
    seed_transactions(user_id)
