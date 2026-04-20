from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from auth import verify_token
from routers import teller, subscriptions, bargains, preferences
from supabase import create_client, Client

# Initialize Supabase client for health checks
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="SubscriptCheck API")

# Configure CORS
origins = [
    "http://localhost:5173",   # Local dev (Vite)
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # Docker (Nginx container)
]

# Allow overriding origin via env var for production (e.g. https://yourapp.com)
cors_origin_env = os.getenv("CORS_ORIGIN")
if cors_origin_env:
    origins.append(cors_origin_env)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teller.router, prefix="/api/teller")
app.include_router(subscriptions.router, prefix="/api/subscriptions")
app.include_router(bargains.router, prefix="/api/bargains")
app.include_router(preferences.router, prefix="/api/preferences")

@app.get("/api")
def read_root():
    return {"message": "Welcome to SubscriptCheck API"}

@app.get("/api/health")
def health_check():
    try:
        # Lightweight query to keep Supabase alive
        supabase.table("market_benchmarks").select("id").limit(1).execute()
        return {"status": "ok", "supabase": "connected"}
    except Exception as e:
        # We still return 200 to avoid failing load balancer checks, 
        # but report the DB status
        return {"status": "degraded", "supabase": "disconnected", "error": str(e)}

@app.get("/me")
def get_current_user(user_payload: dict = Depends(verify_token)):
    return {
        "user_id": user_payload.get("sub"),
        "email": user_payload.get("email"),
        "message": "You are authenticated!"
    }
