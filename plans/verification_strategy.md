# Implementation Plan: Documentation Consolidation & Git Hygiene

The goal of this plan is to reconfigure the repository's `.gitignore` to be cleaner and more professional, while ensuring all feature plans and verification documents (currently spread across the root and local brain directory) are permanently tracked in the repository.

## User Review Required

> [!IMPORTANT]
> **Data Migration**: I will move all implementation plans (including the ones I generated in my private workspace) into a new `/plans` directory in your repo. This makes them accessible to other developers.
>
> **Secrets Check**: I will ensure that sensitive files like `.env`, `secrets.json`, and database credentials remain strictly ignored.

## Proposed Changes

### 1. Repository Structure
- [NEW] **`/plans`**: A dedicated directory for all technical documentation and implementation plans.
  - Move `PLAN.md` -> `/plans/initial_roadmap.md`
  - Move `v2Feature.md` -> `/plans/subscription_budget_v2.md`
  - [NEW] `/plans/feature_analysis.md` (copy from brain)
  - [NEW] `/plans/implementation_details.md` (copy from brain)
  - [NEW] `/plans/verification_walkthrough.md` (copy from brain)

### 2. Version Control Configuration
- [MODIFY] **[.gitignore](file:///c:/Users/asira/OneDrive/Documents/GitHub/ProjectSpara/.gitignore)**:
  - Remove ignore rules for `PLAN.md`.
  - Remove the absolute local path `C:/Users/asira/.gemini/antigravity/brain/*`.
  - Ensure all `.md` files in `/plans` are explicitly allowed.
  - Standardize sections for Environment, Python, Node.js, and Infrastructure.

### 3. Cleanup
- [DELETE] **secrets_check.txt**, **secrets_debug.txt**, **secrets_final.txt**: Remove these temporary debugging files from the root.

## Open Questions

- **Seeding Scripts**: Currently, `backend/seed_data.py` and `backend/seed_benchmarks.py` are ignored. Should I stop ignoring them so other developers can use them for testing?

## Verification Plan

### Automated Tests
- `git check-ignore -v plans/some_file.md` to ensure they are NOT ignored.
- `git status` to verify new plan files are staged for commit.

### Manual Verification
- Review the new `/plans` directory structure to ensure it is organized and readable.
