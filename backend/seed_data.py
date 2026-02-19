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
    
    # 1. Netflix (Monthly, $15.49)
    # 2. Spotify (Monthly, $10.99)
    # 3. AWS (Monthly, Variable but similar)
    # 4. Random Coffee (Irregular)
    
    today = datetime.now()
    transactions = []
    
    # Generate 24 months of data (2 Years)
    for i in range(24):
        date = (today - timedelta(days=30 * i)).date().isoformat()
        
        # Simulate different spending phases
        # Phase 1: Recent (0-6 months) - High spending
        # Phase 2: Mid (6-12 months) - Moderate spending
        # Phase 3: Old (12+ months) - Lower spending
        multiplier = 1.0
        if i > 6: multiplier = 0.9
        if i > 12: multiplier = 0.8

        
        # Subscription 1: Netflix (Started 1 year ago)
        if i < 12:
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
        
        # Subscription 2: Spotify Family (Cancelled 6 months ago)
        # Only add if we are looking at history older than 6 months (i >= 6)
        if i >= 6:
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

        # Subscription 3: AWS (Variable amount)
        base_aws = 35.00
        variation = (i % 3) * 1.5 
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
        
        # New Case: Hulu No Ads (Bargain opportunity -> With Ads)
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_hulu_{i}",
            "account_id": "seed_acc_1",
            "name": "Hulu No Ads",
            "merchant_name": "Hulu",
            "amount": 17.99,
            "date": date,
            "category": "Entertainment",
            "raw_json": {"source": "seed_script"}
        })

        # New Case: Google One Premium (Bargain opportunity -> Basic)
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_google_{i}",
            "account_id": "seed_acc_1",
            "name": "Google One",
            "merchant_name": "Google",
            "amount": 9.99,
            "date": date,
            "category": "Technology",
            "raw_json": {"source": "seed_script"}
        })

        # New Case: Apple.com/bill (Ambiguous - detection test)
        # $10.99 matches Apple Music Individual
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_apple_{i}",
            "account_id": "seed_acc_1",
            "name": "Apple.com/bill",
            "merchant_name": "Apple",
            "amount": 10.99,
            "date": date,
            "category": "Entertainment",
            "raw_json": {"source": "seed_script"}
        })

        # Tricky Case 1: Gym Membership (Name variations)
        gym_name = "Gym ABC" if i % 2 == 0 else "Gym ABC Inc."
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_gym_{i}",
            "account_id": "seed_acc_1",
            "name": gym_name,
            "merchant_name": "Gym ABC",
            "amount": 49.99,
            "date": date,
            "category": "Health",
            "raw_json": {"source": "seed_script"}
        })

        # Tricky Case 2: Adobe Creative Cloud (Currency fluctuation simulation)
        adobe_amount = 54.99 + (0.01 * (i % 3 - 1))
        transactions.append({
            "user_id": user_id,
            "teller_transaction_id": f"seed_adobe_{i}",
            "account_id": "seed_acc_1",
            "name": "Adobe Creative Cloud",
            "merchant_name": "Adobe",
            "amount": round(adobe_amount, 2),
            "date": date,
            "category": "Software",
            "raw_json": {"source": "seed_script"}
        })

        # False Positive Candidate: Uber (Frequent but not periodic subscription)
        if i % 2 == 0:
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_uber_{i}_a",
                "account_id": "seed_acc_1",
                "name": "Uber Ride",
                "merchant_name": "Uber",
                "amount": 12.50 + (i * 2),
                "date": (datetime.now() - timedelta(days=30 * i + 5)).date().isoformat(),
                "category": "Transport",
                "raw_json": {"source": "seed_script"}
            })
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_uber_{i}_b",
                "account_id": "seed_acc_1",
                "name": "Uber Ride",
                "merchant_name": "Uber",
                "amount": 25.00 + (i),
                "date": (datetime.now() - timedelta(days=30 * i + 15)).date().isoformat(),
                "category": "Transport",
                "raw_json": {"source": "seed_script"}
            })

        # Irregular: Coffee (Local Cafe) - sometimes
        if i % 2 == 0:
            transactions.append({
                "user_id": user_id,
                "teller_transaction_id": f"seed_coffee_{i}",
                "account_id": "seed_acc_1",
                "name": "Joe's Coffee",
                "merchant_name": "Joes Coffee",
                "amount": 4.50,
                "date": (today - timedelta(days=30 * i + 2)).date().isoformat(),
                "category": "Food & Drink",
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
