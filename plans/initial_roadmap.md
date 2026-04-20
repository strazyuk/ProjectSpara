# SubscriptCheck
## AI-Powered Subscription Intelligence (Portfolio Prototype)

SubscriptCheck is a zero-cost, full-stack prototype that detects recurring subscriptions from transaction data and identifies potential cost-saving alternatives using LLM-assisted analysis.

This project is intentionally scoped as a **technical portfolio demonstration**, not a production fintech product.

---

# 1. Executive Summary

SubscriptCheck demonstrates:

- Secure OAuth authentication
- Third-party financial API integration (Sandbox mode)
- Deterministic + AI-assisted subscription detection
- Structured LLM JSON validation
- PostgreSQL schema design
- Cloud-native deployment using free tiers
- Recruiter-friendly simulation mode

This is an engineering showcase project designed to demonstrate full-stack and AI integration competency.

---

# 2. Architecture Overview

```
Frontend (React + TypeScript + Tailwind)
↓
FastAPI Backend (JWT Verified)
↓
Supabase (Postgres + Auth)
↓
Groq API (Llama 3)
↓
Groq API (Llama 3)
↓
Teller API (Live/Sandbox Financial Data)
```

All services operate within free-tier constraints.

---

# 3. Zero-Cost Tech Stack

| Layer | Technology | Provider | Purpose |
|-------|------------|----------|----------|
| Frontend | React + TypeScript + Tailwind | Vercel | UI + Hosting |
| UI Components | shadcn/ui | Local | Component system |
| Backend | FastAPI | Render | REST API |
| Database | PostgreSQL | Supabase | Persistent storage |
| Authentication | Supabase Auth (Google OAuth) | Supabase | Identity management |
| AI Inference | Llama 3 | Groq Cloud | Subscription classification |
| Banking Data | Teller API | Teller.io | Live financial data aggregation |
| Email (Optional) | Resend | Resend | Cancellation email demo |

---

# 4. Project Scope (Intentional Boundaries)

This project:

- Uses Teller.io limits (100 connected accounts free)
- Does not store banking credentials (handled by Teller Connect)
- Does not scrape live pricing data
- Does not provide financial advice
- Does not execute real subscription cancellations

It simulates a subscription intelligence workflow to demonstrate system design capability.

---

# 5. System Modules

## 5.1 Authentication Layer

### Objectives
- Configure Supabase project
- Enable Google OAuth
- Implement FastAPI JWT verification middleware
- Create user profile synchronization table

### Database Schema

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Definition of Done

User logs in and sees name + avatar in dashboard.

---

## 5.2 Transaction Ingestion (Teller API)

### Endpoints

* `POST /api/teller/sync` (Exchange token & fetch data)

### Transactions Table

```sql
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  teller_transaction_id TEXT UNIQUE,
  account_id TEXT,
  name TEXT,
  merchant_name TEXT,
  amount DECIMAL(10,2),
  date DATE,
  category TEXT,
  raw_json JSONB
);
```

### Definition of Done

User sees imported transactions in dashboard.

---

## 5.3 Subscription Detection Engine

Hybrid approach:

### Step 1 — Deterministic Filtering

Identify recurring patterns:

* Same merchant name
* Similar charge amount (+/- 10%)
* Recurring interval 25–35 days
* Minimum 2 occurrences

Group candidates before sending to LLM.

### Step 2 — LLM Validation

Provide grouped transaction JSON to Groq.

Expected Output:

```json
{
  "is_subscription": true,
  "normalized_name": "Netflix",
  "category": "Entertainment",
  "confidence": 0.92
}
```

Strict JSON validation required.

---

## 5.4 Subscription Storage

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  amount DECIMAL(10,2),
  frequency TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5.5 Bargain Intelligence Engine

### Benchmark Table

```sql
CREATE TABLE public.market_benchmarks (
  id SERIAL PRIMARY KEY,
  service_name TEXT,
  category TEXT,
  tier_name TEXT,
  monthly_price DECIMAL(10,2)
);
```

### Logic

