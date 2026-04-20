# 🔍 Feature Analysis — ProjectSpara (SubscriptCheck)

> **Role**: Feature Analyst  
> **Date**: April 2026  
> **Codebase snapshot**: FastAPI + React/Vite + Supabase + Groq (Llama 3.3) + Teller API

---

## Current Product Baseline

| Component | What exists today |
|---|---|
| **Auth** | Supabase Auth (Google OAuth), JWT middleware |
| **Bank Sync** | Teller Connect → `/api/teller/sync` → transactions stored in Supabase |
| **Subscription Detector** | LLM (Llama 3.3) classifies recurring merchant groups |
| **Bargain Hunter** | Compares user subs vs. `market_benchmarks` table, LLM picks best alternative |
| **Knowledge Manager** | Auto-researches categories lacking benchmark data |
| **Dashboard** | KPI cards (total spend, activity, monthly avg), Spending Trend chart, Category Pie |
| **Transactions** | Full history table view |

**Core gap**: The product is great at *detecting* and *comparing* — but currently does nothing to help users *act*, *plan*, or *understand* their subscription lifecycle over time.

---

## Feature Recommendations

Features are ordered by **Priority Tier** (High → Medium → Low). Each entry includes the problem it solves, implementation complexity, and value delivered.

---

### 🔴 TIER 1 — High Impact, Should Build Next

---

#### 1. 📧 Cancellation Email Generator  *(already specced — not yet shipped)*

**Problem**: Users identify a wasteful subscription but have no clear next step.  
**Solution**: One-click generation of a polite, service-specific cancellation email via LLM, pre-filled with the user's name and the subscription name.  
**Why now**: The PLAN.md already designed this (`POST /subscriptions/{id}/generate-cancellation`). It's a "last mile" feature that turns insight into action — *the* signature moment of the product.  
**Complexity**: 🟢 Low — 1 new endpoint + a textarea modal in React.  
**Stack touch**: `backend/routers/subscriptions.py` + new frontend modal component.

---

#### 2. 📅 Subscription Calendar / Timeline View

**Problem**: Users don't know *when* their money is going out. A Netflix charge mid-month and a Spotify charge on the 1st are easy to lose track of.  
**Solution**: A interactive calendar or vertical timeline showing upcoming billing dates for all detected subscriptions, color-coded by category.  
**Why now**: The `frequency` field already exists on the `subscriptions` table. We just need an inferred `next_billing_date` (derivable from the most recent transaction date + interval).  
**Complexity**: 🟡 Medium — needs date inference logic on the backend + a new React calendar component (e.g. `react-calendar` or a custom one).  
**Value**: High retention driver — users will open the app to check "what's due next month."

---

#### 3. 💰 Monthly Subscription Budget Tracker + Alert

**Problem**: Users don't know their total subscription spend at a glance in dollar-vs-budget terms.  
**Solution**: Allow users to set a monthly "subscription budget" ceiling. A persistent card on the dashboard shows a progress bar: *"You've spent $87 of your $100 budget this month."* Email/in-app alert at 80% and 100% thresholds.  
**Why now**: Total spend KPI is already shown — adding budget context is a small delta with outsized perceived value. It creates the product's *first user-configurable setting*, making it feel more personal.  
**Complexity**: 🟢 Low — new `user_preferences` table + a Supabase DB function or edge notification.  
**Stack touch**: New Supabase table, 1 new GET/PATCH endpoint, frontend budget input widget.

---

#### 4. 📊 Savings Projection Panel

**Problem**: Bargain alerts show "save $8/month on Netflix" but users don't internalize the annualized impact.  
**Solution**: A panel below the Bargain List that aggregates all savings opportunities and shows:
- *Total potential annual savings* (e.g., **$312/year**)
- A simple bar showing: current spend vs. optimized spend
- A "Take All Savings" CTA that opens all suggested alternatives at once  
**Why now**: This is the most powerful monetizable impression moment. It's also trivially computed from the existing `bargains` data structure — just sum `monthly_savings × 12`.  
**Complexity**: 🟢 Low — purely frontend math + new UI panel.

