# SubscriptCheck

> **AI-Powered Subscription Intelligence — Full-Stack Portfolio Prototype**

SubscriptCheck is a zero-cost, full-stack web application that automatically detects recurring subscriptions from your bank transaction history and surfaces smarter, cheaper alternatives — all powered by a hybrid deterministic + LLM analysis engine.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo Flow](#live-demo-flow)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AI System Design](#ai-system-design)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Project Scope & Disclaimer](#project-scope--disclaimer)
- [Future Roadmap](#future-roadmap)

---

## Overview

SubscriptCheck demonstrates:

- Secure **Google OAuth** authentication via Supabase
- **Third-party financial API integration** (Teller.io — sandbox mode)
- A **hybrid subscription detection engine** combining rule-based heuristics with **Groq LLM (Llama 3)** classification
- Structured **LLM JSON output validation**
- **Bargain Intelligence** — comparing subscriptions against market benchmarks to surface savings
- **AI-generated cancellation emails** via Groq
- A **recruiter-friendly demo mode** requiring zero bank connection

This is an engineering showcase project designed to demonstrate full-stack and AI integration competency. It is **not** a production fintech product.

---

## Live Demo Flow

1. Sign in with Google (via Supabase Auth)
2. Click **"Run Demo"** to seed synthetic transaction data — no bank connection required
3. View automatically detected subscriptions (Netflix, Spotify, AWS, etc.)
4. Review **Bargain Alerts** — cheaper alternatives identified from benchmark data
5. Generate a polished **cancellation email** with one click

> Total interaction time: ~60 seconds.

---

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React + TypeScript + Tailwind)  │
│  Hosted on Vercel                         │
└────────────────┬────────────────────┘
                 │ HTTPS (JWT Bearer Token)
┌────────────────▼────────────────────┐
│  FastAPI Backend                    │
│  Hosted on Render                   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Subscription Detection      │   │
│  │  (Heuristic → LLM pipeline)  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Bargain Hunter              │   │
│  │  (Benchmark comparison)      │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Knowledge Manager           │   │
│  │  (LLM cancellation emails)   │   │
│  └──────────────────────────────┘   │
└──────┬───────────────┬──────────────┘
       │               │
┌──────▼───────┐ ┌─────▼──────────────┐
│  Supabase    │ │  Groq Cloud        │
│  Postgres DB │ │  Llama 3 Inference │
│  + Auth      │ └────────────────────┘
└──────┬───────┘
       │
┌──────▼───────────────┐
│  Teller API          │
│  (Sandbox banking    │
│   data ingestion)    │
└──────────────────────┘
```

---

## Tech Stack

| Layer           | Technology               | Provider     | Purpose                          |
|-----------------|--------------------------|--------------|----------------------------------|
| Frontend        | React 19 + TypeScript    | Vercel       | UI + Hosting                     |
| Styling         | Tailwind CSS v4          | -            | Utility-first styling            |
| Charts          | Recharts                 | -            | Spending visualisations          |
| Icons           | Lucide React             | -            | UI icons                         |
| Backend         | FastAPI + Uvicorn        | Render       | REST API server                  |
| Auth            | Supabase Auth (Google OAuth) | Supabase | Identity management              |
| Database        | PostgreSQL               | Supabase     | Persistent storage               |
| AI Inference    | Groq API (Llama 3)       | Groq Cloud   | Subscription classification + email generation |
| Banking Data    | Teller API               | Teller.io    | Live/sandbox financial data      |
| Email (Optional)| Resend                   | Resend       | Cancellation email demo          |

All services operate within **free-tier constraints**.

---

## Features

### 🔐 Authentication
- Google OAuth via Supabase with JWT verification on every backend request
- User profile sync table linked to Supabase Auth

### 🏦 Transaction Ingestion (Teller API)
- Connect a bank account via **Teller Connect** (sandboxed)
- Automatic transaction sync and storage in Supabase Postgres
- Demo mode seeds synthetic transactions — no real bank account required

### 🤖 Subscription Detection Engine
A two-stage hybrid pipeline:

**Stage 1 — Deterministic Heuristics**
- Groups transactions by merchant name
- Filters for recurring amounts (±10% tolerance)
- Detects 25–35 day intervals
- Requires minimum 2 occurrences to flag as candidate

**Stage 2 — LLM Validation (Groq / Llama 3)**
- Sends grouped candidates to Llama 3 for classification
- Returns strictly validated JSON:
  ```json
  {
    "is_subscription": true,
    "normalized_name": "Netflix",
    "category": "Entertainment",
    "confidence": 0.92
  }
  ```

### 💡 Bargain Intelligence Engine
- Compares detected subscriptions against a curated market benchmark table
- Identifies cheaper tiers or alternatives
- Returns structured savings recommendations:
  ```json
  {
    "original": "Netflix Standard - $20",
    "alternative": "Netflix Basic - $12",
    "monthly_savings": 8
  }
  ```

### ✉️ AI Cancellation Email Generator
- Generates polite, professional cancellation emails using Groq
- Personalized with subscription name and user's first name
- Optional Resend integration for live email delivery demo

### 🎭 Demo Mode (Recruiter-Friendly)
- Single button seeds the entire database with realistic synthetic data
- No Teller connection required
- Immediately showcases the full detection and bargain pipeline

---

## Project Structure

```
ProjectSpara/
├── backend/
│   ├── main.py                    # FastAPI app entry point, CORS config, router registration
│   ├── auth.py                    # JWT verification middleware
│   ├── requirements.txt           # Python dependencies
│   ├── routers/
│   │   ├── teller.py              # POST /api/teller/sync — token exchange & transaction fetch
│   │   ├── subscriptions.py       # POST /api/subscriptions/detect, GET /api/subscriptions
│   │   └── bargains.py            # Bargain alert endpoints
│   ├── services/
│   │   ├── detector.py            # Hybrid subscription detection (heuristic + LLM)
│   │   ├── bargain_hunter.py      # Market benchmark comparison logic
│   │   └── knowledge_manager.py   # Cancellation email generation via Groq
│   ├── db/
│   │   ├── schema_subscriptions.sql   # Subscriptions table schema
│   │   └── schema_benchmarks.sql      # Market benchmarks table schema
│   ├── seed_data.py               # Seed synthetic transactions
│   ├── seed_benchmarks.py         # Seed market benchmark pricing data
│   └── teller_service.py          # Teller API client
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app, routing, view state management
│   │   ├── main.tsx               # React entry point
│   │   ├── components/
│   │   │   ├── TellerConnect.tsx  # Teller Connect bank linking widget
│   │   │   └── ...                # Dashboard, Transactions, Bargains, etc.
│   │   ├── context/               # React context (Auth state)
│   │   └── pages/                 # Page-level components
│   ├── package.json
│   └── vite.config.ts
│
├── PLAN.md                        # Detailed technical design document
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.10+
- A [Supabase](https://supabase.com) project (free tier)
- A [Groq](https://console.groq.com) API key (free tier)
- A [Teller.io](https://teller.io) account + app credentials (sandbox)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (see below)
cp .env.example .env

# 5. Start the development server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.example .env

# 4. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Environment Variables

#### `backend/.env`

| Variable                   | Description                                      |
|----------------------------|--------------------------------------------------|
| `SUPABASE_URL`             | Your Supabase project URL                        |
| `SUPABASE_ANON_KEY`        | Supabase anonymous (public) key                  |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase service role key (server-side only)     |
| `GROQ_API_KEY`             | Groq Cloud API key for Llama 3 inference         |
| `TELLER_APP_ID`            | Your Teller application ID                       |
| `TELLER_CERT_PATH`         | Path to Teller mTLS certificate file             |
| `TELLER_KEY_PATH`          | Path to Teller mTLS private key file             |

#### `frontend/.env`

| Variable                    | Description                              |
|-----------------------------|------------------------------------------|
| `VITE_SUPABASE_URL`         | Your Supabase project URL                |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anonymous (public) key          |
| `VITE_TELLER_APP_ID`        | Your Teller application ID               |

> ⚠️ **Never commit `.env` files to version control.** All secrets must be configured as environment variables in your hosting provider's dashboard for production.

---

## API Reference

### Health

| Method | Endpoint   | Description             | Auth Required |
|--------|------------|-------------------------|---------------|
| GET    | `/`        | Root welcome message    | No            |
| GET    | `/health`  | Health check            | No            |
| GET    | `/me`      | Current authenticated user info | Yes   |

### Teller

| Method | Endpoint            | Description                          | Auth Required |
|--------|---------------------|--------------------------------------|---------------|
| POST   | `/api/teller/sync`  | Exchange Teller token and sync transactions | Yes    |

### Subscriptions

| Method | Endpoint                                    | Description                          | Auth Required |
|--------|---------------------------------------------|--------------------------------------|---------------|
| POST   | `/api/subscriptions/detect`                 | Run the detection pipeline           | Yes           |
| GET    | `/api/subscriptions`                        | List all detected subscriptions      | Yes           |
| POST   | `/api/subscriptions/{id}/generate-cancellation` | Generate AI cancellation email   | Yes           |

### Bargains

| Method | Endpoint          | Description                    | Auth Required |
|--------|-------------------|--------------------------------|---------------|
| GET    | `/api/bargains`   | List bargain alerts for user   | Yes           |

---

## AI System Design

### Subscription Classification Prompt

```
System: You are a financial transaction classifier.

Given grouped transaction JSON:
1. Determine if it is a recurring subscription.
2. Normalize the service name.
3. Categorize it.
4. Return strictly valid JSON only — no explanation text.

Required fields:
- is_subscription (boolean)
- normalized_name (string)
- category (string)
- confidence (float 0–1)
```

### Bargain Analysis Prompt

```
System: You are a cost optimization assistant.

Given:
- Subscription name
- Current monthly cost
- Benchmark pricing options

Return strictly JSON:
{
  "original": "string",
  "alternative": "string",
  "monthly_savings": number
}

Return null if no savings exist.
```

**Key design decisions:**
- **Heuristic pre-filter** reduces LLM calls and token usage significantly
- **Strict JSON mode** enforced — no free-form text permitted in responses
- **Groq** chosen for sub-second inference latency on free tier

---

## Database Schema

```sql
-- User profiles (synced from Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank transactions imported from Teller
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

-- Detected subscriptions
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

-- Market pricing benchmarks
CREATE TABLE public.market_benchmarks (
  id SERIAL PRIMARY KEY,
  service_name TEXT,
  category TEXT,
  tier_name TEXT,
  monthly_price DECIMAL(10,2)
);
```

---

## Security

- **JWT verification** enforced on every protected backend route via `Depends(verify_token)`
- **No real financial credentials stored** — Teller handles banking auth via their Connect widget
- **Sandbox mode only** — no live financial data is used or stored
- **CORS restricted** to known frontend origins
- **All secrets** stored in environment variables — never hardcoded
- **No sensitive data logged** anywhere in the application

---

## Deployment

### Frontend → Vercel

```bash
# Push to GitHub — Vercel auto-deploys on every push to main
git push origin main
```

Set all `VITE_*` environment variables in the Vercel project dashboard.

### Backend → Render

- Connect your GitHub repository to a new Render Web Service
- Set runtime to **Python**
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set all environment variables in Render's dashboard

> **Note:** Render free tier has a cold start of ~30 seconds after inactivity. This is expected and acceptable for a portfolio prototype.

### Database → Supabase

- All schema migrations are in `backend/db/`
- Run them against your Supabase project using the SQL editor or the migration helper:
  ```bash
  python backend/apply_migration_helper.py
  ```

---

## Project Scope & Disclaimer

This project is intentionally scoped as a **technical portfolio demonstration**.

| What it does ✅ | What it does NOT do ❌ |
|---|---|
| Detects subscription patterns from transaction data | Store or transmit real banking credentials |
| Uses Teller sandbox for safe bank linking demos | Scrape live pricing data from the web |
| Generates AI-written cancellation emails | Execute real subscription cancellations |
| Compares costs against static benchmark data | Provide regulated financial advice |
| Demo mode for zero-friction recruiter review | Operate under PCI-DSS / fintech compliance |

---

## Future Roadmap

- [ ] Real-time webhook sync via Teller webhooks
- [ ] Budget scoring dashboard with spending trend analysis
- [ ] Multi-year savings projections
- [ ] Multi-model AI comparison (GPT-4o vs Llama 3 vs Gemini)
- [ ] Stripe subscription import integration
- [ ] Usage analytics dashboard
- [ ] Resend live email delivery for cancellation flow

---


