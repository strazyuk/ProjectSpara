import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from groq import Groq
from supabase import Client

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

MODEL = "llama-3.3-70b-versatile"

def find_bargains(user_id: str, supabase: Client) -> List[Dict]:
    """
    Analyzes user's active subscriptions against market benchmarks to find cost savings.
    """
    print(f"Hunting bargains for user {user_id}...")
    
    # 1. Check Cache (Optimization)
    try:
        cache_response = supabase.table("bargain_cache") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()
            
        if cache_response.data:
            cached = cache_response.data[0]
            last_checked = datetime.fromisoformat(cached["last_checked_at"].replace('Z', '+00:00'))
            
            # 12-hour cooldown
            if datetime.now(last_checked.tzinfo) - last_checked < timedelta(hours=12):
                print(f"Serving bargains from cache for {user_id}")
                return cached["data"]
    except Exception as e:
        print(f"Cache check failed: {e}")

    # 2. Fetch active subscriptions (Real Logic)
    subs_response = supabase.table("subscriptions") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("is_active", True) \
        .execute()
        
    subscriptions = subs_response.data
    if not subscriptions:
        return []
        
    bargains = []
    
    for sub in subscriptions:
        sub_name = sub["name"]
        
        # Find relevant benchmarks
        bench_response = supabase.table("market_benchmarks") \
            .select("*") \
            .ilike("service_name", f"%{sub_name}%") \
            .execute()
            
        benchmarks = bench_response.data
        
        if not benchmarks:
            continue
            
        # Analyze with LLM
        opportunity = _analyze_bargain_opportunity(sub, benchmarks)
        
        if opportunity:
            opportunity["subscription_id"] = sub["id"]
            bargains.append(opportunity)
    
    # 3. Update Cache
    try:
        supabase.table("bargain_cache").upsert({
            "user_id": user_id,
            "data": bargains,
            "last_checked_at": datetime.now().isoformat(),
            "is_rate_limited": False
        }).execute()
    except Exception as e:
        print(f"Failed to update cache: {e}")
            
    return bargains

def _analyze_bargain_opportunity(sub: Dict, benchmarks: List[Dict]) -> Optional[Dict]:
    """
    Uses LLM to compare current subscription vs benchmarks.
    """
    
    current_svc = {
        "name": sub["name"],
        "price": sub["amount"],
        "description": sub.get("merchant_name") or sub["name"] # Context
    }
    
    # Filter only cheaper benchmarks to save context window and logic
    cheaper_options = [b for b in benchmarks if float(b["monthly_price"]) < float(sub["amount"])]
    
    if not cheaper_options:
        return None
        
    prompt = f"""
    You are a cost optimization assistant.
    
    Current Subscription:
    {json.dumps(current_svc, indent=2)}
    
    Available Cheaper Alternatives (Benchmarks):
    {json.dumps(cheaper_options, indent=2)}
    
    Task:
    1. Identify if any of the alternatives are a valid "downgrade" or "switch" for the same service (e.g. Premium to Basic).
    2. If a valid dictionary is found, return the SINGLE best saving opportunity.
    3. Calculate monthly savings.
    
    Return strictly JSON:
    {{
      "original": "Name of current tier (inferred from price/name) - $Price",
      "alternative": "Name of alternative tier - $Price",
      "monthly_savings": number,
      "reason": "Brief explanation (e.g. 'Switch to ad-supported plan')"
    }}
    
    If no logical alternative exists (e.g. current is already cheapest), return {{ "monthly_savings": 0 }}.
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
        result = json.loads(content)
        
        if result.get("monthly_savings", 0) > 0:
            return result
        return None
        
    except Exception as e:
        print(f"Error analyzing bargain for {sub['name']}: {e}")
        return None
