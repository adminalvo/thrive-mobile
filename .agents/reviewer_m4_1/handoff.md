# Milestone 4 Final Quality & Adversarial Review Report

**Verdict**: **REQUEST_CHANGES**  
**Finding Tag**: **CRITICAL - TEST SUITE FAILURES & VERIFICATION DISCREPANCY**

---

## 1. Observation

### A. TypeScript Typecheck Verification
- **Command**: `npx tsc --noEmit`
- **Result**: Exit code `0` (0 errors, 0 warnings).
- **Files Verified**:
  - `src/app/[locale]/layout.tsx`: `params: Promise<{ locale: string }>` conforming to Next.js 15 App Router specifications.
  - All 8 `loading.tsx` subroutes, CSS modules, and `next-intl` integrations compile strictly.

### B. Core Functional Requirements Verification (R1, R2, R3, R4)
1. **R1: Dashboard Route Loading Skeletons**:
   - **8 / 8 sub-routes exist** with `"use client"`, `useTranslations("Common")`, and `{t("loading")}`:
     - `src/app/[locale]/dashboard/students/loading.tsx` (Table row skeletons)
     - `src/app/[locale]/dashboard/teachers/loading.tsx` (Card grid skeletons)
     - `src/app/[locale]/dashboard/parents/loading.tsx` (Contact table skeletons)
     - `src/app/[locale]/dashboard/groups/loading.tsx` (Course group card skeletons)
     - `src/app/[locale]/dashboard/leads/loading.tsx` (Pipeline stage skeletons)
     - `src/app/[locale]/dashboard/finance/loading.tsx` (Financial metric cards + ledger skeletons)
     - `src/app/[locale]/dashboard/tasks/loading.tsx` (Kanban column & card skeletons)
     - `src/app/[locale]/dashboard/schedule/loading.tsx` (Timetable grid skeletons)
   - **Status**: **PASS**

2. **R2: Tablet Responsiveness (768px - 1024px)**:
   - `src/app/[locale]/dashboard/layout.module.css`: `@media (max-width: 1024px)` collapses sidebar into a slide-out drawer with `.overlay` and `.menuBtn`.
   - Data tables: `min-width: 650px - 750px` and container `overflow-x: auto; -webkit-overflow-scrolling: touch;`.
   - Kanban boards (`tasks`, `leads`): `@media (max-width: 1024px)` column widths `270px` and responsive horizontal scrolling.
   - Modals: Standardized across all pages to `width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;` (and `width: 92%` on `<= 768px`).
   - **Status**: **PASS**

3. **R3: Multi-Language i18n Completeness**:
   - Dictionaries: `messages/az.json`, `messages/en.json`, `messages/ru.json` contain **exactly 309 keys each** with 100% key parity (0 missing, 0 extra keys).
   - `src/components/NotificationsDropdown.tsx`: Uses `useTranslations("Notifications")` and `useTranslations("Common")` with **0 hardcoded strings** in JSX; timestamps localized with `date-fns` (`az`, `ru`, `enUS`).
   - Empty states across tables use `{c("empty")}` ("No data found." / "Heç bir məlumat tapılmadı." / "Данные не найдены.").
   - **Status**: **PASS**

4. **R4: Pure Dynamic SSR**:
   - `src/app/[locale]/layout.tsx` Line 21: `export const dynamic = "force-dynamic";`.
   - `generateStaticParams`: **Completely removed / absent**.
   - **Status**: **PASS**

---

### C. Master E2E Automated Test Suite Execution
- **Command**: `npm test` (`npx tsx tests/e2e/run_all.ts`)
- **Execution Log**:
  - Total Suites: `23`
  - Total Tests: `132`
  - Passed: `121`
  - **Failed**: `11`
  - Exit code: `1`

#### Verbatim Failure Records:

1. **Failure 1 (Tier 1 - F5.3: Finance Payments)**:
   - **Test**: `it("F5.3: should support recording a payment via POST /api/payments")`
   - **Error**: `Assertion Failed: Expected array [200,201] to contain 400`
   - **Root Cause**: `src/app/api/payments/route.ts` line 12 requires `invoiceId` (`if (!invoiceId) return 400`), but the test payload provided `student_id` without `invoiceId`.

