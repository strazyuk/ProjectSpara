import os
import sys
import json
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from services.detector import detect_subscriptions
from services.knowledge_manager import ensure_category_knowledge
from services.bargain_hunter import find_bargains

def run_audit():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(url, key)
    
    test_user_id = str(uuid.uuid4()) # Fresh user for every audit to avoid conflicts
    
    print(f"\n=== STARTING AI PIPELINE AUDIT (User: {test_user_id}) ===")

    # 1. TEST DETECTOR
    print("\n--- Phase 1: Subscription Detection ---")
    mock_txs = [
        {"user_id": test_user_id, "amount": 13.99, "name": "Disney Plus Monthly", "date": "2026-01-01"},
        {"user_id": test_user_id, "amount": 13.99, "name": "Disney Plus Monthly", "date": "2026-02-01"},
        {"user_id": test_user_id, "amount": 13.99, "name": "Disney Plus Monthly", "date": "2026-03-01"},
    ]
    try:
        print("Inserting mock transactions...")
        supabase.table("transactions").insert(mock_txs).execute()
        print("Done.")
        
        print("Running detector...")
        results = detect_subscriptions(test_user_id, supabase)
        print(f"Detection Result: {results}")
    except Exception as e:
        print(f"ERROR in Phase 1: {e}")

    # 2. TEST KNOWLEDGE MANAGER
    print("\n--- Phase 2: Knowledge Manager (Market Research) ---")
    category = "Streaming Video"
    try:
        print(f"Researching category: {category}")
        ensure_category_knowledge(category, supabase)
        bench_count = supabase.table("market_benchmarks").select("count", count="exact").eq("category", category).execute()
        print(f"Benchmarks found for '{category}': {bench_count.count}")
    except Exception as e:
        print(f"ERROR in Phase 2: {e}")

    # 3. TEST BARGAIN HUNTER
    print("\n--- Phase 3: Bargain Hunter (Savings Analysis) ---")
    try:
        bargains = find_bargains(test_user_id, supabase)
        print(f"Found {len(bargains)} bargain opportunities:")
        for b in bargains:
            print(f" - {b.get('original')} -> {b.get('alternative')} (Savings: ${b.get('monthly_savings')})")
            print(f"   Reason: {b.get('reason')}")
    except Exception as e:
        print(f"ERROR in Phase 3: {e}")

    print("\n=== AUDIT COMPLETE ===")

if __name__ == "__main__":
    run_audit()
