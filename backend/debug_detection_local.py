import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.detector import detect_subscriptions

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials missing!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

if __name__ == "__main__":
    user_id = sys.argv[1] if len(sys.argv) > 1 else "b148b52a-03ce-4a6b-ad3b-82524de84eea"
    
    # Redirect stdout/stderr to file
    with open("debug_full.log", "w", encoding="utf-8") as f:
        original_stdout = sys.stdout
        original_stderr = sys.stderr
        sys.stdout = f
        sys.stderr = f
        
        try:
            print(f"Debugging detection for user: {user_id}")
            result = detect_subscriptions(user_id, supabase)
            print(f"\nFinal Result: {result}")
        except Exception as e:
            print(f"\nError: {e}")
        finally:
            sys.stdout = original_stdout
            sys.stderr = original_stderr
