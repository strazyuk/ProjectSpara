import requests
import os
from dotenv import load_dotenv

load_dotenv()

TELLER_CERT_PATH = os.getenv("TELLER_CERT_PATH", "certs/certificate.pem")
TELLER_KEY_PATH = os.getenv("TELLER_KEY_PATH", "certs/private_key.pem")

print(f"Testing certificates at: {TELLER_CERT_PATH}, {TELLER_KEY_PATH}")

if not os.path.exists(TELLER_CERT_PATH) or not os.path.exists(TELLER_KEY_PATH):
    print("Error: Certificate files not found!")
    exit(1)

try:
    # Use requests to just hit the root or accounts endpoint.
    # Without Auth, we expect 401 Unauthorized, but SSL handshake should succeed.
    # If SSL fails, it throws an SSLError.
    response = requests.get(
        "https://api.teller.io/accounts",
        cert=(TELLER_CERT_PATH, TELLER_KEY_PATH),
        auth=("test_token", "") # Dummy token to trigger auth check
    )
    print(f"Response Status Code: {response.status_code}")
    
    if response.status_code == 401:
        # This means we reached the server and it rejected our token, which is expected!
        # It proves mTLS worked.
        # If mTLS failed, we wouldn't get a HTTP response at all.
        print("SUCCESS! mTLS connection established. (401 is expected with invalid token)")
    elif response.status_code == 200:
        print("SUCCESS! Connected and authenticated.")
    else:
        print(f"Connection established, but received status: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"CONNECTION FAILED: {e}")
