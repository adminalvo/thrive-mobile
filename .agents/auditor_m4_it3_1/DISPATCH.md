## 2026-08-14T23:14:27Z

You are Forensic Integrity Auditor for Milestone 4 Iteration 3.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/auditor_m4_it3_1

MANDATORY CONTEXT FILES TO READ FIRST:
1. ORIGINAL_REQUEST.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
2. PROJECT.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
3. TEST_INFRA.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/TEST_INFRA.md
4. TEST_READY.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/TEST_READY.md
5. Worker M4 It3 Handoff: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m4_it3/handoff.md
6. Previous Auditor Report: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/auditor_m4_it2_1_gen2/handoff.md

TASK:
Perform the comprehensive Forensic Integrity Audit in Benchmark Mode:
1. Run `npx tsc --noEmit` and verify 0 type errors.
2. Run `npm run build` and verify that all `/[locale]/...` and `/[locale]/dashboard/...` routes render with `ƒ (Dynamic)` and no static pre-rendering of dynamic data.
3. Run `npx tsx tests/e2e/run_all.ts` and verify that 132/132 tests pass (0 failures).
4. Perform code inspection for integrity:
   - Check that no test results or answers are hardcoded in application logic.
   - Check that no dummy/facade implementations exist.
   - Check that database queries and mutations in API routes (`src/app/api/...`) execute genuine parameterized SQL against PostgreSQL.
   - Check that all loading states (`loading.tsx` across 8 sub-routes) are present and properly localized.
   - Check that CSS module media queries handle iPad/Tablet (768px-1024px) properly.
   - Check that translations (`messages/{az,en,ru}.json`) maintain 100% key parity.
5. Write your complete audit report and explicit verdict (CLEAN or INTEGRITY VIOLATION) to `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/auditor_m4_it3_1/handoff.md`.
6. Send completion message to parent.
