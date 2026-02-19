import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
from groq import Groq
from supabase import Client

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Llama 3 model (Updated to 3.3 Versatile as 3.0 is decommissioned)
MODEL = "llama-3.3-70b-versatile"

def detect_subscriptions(user_id: str, supabase: Client):
    """
    Main function to detect subscriptions for a user.
    1. Fetch transactions
    2. Group by merchant
    3. Filter candidates
    4. Analyze with LLM
    5. Save results
    """
    print(f"Detecting subscriptions for user {user_id}...")
    
    # 1. Fetch transactions (last 6 months)
    six_months_ago = (datetime.now() - timedelta(days=180)).date().isoformat()
    
    response = supabase.table("transactions") \
        .select("*") \
        .eq("user_id", user_id) \
        .gte("date", six_months_ago) \
        .execute()
        
    transactions = response.data
    
    if not transactions:
        print("No transactions found.")
        return []

    # 2. Group by merchant/description (Deterministic Step)
    groups = _group_transactions(transactions)
    
    # 3. Filter candidates (Must have at least 2 occurrences)
    candidates = [
        {"merchant": k, "txs": v} 
        for k, v in groups.items() 
        if len(v) >= 2
    ]
    
    print(f"DEBUG: Found {len(candidates)} candidate groups: {[c['merchant'] for c in candidates]}")
    
    # 4. Analyze with LLM
    detected_subscriptions = []
    
    for candidate in candidates:
        print(f"DEBUG: Analyzing candidate: {candidate['merchant']} with {len(candidate['txs'])} txs")
        result = _analyze_with_llm(candidate)
        print(f"DEBUG: LLM Result for {candidate['merchant']}: {result}")
        
        if result and result.get("is_subscription"):
            detected_subscriptions.append({
                "original_group": candidate["merchant"],
                **result
            })
            
    # 5. Save to DB
    saved_count = 0
    for sub in detected_subscriptions:
        # Determine average amount
        txs = groups[sub["original_group"]]
        amounts = [t["amount"] for t in txs]
        avg_amount = sum(amounts) / len(amounts)
        
        # Determine frequency (simplistic)
        frequency = "monthly" # Defaulting for now, could be improved with date math
        
        data = {
            "user_id": user_id,
            "name": sub["normalized_name"],
            "merchant_name": sub["original_group"],
            "amount": avg_amount,
            "category": sub["category"],
            "frequency": frequency,
            "is_active": True
        }
        
        try:
            # Upsert based on (user_id, name) or similar logic to avoid duplicates?
            # For now, just insert. In real app, we'd check for existing active sub.
            # Using name as unique constraint might be risky.
            # Ideally we'd have a specialized ID logic.
            # Let's check if one exists with same name.
            existing = supabase.table("subscriptions").select("id").eq("user_id", user_id).eq("name", sub["normalized_name"]).execute()
            
            if existing.data:
                print(f"Subscription {sub['normalized_name']} already exists.")
            else:
                supabase.table("subscriptions").insert(data).execute()
                saved_count += 1
                
        except Exception as e:
            print(f"Error saving subscription {sub['normalized_name']}: {e}")
            
    return {"detected": len(detected_subscriptions), "saved": saved_count}

def _group_transactions(transactions: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Groups transactions by a simplified merchant name.
    """
    groups = defaultdict(list)
    
    for t in transactions:
        # Use merchant_name if available, else name
        key = t.get("merchant_name") or t.get("name")
        if not key:
            continue
            
        # Basic normalization: limit length, lowercase for key
        # Remove common suffixes like "Inc", ".com", etc. for better grouping
        key_normalized = key.strip().lower()
        key_normalized = key_normalized.replace(".com", "").replace(" inc.", "").replace(" inc", "")
        
        # Simple clustering could go here (e.g. fuzzy match).
        # For now, approximate string match on merchant/name.
        groups[key_normalized].append(t)
        
    return groups

def _analyze_with_llm(candidate: Dict) -> Optional[Dict]:
    """
    Sends a candidate group to Groq to determine if it's a subscription.
    """
    merchant = candidate["merchant"]
    txs = candidate["txs"]
    
    # optimize payload
    simplified_txs = [
        {"date": t["date"], "amount": t["amount"], "name": t["name"]}
        for t in txs
    ]
    
    prompt = f"""
    You are a financial classifier. Analyze these transactions to see if they represent a recurring subscription.
    
    Transactions for '{merchant}':
    {json.dumps(simplified_txs, indent=2)}
    
    Return strictly JSON with these fields:
    - is_subscription (bool)
    - normalized_name (string, e.g. 'Netflix')
    - category (string, e.g. 'Entertainment', 'Utilities', 'Software')
    - confidence (float 0-1)
    
    If it is NOT a subscription, set is_subscription to false.
    """
    
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful JSON-speaking financial assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"LLM Error for {merchant}: {e}")
        return None