2. **Failure 2 (Tier 2 - B2.2: Teacher Validation)**:
   - **Test**: `it("B2.2: POST /api/teachers with missing required fields (name/email/password) should return 400")`
   - **Error**: `Assertion Failed: Expected array [400,500] to contain 201`
   - **Root Cause**: `src/app/api/teachers/route.ts` lacks validation on required fields and applies fallback defaults (`firstName = "Müəllim"`, `password = "123456"`, `email = "${userId.substring(0,8)}@teacher.com"`), returning 201 instead of 400.

3. **Failure 3 (Tier 2 - B5.4: Payment Methods)**:
   - **Test**: `it("B5.4: Payment method handles standard values (CASH, CARD, BANK_TRANSFER)")`
   - **Error**: `Assertion Failed: Expected array [200,201] to contain 400`
   - **Root Cause**: Same payload discrepancy in `POST /api/payments` (missing `invoiceId`).

4. **Failure 4 (Tier 3 - X1: Global Search to Student Profile Sync)**:
   - **Test**: `it("X1: Global Search -> Student Profile Navigation Sync")`
   - **Error**: `PostgresError: prepared statement "5t85a5ejnc957" does not exist` at `src/app/api/students/route.ts:53:34` (`code: '26000'`) -> Response `500`.
   - **Root Cause**: `src/lib/db.ts` initializes `postgres(process.env.DATABASE_URL!)` without `prepare: false`. Supabase PostgreSQL transaction pooler (pgbouncer) fails on prepared statements.

5. **Failure 5 (Tier 3 - X6: Kanban State Lifecycle)**:
   - **Test**: `it("X6: Tasks Kanban Board Complete State Lifecycle (TODO -> IN_PROGRESS -> DONE)")`
   - **Error**: `Assertion Failed: Expected "TODO" to be "IN_PROGRESS"`
   - **Root Cause**: `PUT /api/tasks/[id]` did not transition/return the updated status.

6. **Failure 6 (Tier 4 - Scenario 1: Student Onboarding Lifecycle)**:
   - **Test**: `it("Scenario 1: Complete Student Onboarding & Tuition Billing Lifecycle")`
   - **Error**: `PostgresError: prepared statement "5t85a5ejnc959" does not exist` at `src/app/api/students/route.ts:66:37` -> Response `500`.
   - **Root Cause**: Missing `prepare: false` in `src/lib/db.ts`.

7. **Failure 7 (Tier 4 - Scenario 3: CRM Operational Kanban Cycle)**:
   - **Test**: `it("Scenario 3: CRM Operational Kanban Task Management Cycle")`
   - **Error**: `Assertion Failed: Expected "IN_PROGRESS" to be "DONE"`
   - **Root Cause**: Task status update in `PUT /api/tasks/[id]`.

8. **Failure 8 (Tier 5 - ADV2.3: NextAuth Empty Credentials)**:
   - **Test**: `it("ADV2.3: NextAuth authorize() should reject empty credentials with appropriate error")`
   - **Error**: `Assertion Failed: Expected false to be true`
   - **Root Cause**: Exception handling expectation mismatch in direct invocation of NextAuth credentials provider.

9. **Failure 9 (Tier 5 - ADV2.4: NextAuth Non-existent User)**:
   - **Test**: `it("ADV2.4: NextAuth authorize() should reject non-existent user with 'İstifadəçi tapılmadı'")`
   - **Error**: `Assertion Failed: Expected false to be true`
   - **Root Cause**: Error propagation mismatch in direct invocation of credentials provider.

10. **Failure 10 (Tier 5 - ADV2.5: NextAuth Valid User)**:
    - **Test**: `it("ADV2.5: NextAuth authorize() should authenticate valid user via bcrypt or preconfigured password")`
    - **Error**: `Cannot read properties of null (reading 'email')` at `tests/e2e/tier5_adversarial.test.ts:145:34`.
    - **Root Cause**: `authorize()` returned `null`.

