# Plan: Thrive CRM Enhancement (Responsiveness, Loading States, i18n, Pure Dynamic SSR)

## Objective
Deliver full iPad/Tablet responsiveness, transition loading states, complete missing translations, and pure dynamic SSR for the Thrive CRM dashboard with 100% build, typecheck, and test verification.

## Milestones Decomposition
- **Step 0: Survey & Scoping**:
  - Dispatch 3 Explorers / Spec Miners in parallel to survey codebase against R1-R4.
  - Dispatch E2E Test Writer / Orchestrator for dual-track requirement-driven test infra.
  - Synthesize findings into updated `PROJECT.md` and `TEST_INFRA.md`.
- **Milestone 1: Loading States (R1) & Pure Dynamic SSR (R4)**
  - Create `loading.tsx` in `students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`.
  - Update `src/app/[locale]/layout.tsx` to remove `generateStaticParams` and add `export const dynamic = 'force-dynamic'`.
  - Gate verification (Reviewers, Challengers, Auditor).
- **Milestone 2: iPad/Tablet Responsiveness (R2)**
  - Sidebar collapse/hide on `< 1024px`.
  - Overflow-x for all data tables.
  - Kanban board responsive adaptation.
  - Modal 90% width scaling on smaller screens.
  - Gate verification (Reviewers, Challengers, Auditor).
- **Milestone 3: i18n Completeness (R3)**
  - Complete translations in `az.json`, `en.json`, `ru.json`.
  - Update `NotificationsDropdown.tsx`, empty states in tables, and loading texts.
  - Gate verification (Reviewers, Challengers, Auditor).
- **Milestone 4: Final Comprehensive Validation & Adversarial Hardening**
  - E2E test pass (Tiers 1-4).
  - Adversarial hardening (Tier 5).
  - Programmatic verification: `npx tsc --noEmit` (0 errors) & `npm run build` (`ƒ (Dynamic)` for all `/dashboard/...` routes).
  - Clean forensic audit sign-off.
- **Victory Report**:
  - Send completion report to Sentinel / Parent.
