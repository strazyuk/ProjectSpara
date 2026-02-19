import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

TELLER_API_URL = "https://api.teller.io"
TELLER_CERT_PATH = os.getenv("TELLER_CERT_PATH", "certs/certificate.pem")
TELLER_KEY_PATH = os.getenv("TELLER_KEY_PATH", "certs/private_key.pem")

class TellerClient:
    def __init__(self):
        # Check if certs exist
        if not os.path.exists(TELLER_CERT_PATH) or not os.path.exists(TELLER_KEY_PATH):
            print(f"Warning: Teller certificates not found at {TELLER_CERT_PATH} or {TELLER_KEY_PATH}")
            self.cert = None
        else:
            self.cert = (TELLER_CERT_PATH, TELLER_KEY_PATH)

    def _get_headers(self, access_token: str = None):
        headers = {"Content-Type": "application/json"}
        if access_token:
            # Teller uses Basic Auth with the access token as the username and no password
            # But specific endpoints might just need the cert.
            # According to docs, access token is usually passed in the Authorization header as Basic auth
            # with the token as the username.
            headers["Authorization"] = f"Basic {requests.auth._basic_auth_str(access_token, '')}"
        return headers

    def list_accounts(self, access_token: str):
        if not self.cert:
            raise ValueError("Teller certificates are missing. Please check your backend/certs/ directory.")
            
        url = f"{TELLER_API_URL}/accounts"
        # Access token is used as the username for Basic Auth
        response = requests.get(
            url, 
            cert=self.cert, 
            auth=(access_token, "")
        )
        response.raise_for_status()
        return response.json()

    def get_transactions(self, access_token: str, account_id: str, count: int = 100):
        if not self.cert:
            raise ValueError("Teller certificates are missing.")

        url = f"{TELLER_API_URL}/accounts/{account_id}/transactions"
        response = requests.get(
            url, 
            cert=self.cert, 
            auth=(access_token, ""),
            params={"count": count}
        )
        response.raise_for_status()
        return response.json()

client = TellerClient()
