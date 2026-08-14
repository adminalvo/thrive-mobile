## 2026-08-15T03:10:25Z

You are Worker for Milestone 4 Iteration 3.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m4_it3

MANDATORY CONTEXT FILES TO READ FIRST:
1. ORIGINAL_REQUEST.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
2. PROJECT.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
3. TEST_INFRA.md: c:/Users/mexty/OneDrive/Desktop/thrive-crm/TEST_INFRA.md
4. Explorer 1 Handoff (Payments FK Fix): c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_1/handoff.md
5. Explorer 2 Handoff (NextAuth ADV2.5 Fix): c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_2/handoff.md
6. Forensic Auditor Report: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/auditor_m4_it2_1_gen2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
- src/app/api/payments/route.ts
- src/app/api/students/[id]/route.ts
- src/app/api/finance/route.ts
- src/lib/authOptions.ts
- tests/e2e/tier5_adversarial.test.ts

IMPLEMENTATION TASKS:
1. **`src/app/api/payments/route.ts`**:
   - In `POST /api/payments`, resolve the student's `user_id` by querying:
     `SELECT s.id AS student_id, p.id AS profile_id, p.user_id AS user_id, p.first_name, p.last_name, p.phone, p.email FROM students s JOIN user_profiles p ON s.profile_id = p.id WHERE s.id = ${studentId} OR p.id = ${studentId} OR p.user_id = ${studentId} LIMIT 1`
   - Insert `targetUserId` into `payments.student_id` (which satisfies the foreign key `payments_student_id_fkey` -> `auth.users(id)`).
   - Return formatted JSON containing `studentId: studentRecord.student_id || studentId`, `amount`, `paidAmount`, `status`, `dueDate`, `paymentMethod`, and full `student: { id, name, phone, email, user: { name } }` with HTTP status 201.
   - Refer to the exact code in `explorer_m4_it3_1/handoff.md`.

2. **`src/app/api/students/[id]/route.ts`**:
   - In `GET /api/students/[id]`, update the payments query to:
     `WHERE p.student_id = ${id} OR p.student_id = ${s.user_id} OR p.student_id = ${s.profile_id}`
   - This ensures student profile financial stats (`totalPaid` and `totalDebt`) correctly compute from payments.

3. **`src/app/api/finance/route.ts`**:
   - In `GET /api/finance`, ensure the payments query joins:
     `LEFT JOIN auth.users u ON p.student_id = u.id LEFT JOIN user_profiles pr ON pr.user_id = u.id OR p.student_id = pr.id LEFT JOIN students s ON s.profile_id = pr.id OR p.student_id = s.id`

4. **`src/lib/authOptions.ts`**:
   - Assign `credentialsProvider.authorize = (credentialsProvider as any).options.authorize` so direct provider calls in tests and NextAuth runtime execute the developer's callback. Refer to `explorer_m4_it3_2/handoff.md`.

5. **`tests/e2e/tier5_adversarial.test.ts`**:
   - Update `ADV2.3`, `ADV2.4`, `ADV2.5` to use `const authFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;`. Refer to `explorer_m4_it3_2/handoff.md`.

6. **MANDATORY EMPIRICAL VERIFICATION (Run all 3)**:
   - Run `npx tsc --noEmit` (Must be 0 errors).
   - Run `npm run build` (Must succeed and show `ƒ (Dynamic)` for all `/dashboard/...` routes).
   - Run `npx tsx tests/e2e/run_all.ts` (Must pass 132/132 tests across all 5 Tiers with exit code 0).

7. **OUTPUT**:
   - Write comprehensive `handoff.md` to `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m4_it3/handoff.md` with:
     - 1. Observation (files changed and rationale)
     - 2. Logic Chain (root cause -> fix -> outcome)
     - 3. Caveats (if any)
     - 4. Conclusion (summary of fixes)
     - 5. Verification Method & Empirical Output (full output of tsc, npm run build, and run_all.ts showing 132/132 passed).
   - Send completion message to parent when done.
