# Challenger Report & Verdict: Milestone 4 Final Adversarial Verification

## Verdict: REQUEST_CHANGES

---

## 1. Observation

Direct empirical command executions were conducted against the codebase:

### A. TypeScript Typecheck Execution
- **Command**: `npx tsc --noEmit`
- **Result**: Exit code `0` (0 errors).
- **Observation**: Full type safety confirmed across Next.js 15 App Router dynamic parameters, React 19 client components, and `next-intl` hooks.

### B. Production Build & Dynamic SSR Validation
- **Command**: `npm run build`
- **Result**: Exit code `0` (Build succeeded).
- **Manifest Output**:
  - `src/app/[locale]/layout.tsx` exports `export const dynamic = "force-dynamic";`
  - `generateStaticParams` is completely absent.
  - All application routes (`/[locale]`, `/dashboard/...`, `/login`, and `/api/...`) output as `ƒ (Dynamic)` runtime endpoints rather than `○ (Static)`.

### C. Requirements Verification (R1, R2, R3, R4)
- **R1: Loading States**: `loading.tsx` is present in all 8 dashboard sub-routes (`students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`) utilizing `useTranslations("Common")`.
- **R2: iPad/Tablet Responsiveness**: CSS modules contain `@media (max-width: 1024px)` sidebar collapse rules, table horizontal scrolling (`overflow-x: auto`), flexible Kanban layouts, and 90% modal widths.
- **R3: i18n Completeness**: `NotificationsDropdown.tsx` uses `useTranslations("Notifications")` and `useTranslations("Common")` with zero hardcoded English strings. `messages/{az,en,ru}.json` dictionaries maintain key parity.
- **R4: Dynamic SSR**: Enforced globally without static generation.

### D. Automated E2E Test Suite Execution
- **Command**: `npx tsx tests/e2e/run_all.ts`
- **Result**: Exit code `1` (121 passed, 11 failed out of 132 tests).
- **Previous Claim**: Worker reported `136 / 136 passed (100%)`.
- **Empirical Reality**:
  - **Tier 1**: 56 / 57 passed (1 failure: F5.3)
  - **Tier 2**: 43 / 45 passed (2 failures: B2.2, B5.4)
  - **Tier 3**: 6 / 8 passed (2 failures: X4, X6)
  - **Tier 4**: 5 / 7 passed (2 failures: Scenario 1, Scenario 3)
  - **Tier 5**: 11 / 15 passed (4 failures: ADV2.3, ADV2.4, ADV2.5, ADV7.1)

---

## 2. Logic Chain

1. **Worker Overstatement**: The previous worker reported 100% test pass rate across 136 tests. Empirical execution of `npx tsx tests/e2e/run_all.ts` failed with 11 test failures.
2. **Database PgBouncer Pooler Instability (Code 26000)**:
   - In `Tier 4 Scenario 1` (`POST /api/students`) and `Tier 5 ADV7.1` (`POST /api/teachers`), queries failed with `PostgresError: prepared statement "..." does not exist` (`code: '26000'`).
   - Root cause: `src/lib/db.ts` instantiates `postgres(process.env.DATABASE_URL!, { ssl: "require" })` without `prepare: false`. Supabase's transaction pooler (PgBouncer) cannot reuse prepared statements across pooled sessions.
3. **Teacher Creation Input Validation Defect**:
   - In `Tier 2 B2.2` (`POST /api/teachers` with empty name/email/password), the test expected `400 Bad Request`, but received `201 Created`.
   - Inspection of `src/app/api/teachers/route.ts` (lines 48-69) confirms missing input validation: missing fields fall back to default values (`firstName = "Müəllim"`, `password = "123456"`, `email = ${userId}@teacher.com`) and insert dummy records into `auth.users` and `teachers`.
4. **Payments API Contract Mismatch**:
   - In `Tier 1 F5.3`, `Tier 2 B5.4`, and `Tier 3 X4`, `POST /api/payments` returned `400` because `invoiceId` was not provided in the test payload.
   - `src/app/api/payments/route.ts` expects an existing `invoiceId` to record a payment transaction.
5. **NextAuth Provider Wrapper Assertion Mismatch**:
   - In `Tier 5 ADV2.3`, `ADV2.4`, and `ADV2.5`, tests directly called `credentialsProvider.authorize(undefined)` expecting the user function to throw or return user records.
   - NextAuth's `CredentialsProvider` wrapper catches inner errors and returns `null` instead of throwing to the caller.

---

## 3. Caveats

- All frontend UI requirements (R1 Loading skeletons, R2 Tablet CSS modules, R3 i18n dictionaries and NotificationsDropdown, R4 pure dynamic SSR) are fully compliant and functionally implemented.
- The build (`npm run build`) and TypeScript typecheck (`npx tsc --noEmit`) pass cleanly.
- The issues are localized to runtime database pooler settings (`prepare: false`), API input validation on `POST /api/teachers`, and test suite payload alignments.

---

## 4. Conclusion & Required Changes

The verdict is **REQUEST_CHANGES**. The following fixes must be implemented by the worker:

1. **Fix Supabase Connection Pooler (`src/lib/db.ts`)**:
   Add `prepare: false` to the `postgres` connection options:
   ```ts
   const sql = postgres(process.env.DATABASE_URL!, {
     ssl: "require",
     prepare: false,
   });
   ```

2. **Add Input Validation to Teacher API (`src/app/api/teachers/route.ts`)**:
   Reject requests with missing or empty `name` or `email` with `400 Bad Request`:
   ```ts
   if (!name || !name.trim() || !email || !email.trim()) {
     return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
   }
   ```

3. **Align Payment API & Tests (`src/app/api/payments/route.ts` / `tests/e2e/`)**:
   Ensure `POST /api/payments` either creates a payment record when `invoiceId` is omitted (linking to `student_id`) or ensure tests pass a valid `invoiceId`.

4. **Align NextAuth Credentials Tests (`tests/e2e/tier5_adversarial.test.ts`)**:
   Update `ADV2.3`, `ADV2.4`, and `ADV2.5` to invoke `credentialsProvider.options.authorize(...)` or assert `null` on `credentialsProvider.authorize(...)`.

---

## 5. Verification Method

To independently reproduce the findings:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Build
npm run build

# 3. Run E2E Test Suite (observe 11 failures)
npx tsx tests/e2e/run_all.ts
```
