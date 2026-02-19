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
        # --- Streaming Video ---
        # Netflix
        {"service_name": "Netflix", "tier_name": "Standard with ads", "monthly_price": 6.99, "category": "Entertainment", "features": {"ads": True, "resolution": "1080p"}},
        {"service_name": "Netflix", "tier_name": "Standard", "monthly_price": 15.49, "category": "Entertainment", "features": {"ads": False, "resolution": "1080p"}},
        
        # Hulu
        {"service_name": "Hulu", "tier_name": "With Ads", "monthly_price": 7.99, "category": "Entertainment", "features": {"ads": True}},
        
        # Free/Cheaper Alternatives
        {"service_name": "Tubi", "tier_name": "Free (Ad-Supported)", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True, "content": "Movies & TV"}},
        {"service_name": "Pluto TV", "tier_name": "Free (Ad-Supported)", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True, "content": "Live TV & Movies"}},
        {"service_name": "Crackel", "tier_name": "Free", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True}},
        {"service_name": "Freevee", "tier_name": "Free (Amazon)", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True}},
        
        # --- Streaming Audio ---
        # Spotify
        {"service_name": "Spotify", "tier_name": "Individual", "monthly_price": 10.99, "category": "Entertainment", "features": {"users": 1}},
        {"service_name": "Spotify", "tier_name": "Duo", "monthly_price": 14.99, "category": "Entertainment", "features": {"users": 2}},
        {"service_name": "Spotify", "tier_name": "Family", "monthly_price": 16.99, "category": "Entertainment", "features": {"users": 6}},
        
        # Apple Music
        {"service_name": "Apple Music", "tier_name": "Individual", "monthly_price": 10.99, "category": "Entertainment", "features": {"users": 1}},
        
        # Alternatives
        {"service_name": "YouTube Music", "tier_name": "Free", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True, "background_play": False}},
        {"service_name": "Bandcamp", "tier_name": "Direct Support", "monthly_price": 0.00, "category": "Entertainment", "features": {"model": "Pay what you want"}},
        {"service_name": "SoundCloud", "tier_name": "Free", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True}},
        {"service_name": "Pandora", "tier_name": "Free", "monthly_price": 0.00, "category": "Entertainment", "features": {"ads": True, "radio": True}},

        # --- Creative Software ---
        # Adobe
        {"service_name": "Adobe Creative Cloud", "tier_name": "All Apps", "monthly_price": 54.99, "category": "Software", "features": {"apps": "All"}},
        {"service_name": "Adobe Creative Cloud", "tier_name": "Photography Plan", "monthly_price": 9.99, "category": "Software", "features": {"apps": "Lightroom, Photoshop"}},
        
        # Alternatives to Adobe
        {"service_name": "DaVinci Resolve", "tier_name": "Free Version", "monthly_price": 0.00, "category": "Software", "features": {"replacement_for": "Premiere Pro", "quality": "Professional"}},
        {"service_name": "GIMP", "tier_name": "Free (Open Source)", "monthly_price": 0.00, "category": "Software", "features": {"replacement_for": "Photoshop"}},
        {"service_name": "Affinity Photo", "tier_name": "One-Time Purchase", "monthly_price": 0.00, "category": "Software", "features": {"model": "One-time $70", "replacement_for": "Photoshop"}},
        {"service_name": "Affinity Designer", "tier_name": "One-Time Purchase", "monthly_price": 0.00, "category": "Software", "features": {"model": "One-time $70", "replacement_for": "Illustrator"}},
        {"service_name": "Inkscape", "tier_name": "Free (Open Source)", "monthly_price": 0.00, "category": "Software", "features": {"replacement_for": "Illustrator"}},
        
        # --- Productivity ---
        {"service_name": "Microsoft 365", "tier_name": "Personal", "monthly_price": 6.99, "category": "Software", "features": {"users": 1}},
        
        # Alternatives
        {"service_name": "LibreOffice", "tier_name": "Free (Open Source)", "monthly_price": 0.00, "category": "Software", "features": {"replacement_for": "Office"}},
        {"service_name": "Google Docs", "tier_name": "Free", "monthly_price": 0.00, "category": "Software", "features": {"cloud": True}},
        
        # --- Cloud Storage ---
        {"service_name": "Google One", "tier_name": "Basic (100 GB)", "monthly_price": 1.99, "category": "Technology", "features": {"storage": "100GB"}},
        {"service_name": "Dropbox", "tier_name": "Basic", "monthly_price": 0.00, "category": "Technology", "features": {"storage": "2GB Free"}},
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
