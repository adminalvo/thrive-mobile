## 2026-08-14T21:39:32Z
You are worker_m1.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m1
Read the original user request at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
Read the project specification at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
Read the survey findings at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_explorer_1/handoff.md and c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_explorer_1/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Assigned Files:
You exclusively own and will create/modify:
1. `src/app/[locale]/layout.tsx`:
   - Remove the `generateStaticParams()` function completely.
   - Add `export const dynamic = "force-dynamic";` at the top level of the module.
2. Create 8 client-side `loading.tsx` files for dashboard sub-routes:
   - `src/app/[locale]/dashboard/students/loading.tsx`
   - `src/app/[locale]/dashboard/teachers/loading.tsx`
   - `src/app/[locale]/dashboard/parents/loading.tsx`
   - `src/app/[locale]/dashboard/groups/loading.tsx`
   - `src/app/[locale]/dashboard/leads/loading.tsx`
   - `src/app/[locale]/dashboard/finance/loading.tsx`
   - `src/app/[locale]/dashboard/tasks/loading.tsx`
   - `src/app/[locale]/dashboard/schedule/loading.tsx`

Requirements for each `loading.tsx`:
- Must be `"use client";` components.
- Must import `useTranslations` from `"next-intl"`.
- Must call `const t = useTranslations("Common");` and render `{t("loading")}`.
- Must render clean skeleton placeholders matching the route layout (table skeletons, card skeletons, kanban column skeletons, stats skeletons) using CSS modules or inline styled skeleton elements so page transitions feel instantaneous and smooth without layout shifts.

Verification Steps:
1. Run `npx tsc --noEmit` and ensure 0 TypeScript errors.
2. Run `npm test` or `npx tsx tests/e2e/run_all.ts` and verify all Tier 1-5 tests for R1 and R4 pass.
3. Document your changes, build/test results, and verification output in `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m1/handoff.md`.
4. Send a completion message back to the orchestrator.
