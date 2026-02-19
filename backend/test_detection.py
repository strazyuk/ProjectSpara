import requests
import jwt
import sys
from datetime import datetime, timedelta

# Configuration
API_URL = "http://localhost:8000"
# Use the UUID you seeded with
USER_ID = sys.argv[1] if len(sys.argv) > 1 else "b148b52a-03ce-4a6b-ad3b-82524de84eea"

def generate_test_token(user_id):
    """
    Generates a dummy JWT token that the backend will accept 
    (since we are using verify_signature=False in auth.py for prototype/dev).
    """
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "role": "authenticated",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    # We can sign with a dummy secret because verify_signature is False in auth.py
    # or if it strictly requires a valid signature, we'd need the real secret.
    # Looking at auth.py Option C: "jwt.decode(token, options={'verify_signature': False})"
    # So any signature works.
    return jwt.encode(payload, "dummy_secret", algorithm="HS256")

def test_detection():
    print(f"Testing Subscription Detection for User: {USER_ID}")
    
    token = generate_test_token(USER_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    print("-" * 50)
    print("1. Triggering AI Detection...")
    try:
        response = requests.post(f"{API_URL}/api/subscriptions/detect", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Request Failed: {e}")
        return

    print("-" * 50)
    print("2. Fetching Detected Subscriptions...")
    try:
        response = requests.get(f"{API_URL}/api/subscriptions/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            subs = response.json()
            print(f"Found {len(subs)} subscriptions:")
            for sub in subs:
                print(f" - {sub['name']} (${sub['amount']}) via {sub['merchant_name']}")
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test_detection()
