import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def check_services():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: Supabase credentials missing")
        return

    supabase: Client = create_client(url, key)
    
    tables = ["transactions", "subscriptions", "market_benchmarks", "bargain_cache"]
    print("--- Supabase Table Status ---")
    for table in tables:
        try:
            res = supabase.table(table).select("count", count="exact").limit(1).execute()
            count = res.count if res.count is not None else 0
            print(f"Table '{table}': OK (Rows: {count})")
        except Exception as e:
            print(f"Table '{table}': FAILED - {e}")

    print("\n--- Groq API Status ---")
    try:
        from groq import Groq
        groq_key = os.environ.get("GROQ_API_KEY")
        if not groq_key:
            print("ERROR: GROQ_API_KEY missing")
        else:
            client = Groq(api_key=groq_key)
            # Test a small completion
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            print(f"Groq API: OK (Response: '{completion.choices[0].message.content.strip()}')")
    except Exception as e:
        print(f"Groq API: FAILED - {e}")

if __name__ == "__main__":
    check_services()