---

#### 5. 🏷️ Manual Subscription Entry

**Problem**: Not all subscriptions come through bank transactions (e.g., subscriptions billed to a different card, PayPal, or crypto).  
**Solution**: A simple "Add Subscription Manually" form — Name, Amount, Frequency, Category, Next Billing Date.  
**Why now**: Teller covers connected accounts only. Without manual entry, the product misses a significant slice of the user's real subscription footprint.  
**Complexity**: 🟢 Low — the `subscriptions` table already supports this schema. Just a new `POST /subscriptions` endpoint + frontend form.  
**Value**: Makes the product usable even without Teller, dramatically expanding the addressable user persona.

---

### 🟡 TIER 2 — Medium Impact, Strong Additions

---

#### 6. 📉 Subscription Spend History & Trend (Per Subscription)

**Problem**: The global Spending Trend chart is great but shows *all* transactions, not subscription-specific trends. Users can't see "Netflix has gone up $3/month over 18 months."  
**Solution**: A drill-down view per subscription that shows its amount history over time as a simple line chart (uses existing transaction data grouped by merchant).  
**Complexity**: 🟡 Medium — needs a new API endpoint and a chart-per-subscription component.  
**Value**: Reveals subscription price creep automatically — a uniquely valuable insight no other tool surfaces cleanly.

---

#### 7. 🔔 Recurring Billing Alerts (Push / Email Notifications)

**Problem**: The app is passive — users have to open it to get value.  
**Solution**: Daily or weekly digest email ("Your subscriptions this week: Netflix $15.99 on the 12th, Spotify $9.99 on the 14th — Total: $25.98").  
Implement using **Resend** (already mentioned in PLAN.md as optional integration).  
**Complexity**: 🟡 Medium — Resend API integration + a cron job or Supabase scheduled function.  
**Value**: Creates a pull channel back into the app; transforms it from a "check once" tool into a habitual utility.

---

#### 8. 🏦 Multi-Account Aggregation View

**Problem**: The current dashboard shows all transactions merged together. Users with multiple linked accounts (checking + credit card) can't tell which account drives which subscriptions.  
**Solution**: An "Accounts" panel showing each linked Teller account, its total subscription spend, and a breakdown by account.  
**Complexity**: 🟡 Medium — the `account_id` field already exists on the `transactions` table. Needs aggregation queries + frontend account switcher.

---

#### 9. 🤖 "Subscription Score" — AI Health Rating

**Problem**: The dashboard shows raw numbers but no opinionated insight. Users don't know if $200/month in subscriptions is normal, high, or low for someone like them.  
**Solution**: An AI-generated "Subscription Health Score" (A–F grade) that factors in:
- Total monthly subscription cost as % of estimated income (use average transaction volume as a proxy)
- Number of overlapping/redundant service categories
- Number of free alternatives available  
LLM generates a 1-sentence diagnosis: *"Your entertainment subscriptions are 3x the national average — consider cutting."*  
**Complexity**: 🟡 Medium — new backend analysis endpoint + scoring rubric in prompt.  
**Value**: Highly shareable; "I got an A on my Spara score" is a virality driver.

---

#### 10. 🔍 Duplicate / Redundant Subscription Detector

**Problem**: Users often subscribe to competing services in the same category without realizing it (e.g., both Netflix *and* Disney+ *and* Hulu for streaming).  
**Solution**: LLM analyzes all active subscriptions and flags categories with multiple active subscriptions, warning: *"You have 3 active streaming services ($45/month). You likely only need 1–2."*  
**Complexity**: 🟡 Medium — new `/subscriptions/analyze-redundancy` endpoint, LLM prompt, frontend alert banner.  
**Value**: High "aha moment" potential. Users don't connect these dots themselves.

---

### 🟢 TIER 3 — Lower Priority / Future Scope

---

