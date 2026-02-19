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

from services.knowledge_manager import ensure_category_knowledge

def find_bargains(user_id: str, supabase: Client) -> List[Dict]:
    """
    Analyzes user's active subscriptions against market benchmarks to find cost savings.
    """
    print(f"Hunting bargains for user {user_id}...")
    
    # ... (cache check removed/skipped for brevity of editing, assuming we want fresh logic) ...
    # Note: If we want to keep cache check, we should put it here.
    # But for this 'AI Manager' demo, we might want to bypass it or rely on the knowledge manager's internal staleness check.
    
    # 2. Fetch active subscriptions (Real Logic)
    subs_response = supabase.table("subscriptions") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("is_active", True) \
        .execute()
        
    subscriptions = subs_response.data
    if not subscriptions:
        return []
        
    # --- KNOWLEDGE FRESHNESS CHECK ---
    # Before analyzing, ensure we have data for these categories
    categories = set(sub.get("category") for sub in subscriptions if sub.get("category"))
    for cat in categories:
        ensure_category_knowledge(cat, supabase)
    # ---------------------------------
        
    bargains = []
    
    for sub in subscriptions:
        sub_name = sub["name"]
        category = sub.get("category", "")
        
        # SEARCH STRATEGY: 
        # 1. Search by Category (Broader "Knowledge Base" approach)
        # This allows finding "DaVinci Resolve" (Software) when analyzing "Adobe" (Software)
        bench_response = supabase.table("market_benchmarks") \
            .select("*") \
            .eq("category", category) \
            .execute()
            
        benchmarks = bench_response.data
        
        if not benchmarks:
            # Fallback: Try fuzzy name match if category is missing or empty
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
    Uses LLM to compare current subscription vs benchmarks from the knowledge base.
    """
    
    current_svc = {
        "name": sub["name"],
        "price": sub["amount"],
        "category": sub.get("category"),
        "description": sub.get("merchant_name") or sub["name"]
    }
    
    # Filter only cheaper benchmarks to save context window and logic
    # We explicitly include items with price 0.0 (Free alternatives)
    cheaper_options = [b for b in benchmarks if float(b["monthly_price"]) < float(sub["amount"])]
    
    if not cheaper_options:
        return None
        
    prompt = f"""
    You are a savvy financial cost optimization assistant.
    
    Current Subscription:
    {json.dumps(current_svc, indent=2)}
    
    Available Cheaper Alternatives (Knowledge Base):
    {json.dumps(cheaper_options, indent=2)}
    
    Task:
    Analyze the alternatives to find a VALID substitute. Look for:
    1. **Direct Downgrade**: Same service, lower tier (e.g. Premium -> Standard).
    2. **Competitor Switch**: Different service, same function (e.g. Adobe -> DaVinci Resolve, Netflix -> Tubi).
    3. **Free Alternative**: A free tier or open-source equivalent.
    
    Rules:
    - The alternative MUST be functionality equivalent or a reasonable substitute for the Category.
    - If multiple exist, pick the ONE with the highest savings (lowest price).
    - Be realistic. Don't suggest "Spotify" for "Adobe Photoshop". Only suggest if they are true competitors.
    
    Return strictly JSON:
    {{
      "original": "Name of current service - $Price",
      "alternative": "Name of alternative (Tier) - $Price",
      "monthly_savings": number,
      "reason": "Brief, persuasive explanation (e.g. 'Switch to DaVinci Resolve (Free) for professional video editing without the monthly fee.')",
      "type": "Downgrade" | "Competitor Switch" | "Free Alternative"
    }}
    
    If no valid logical alternative exists, return {{ "monthly_savings": 0 }}.
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
