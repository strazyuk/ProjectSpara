# Implementation Plan — Subscription Calendar + Budget Tracker (v2.1)

## Overview
This plan implements a **Subscription Calendar** and a **Budget Tracker** following the **KISS principle** (Keep It Simple, Stupid). We prioritize functionality and clear UX over complex architectural abstractions.

---

## Strategic Decisions (KISS)
- **Database**: Use a single new table `user_preferences` for simplicity.
- **Date Inactive Logic**: If no transactions exist for a subscription, we fall back to `today + 30 days` to ensure the calendar isn't empty.
- **UI**: Pure Tailwind CSS for the progress bar and calendar grid. No heavy third-party calendar libraries.

---

## Execution Steps

### Step 1: Database Setup & Security
**Subplan**:
- Create `user_preferences` table in Supabase.
- Enable Row Level Security (RLS) to ensure users only see their own data.
**Testing Strategy**:
- `Manual`: Execute SQL in Supabase dashboard and verify table creation.
- `Security`: Confirm `user_preferences` has RLS enabled with a policy matching `auth.uid() = user_id`.

---

### Step 2: Backend — Preferences API
**Subplan**:
- Create `backend/routers/preferences.py`.
- Implement `GET /` to fetch budget.
- Implement `PATCH /` to set/update budget.
- Register router in `backend/main.py`.
**Testing Strategy**:
- `Integration`: Use `curl` or FastAPI Swagger UI (`/docs`) to PATCH a budget and GET it back. Verify results persist in DB.

---

### Step 3: Backend — Subscription Billing Projections
**Subplan**:
- Update `backend/routers/subscriptions.py`.
- For each subscription, find the most recent transaction.
- Add 30 days to projected `next_billing_date`.
- Attach this to the response JSON.
**Testing Strategy**:
- `Integration`: Call `GET /api/subscriptions` and verify every object has a `next_billing_date` field matching the expected forecast (Transaction Date + 30 days).

---

### Step 4: Frontend — Budget Tracker Component
**Subplan**:
- Create `frontend/src/components/BudgetTracker.tsx`.
- Calculate `% used` = `Total Monthly Subscriptions / Budget Cap`.
- Implement Tailwind classes for color shifts (Green, Yellow, Red).
- Add inline editing for the budget cap.
**Testing Strategy**:
- `Unit/UI`: Verify the progress bar color changes correctly when the budget is set high or low.
- `Interaction`: Verify clicking "Edit" allows changing the budget and it updates the backend.

---

### Step 5: Frontend — Subscription Calendar Grid
**Subplan**:
- Create `frontend/src/components/SubscriptionCalendar.tsx`.
- Build a stateless 7-column grid for the current month.
- Map subscriptions to their respective day numbers.
- List "Upcoming Charges" in a side/bottom panel for clarity.
**Testing Strategy**:
- `Visual`: Check that subscriptions on the 15th of the month appear in the correct grid cell.
- `Edge Case`: Ensure months with 28, 30, and 31 days render correctly.

---

### Step 6: Frontend — Integration & Navigation
**Subplan**:
- Update `frontend/src/components/Sidebar.tsx` to include "Calendar".
- Update `frontend/src/App.tsx` routing to show the `SubscriptionCalendar` component.
- Add the `BudgetTracker` to the main Dashboard view.
**Testing Strategy**:
- `E2E`: Start at Dashboard → See Budget → Click Sidebar "Calendar" → See the grid.

---

## Open Questions
> [!IMPORTANT]
> **Approval Required**: Do you agree with the 30-day fallback for subscriptions without transaction history? This is the simplest way to get the Calendar populated immediately. 

## Verification Plan Summary
We will verify each step sequentially. Execution will not proceed to the next step until the testing strategy for the current step is fulfilled.
