from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from auth import verify_token
from routers import teller, subscriptions, bargains

app = FastAPI(title="SubscriptCheck API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://127.0.0.1:5173",
]

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

@app.get("/")
def read_root():
    return {"message": "Welcome to SubscriptCheck API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/me")
def get_current_user(user_payload: dict = Depends(verify_token)):
    return {
        "user_id": user_payload.get("sub"),
        "email": user_payload.get("email"),
        "message": "You are authenticated!"
    }