#### 11. 🌐 Demo / Simulation Mode *(already specced)*

**Problem**: Recruiters and new users can't evaluate the product without connecting a real bank.  
**Solution**: A "Run Demo" button that seeds synthetic transactions, subscriptions, and benchmarks (seed scripts already exist in `seed_data.py` and `seed_benchmarks.py`).  
**Complexity**: 🟢 Low — mostly done; just needs a frontend button wired to an endpoint.

---

#### 12. 📤 CSV / PDF Export

**Problem**: Power users want to plug their subscription data into spreadsheets or share with a financial advisor.  
**Solution**: Export buttons on the Subscriptions and Transactions pages (CSV) and a "Savings Report" PDF export.  
**Complexity**: 🟡 Medium — backend CSV generation is trivial; PDF needs a library (e.g., `reportlab` or `weasyprint`).

---

#### 13. 🌙 Dark Mode

**Problem**: The app is white-only. This is a standard user preference in 2026.  
**Solution**: Toggle dark/light mode, stored in `user_preferences`.  
**Complexity**: 🟢 Low — Tailwind already supports `dark:` variants.

---

#### 14. 📱 Mobile-Responsive PWA

**Problem**: The layout adapts to mobile but isn't installable as a PWA (no manifest, no service worker).  
**Solution**: Add `manifest.json` + service worker via Vite PWA plugin to enable "Add to Home Screen."  
**Complexity**: 🟢 Low — `vite-plugin-pwa` is a single config addition.

---

#### 15. 🔗 Stripe / PayPal Transaction Import

**Problem**: Teller covers US bank accounts but misses PayPal bills, Stripe, and international cards.  
**Solution**: Add an optional import path via CSV upload (user exports from PayPal/Stripe and uploads).  
**Complexity**: 🔴 High — CSV parsing, deduplication against existing transactions, merchant normalization.

---

## Priority Matrix Summary

| # | Feature | Impact | Complexity | Build Order |
|---|---|---|---|---|
| 1 | Cancellation Email Generator | 🔥 High | 🟢 Low | **Now** |
| 5 | Manual Subscription Entry | 🔥 High | 🟢 Low | **Now** |
| 4 | Savings Projection Panel | 🔥 High | 🟢 Low | **Now** |
| 3 | Budget Tracker + Alert | 🔥 High | 🟢 Low | **Sprint 2** |
| 2 | Subscription Calendar | 🔥 High | 🟡 Medium | **Sprint 2** |
| 11 | Demo/Simulation Mode | 🟡 Medium | 🟢 Low | **Sprint 2** |
| 9 | AI Subscription Score | 🔥 High | 🟡 Medium | **Sprint 3** |
| 10 | Redundancy Detector | 🔥 High | 🟡 Medium | **Sprint 3** |
| 6 | Per-Subscription Trend | 🟡 Medium | 🟡 Medium | **Sprint 3** |
| 7 | Billing Alerts (Email) | 🟡 Medium | 🟡 Medium | **Sprint 4** |
| 8 | Multi-Account View | 🟡 Medium | 🟡 Medium | **Sprint 4** |
| 13 | Dark Mode | 🟢 Nice | 🟢 Low | **Anytime** |
| 12 | CSV/PDF Export | 🟢 Nice | 🟡 Medium | **Later** |
| 14 | PWA | 🟢 Nice | 🟢 Low | **Later** |
| 15 | Stripe/PayPal Import | 🟡 Medium | 🔴 High | **Future** |

---

## Strategic Framing

The product's core narrative is: **"You're bleeding money on subscriptions — let me show you exactly where, and how to stop."**

The current stack delivers the *insight* half well. The next major push should be the **action layer** (Features 1, 3, 4) and the **habit formation layer** (Features 2, 7) — both of which keep users returning and reinforce the product's core value prop.

> [!TIP]
> Features 1, 4, and 5 can all ship in a single sprint with very low risk — they're almost entirely additive. This is your quickest path to a meaningfully more complete product.