1. Normalize subscription name
2. Query benchmark table
3. Compare monthly equivalent
4. If cheaper option exists:

   * Calculate monthly_savings
   * Return structured Bargain object

Example Output:

```json
{
  "original": "Netflix Standard - $20",
  "alternative": "Netflix Basic - $12",
  "monthly_savings": 8
}
```

No live price scraping.

---

## 5.6 AI Cancellation Generator

Endpoint:

`POST /subscriptions/{id}/generate-cancellation`

Input:

* Subscription name
* User first name

Output:

* Polite cancellation email text

Optional integration with Resend for demo mode.

---

## 5.7 Simulation Mode (Portfolio Feature)

Purpose: Zero friction for recruiters.

Button: "Run Demo"

Actions:

* Insert synthetic transactions
* Insert sample subscriptions
* Insert benchmark data
* Trigger bargain generation

No Plaid connection required.

---

# 6. API Overview

## Auth

* `GET /me`

## Teller

* `POST /api/teller/sync`

## Subscription

* `POST /subscriptions/detect`
* `GET /subscriptions`
* `POST /subscriptions/{id}/generate-cancellation`

## Demo

* `POST /demo/populate`

---

# 7. AI Prompt Design

## Classification Prompt

System:

"You are a financial transaction classifier.

Given grouped transaction JSON:

1. Determine if it is a recurring subscription.
2. Normalize the service name.
3. Categorize it.
4. Return strictly valid JSON only.

Fields:

* is_subscription (boolean)
* normalized_name (string)
* category (string)
* confidence (float 0–1)"

No explanation text allowed.

---

## Bargain Prompt

"You are a cost optimization assistant.

Given:

* Subscription name
* Current monthly cost
* Benchmark options

Return strictly JSON:

```json
{
  "original": "string",
  "alternative": "string",
  "monthly_savings": "number"
}
```

Return null if no savings exist."

---

# 8. Security Considerations

* JWT verification on every backend request
* No real financial data
* Sandbox mode clearly stated
* Environment variables for all secrets
* Restricted CORS
* No sensitive logging

---

# 9. Deployment Plan

Frontend:

* GitHub → Vercel auto-deploy

Backend:

* GitHub → Render free instance
* Note cold start (~30 seconds)

Database:

* Supabase managed Postgres

Environment Variables:

* SUPABASE_URL
* SUPABASE_ANON_KEY
* SUPABASE_SERVICE_ROLE_KEY
* GROQ_API_KEY
* TELLER_APP_ID
* TELLER_CERT_PATH
* TELLER_KEY_PATH

---

# 10. Performance Notes

* Deterministic pre-filter reduces token usage
* Groq inference provides sub-second responses
* Benchmark lookup is constant-time
* Cold start acceptable for prototype

---

# 11. Recruiter Demo Flow

1. Login with Google
2. Click "Run Demo"
3. View detected subscriptions
4. View Bargain Alerts
5. Generate cancellation email

Total interaction time: ~60 seconds.

---

# 12. Evaluation & Strategic Positioning

## Strengths

* Demonstrates secure third-party API integration
* Shows structured LLM orchestration
* Displays database modeling competence
* Combines deterministic logic with AI reasoning
* Clean architectural separation of concerns

## Risks (Mitigated)

* LLM over-reliance avoided via heuristic pre-filter
* Fintech compliance risk mitigated via sandbox-only usage
* Scope creep avoided by removing live price scraping

## Portfolio Framing

Position as:

"A full-stack AI systems project demonstrating secure financial API integration and structured LLM orchestration."

Not as:

"A production-ready fintech application."

That distinction is critical.

---

# 13. Optional Future Expansion

* Real-time webhook sync
* Budget scoring dashboard
* Savings projections
* Multi-model AI comparison
* Stripe subscription import
* Usage analytics dashboard

---

# Final Outcome

Upon completion, SubscriptCheck demonstrates:

* End-to-end full-stack ownership
* AI system integration discipline
* Secure authentication implementation
* Financial data modeling
* Cloud deployment competency
* Controlled and deliberate product scoping
