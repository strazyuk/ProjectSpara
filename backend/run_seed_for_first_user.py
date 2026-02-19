
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from seed_data import seed_transactions

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials missing!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def main():
    print("Attempting to get user via Auth...")
    email = "seed_test@example.com"
    password = "password123"
    
    try:
        # Try signing up
        res = supabase.auth.sign_up({"email": email, "password": password})
        if res.user:
            print(f"Created/Found user: {res.user.id}")
            seed_transactions(res.user.id)
            return
            
    except Exception as e:
        print(f"Sign up incomplete or failed: {e}")
        
    try:
        # Try signing in if sign up failed (likely already exists)
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.user:
            print(f"Signed in as: {res.user.id}")
            seed_transactions(res.user.id)
            return
    except Exception as e:
        print(f"Sign in failed: {e}")
        
    print("Could not get a user ID. Please ensure the backend is running and Supabase is reachable.")

if __name__ == "__main__":
    main()
