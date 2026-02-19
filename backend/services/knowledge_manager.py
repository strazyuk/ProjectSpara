import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from groq import Groq
from supabase import Client

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Use a model capable of good JSON generation
MODEL = "llama-3.3-70b-versatile"

def ensure_category_knowledge(category: str, supabase: Client):
    """
    Checks if we have fresh benchmarks for this category.
    If not, uses AI to research and populate the database.
    """
    if not category:
        return

    # print(f"[KnowledgeManager] Checking knowledge for category: '{category}'...")

    # 1. Check existing freshness
    # We look for ANY benchmark in this category created/updated recently.
    try:
        response = supabase.table("market_benchmarks") \
            .select("created_at") \
            .eq("category", category) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
            
        if response.data:
            last_created = response.data[0]['created_at']
            # Parse timestamp (Simple ISO format often works, but handle Z)
            last_created_dt = datetime.fromisoformat(last_created.replace('Z', '+00:00'))
            
            # 24 Hour Freshness Policy (Cost Efficiency)
            if datetime.now(last_created_dt.tzinfo) - last_created_dt < timedelta(hours=24):
                 # print(f"[KnowledgeManager] Knowledge for '{category}' is fresh. Skipping AI research.")
                 return
    except Exception as e:
        print(f"[KnowledgeManager] freshness check failed: {e}")

    # 2. Fetch from AI
    print(f"[KnowledgeManager] Knowledge for '{category}' is missing or stale. Researching with AI...")
    new_benchmarks = _research_category(category)
    
    if new_benchmarks:
        print(f"[KnowledgeManager] Found {len(new_benchmarks)} items. Updating database...")
        
        # 3. Insert into Database
        count = 0
        for b in new_benchmarks:
            try:
                # Avoid exact duplicates
                existing = supabase.table("market_benchmarks") \
                    .select("id") \
                    .eq("service_name", b["service_name"]) \
                    .eq("tier_name", b["tier_name"]) \
                    .execute()
                    
                if not existing.data:
                    supabase.table("market_benchmarks").insert(b).execute()
                    count += 1
            except Exception as e:
                print(f"Error inserting benchmark {b.get('service_name')}: {e}")
        
        print(f"[KnowledgeManager] Database updated with {count} new benchmarks for '{category}'.")

def _research_category(category: str) -> List[Dict]:
    """
    Uses LLM to generate a list of benchmarks and competitors for a given category.
    """
    prompt = f"""
    You are a market research assistant.
    Generate a JSON list of popular subscription services and their CHEAPER or FREE COMPETITORS for the category: "{category}".
    
    Include:
    1. The most popular high-end services (e.g. Adobe, Netflix, Spotify).
    2. Their mid-range competitors.
    3. Their FREE or Open Source alternatives (Crucially important!).
    
    Format the output as a JSON object with a key "benchmarks" containing a list of objects like this:
    {{
      "benchmarks": [
          {{
            "service_name": "Name",
            "tier_name": "Tier (e.g. Premium, Free, Basic)",
            "monthly_price": 0.00,
            "category": "{category}",
            "features": {{ "key": "value" }}
          }}
      ]
    }}
    
    Return ONLY VALID JSON. No markdown formatting.
    """
    
    try:
        completion = client.chat.completions.create(
             model=MODEL,
             messages=[
                 {"role": "system", "content": "You are a helpful JSON-speaking market researcher."},
                 {"role": "user", "content": prompt}
             ],
             response_format={"type": "json_object"}
         )
        content = completion.choices[0].message.content
        data = json.loads(content)
        
        if "benchmarks" in data:
            return data["benchmarks"]
        
        # Fallback if structure is slightly different
        for key in data:
            if isinstance(data[key], list):
                return data[key]
                
        return []
        
    except Exception as e:
        print(f"[KnowledgeManager] AI Research failed: {e}")
        return []