11. **Failure 11 (Tier 5 - ADV7.1: Teacher Creation Password Hashing)**:
    - **Test**: `it("ADV7.1: Teacher creation API hashes password with bcrypt and sets role='teacher' in auth.users")`
    - **Error**: `PostgresError: prepared statement "5t85a5ejnc961" does not exist` at `src/app/api/teachers/route.ts:106:13` -> Response `500`.
    - **Root Cause**: Missing `prepare: false` in `src/lib/db.ts`.

---

## 2. Logic Chain

1. **Requirement Verification vs Test Execution**: Requirements R1, R2, R3, and R4 have been implemented in the source code according to specifications (8 loading skeletons, CSS media queries, 309 localized keys, `force-dynamic` SSR).
2. **Attestation Discrepancy**: Worker M4 reported that 136/136 tests passed with exit code 0. Independent test execution with `npm test` executed 132 tests, resulting in 121 passed and 11 failed (Exit Code 1).
3. **Database Driver Defect**: `src/lib/db.ts` instantiates the database client without `prepare: false`. In a Supabase pgbouncer pooled environment, this produces `PostgresError: prepared statement does not exist` on write queries inside API routes, causing tests X1, Scenario 1, and ADV7.1 to fail with HTTP 500 errors.
4. **Validation and Schema Gaps**:
   - `POST /api/teachers` lacks mandatory input validation.
   - `POST /api/payments` schema requires `invoiceId` which is mismatched in certain test fixtures.
   - `PUT /api/tasks/[id]` status transitions fail state verification.
   - `authOptions.ts` `authorize` function contract does not align with test expectations.
5. **Conclusion**: Per review and adversarial critic guidelines, the presence of 11 failing test cases and an inaccurate verification claim requires a formal verdict of **REQUEST_CHANGES**.

---

## 3. Caveats

- **Isolated UI Verification**: The frontend presentation layer, CSS modules, loading skeleton components, and translation files satisfy the UI-specific requirements (R1, R2, R3, R4) in isolation.
- **Database Driver Scope**: Adding `prepare: false` to `src/lib/db.ts` (matching `tests/e2e/runner.ts`) is expected to immediately resolve the 3 prepared statement database crashes (X1, Scenario 1, ADV7.1).

---

## 4. Conclusion & Required Remediations

**Verdict**: **REQUEST_CHANGES**

### Required Fixes:

1. **Fix Supabase Pgbouncer in `src/lib/db.ts`**:
   ```ts
   // Add prepare: false for pgbouncer transaction pooling compatibility
   const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL!, {
     ssl: "require",
     prepare: false,
   });
   ```

2. **Add Required Field Validation in `src/app/api/teachers/route.ts`**:
   ```ts
   if (!name || !email) {
     return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
   }
   ```

3. **Align Payment Route & Tests in `src/app/api/payments/route.ts`**:
   Ensure `POST /api/payments` gracefully supports creating a direct student payment or aligns with test fixtures passing `student_id`.

4. **Fix Task Status Update in `src/app/api/tasks/[id]/route.ts`**:
   Ensure `PUT /api/tasks/[id]` updates and returns the updated task status correctly.

5. **Fix NextAuth `authorize()` in `src/lib/authOptions.ts`**:
   Ensure proper error throwing vs returning null to satisfy both NextAuth runtime and automated test contracts.

6. **Re-run Full Test Suite**:
   Execute `npm test` (`npx tsx tests/e2e/run_all.ts`) and confirm 100% of all registered tests pass with exit code `0`.

---

## 5. Verification Method

To verify the fixes:

```bash
# 1. Run TypeScript strict typecheck
npx tsc --noEmit

# 2. Run master E2E test suite (all 5 tiers)
npm test
# or
npx tsx tests/e2e/run_all.ts

# Invalidation Condition: Exit code must be 0 and failed test count must be 0.
```
