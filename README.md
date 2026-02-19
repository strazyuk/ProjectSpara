# SubscriptCheck

SubscriptCheck is a zero-cost, full-stack prototype that detects recurring subscriptions from transaction data and identifies potential cost-saving alternatives using LLM-assisted analysis.

## Setup

### Frontend

1.  Navigate to `frontend` directory.
2.  Install dependencies: `npm install`
3.  Create `.env` file based on `.env.example`.
4.  Run development server: `npm run dev`

### Backend

1.  Navigate to `backend` directory.
2.  Create virtual environment: `python -m venv venv`
3.  Activate virtual environment:
    -   Windows: `.\venv\Scripts\activate`
    -   Mac/Linux: `source venv/bin/activate`
4.  Install dependencies: `pip install -r requirements.txt`
5.  Create `.env` file based on `.env.example`.
6.  Run server: `uvicorn main:app --reload`
