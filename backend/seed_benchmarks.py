import os
import sys
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

def seed_benchmarks():
    print("Seeding market benchmarks...")
    
    benchmarks = [
        # Streaming - Video
        {"service_name": "Netflix", "tier_name": "Standard with ads", "monthly_price": 6.99, "category": "Entertainment", "features": {"ads": True, "resolution": "1080p"}},
        {"service_name": "Netflix", "tier_name": "Standard", "monthly_price": 15.49, "category": "Entertainment", "features": {"ads": False, "resolution": "1080p"}},
        {"service_name": "Netflix", "tier_name": "Premium", "monthly_price": 22.99, "category": "Entertainment", "features": {"ads": False, "resolution": "4K"}},
        
        {"service_name": "Hulu", "tier_name": "With Ads", "monthly_price": 7.99, "category": "Entertainment", "features": {"ads": True}},
        {"service_name": "Hulu", "tier_name": "No Ads", "monthly_price": 17.99, "category": "Entertainment", "features": {"ads": False}},
        
        {"service_name": "Disney+", "tier_name": "Basic (With Ads)", "monthly_price": 7.99, "category": "Entertainment", "features": {"ads": True}},
        {"service_name": "Disney+", "tier_name": "Premium (No Ads)", "monthly_price": 13.99, "category": "Entertainment", "features": {"ads": False}},
        
        {"service_name": "HBO Max", "tier_name": "With Ads", "monthly_price": 9.99, "category": "Entertainment", "features": {"ads": True}},
        {"service_name": "HBO Max", "tier_name": "Ad-Free", "monthly_price": 15.99, "category": "Entertainment", "features": {"ads": False}},

        # Streaming - Audio
        {"service_name": "Spotify", "tier_name": "Individual", "monthly_price": 10.99, "category": "Entertainment", "features": {"users": 1}},
        {"service_name": "Spotify", "tier_name": "Duo", "monthly_price": 14.99, "category": "Entertainment", "features": {"users": 2}},
        {"service_name": "Spotify", "tier_name": "Family", "monthly_price": 16.99, "category": "Entertainment", "features": {"users": 6}},
        
        {"service_name": "Apple Music", "tier_name": "Individual", "monthly_price": 10.99, "category": "Entertainment", "features": {"users": 1}},
        {"service_name": "Apple Music", "tier_name": "Family", "monthly_price": 16.99, "category": "Entertainment", "features": {"users": 6}},

        # Software
        {"service_name": "Adobe Creative Cloud", "tier_name": "All Apps", "monthly_price": 54.99, "category": "Software", "features": {"apps": "All"}},
        {"service_name": "Adobe Creative Cloud", "tier_name": "Photography Plan", "monthly_price": 9.99, "category": "Software", "features": {"apps": "Lightroom, Photoshop"}},
        
        {"service_name": "Microsoft 365", "tier_name": "Personal", "monthly_price": 6.99, "category": "Software", "features": {"users": 1}},
        {"service_name": "Microsoft 365", "tier_name": "Family", "monthly_price": 9.99, "category": "Software", "features": {"users": 6}},
        
        # Cloud
        {"service_name": "Google One", "tier_name": "Basic (100 GB)", "monthly_price": 1.99, "category": "Technology", "features": {"storage": "100GB"}},
        {"service_name": "Google One", "tier_name": "Standard (200 GB)", "monthly_price": 2.99, "category": "Technology", "features": {"storage": "200GB"}},
        {"service_name": "Google One", "tier_name": "Premium (2 TB)", "monthly_price": 9.99, "category": "Technology", "features": {"storage": "2TB"}},
    ]

    count = 0
    for benchmark in benchmarks:
        try:
            # Check duplicates roughly by service + tier
            existing = supabase.table("market_benchmarks") \
                .select("id") \
                .eq("service_name", benchmark["service_name"]) \
                .eq("tier_name", benchmark["tier_name"]) \
                .execute()
                
            if not existing.data:
                supabase.table("market_benchmarks").insert(benchmark).execute()
                count += 1
            else:
                print(f"Skipping {benchmark['service_name']} {benchmark['tier_name']} (exists)")
        except Exception as e:
            print(f"Error seeding {benchmark['service_name']}: {e}")
            
    print(f"Successfully seeded {count} new benchmarks.")

if __name__ == "__main__":
    seed_benchmarks()
