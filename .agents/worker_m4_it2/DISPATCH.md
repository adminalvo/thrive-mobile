## 2026-08-15T02:15:22Z
You are worker_m4_it2.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m4_it2
Read the original user request at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
Read the project specification at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
Read challenger_m4_2's feedback at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/challenger_m4_2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Assigned Fixes:
1. `src/lib/db.ts`:
   - Update postgres client initialization:
     ```ts
     import postgres from "postgres";
     const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL!;
     const sql = postgres(connectionUrl, {
       ssl: "require",
       prepare: false, // Required for Supabase pgbouncer transaction pooling
     });
     export default sql;
     ```
2. `src/app/api/payments/route.ts`:
   - In `POST /api/payments`, support creating/recording payments when `student_id` or `studentId` is provided, even if `invoiceId` is not provided.
3. `src/app/api/teachers/route.ts`:
   - Validate required fields (`name`, `email`): if missing/empty, return `NextResponse.json({ error: "Name and email are required" }, { status: 400 })`.
4. `src/app/api/tasks/[id]/route.ts`:
   - Ensure the `PUT /api/tasks/[id]` query properly updates `status`, `title`, `description`, `assignee_id`, `priority`, and `due_date` in SQL and returns the updated task record.
5. In `tests/e2e/tier5_adversarial.test.ts`:
   - Align NextAuth `ADV2.3` and `ADV2.4` test assertions to verify that `authorize()` returns `null` or throws when invalid/empty credentials are provided.

Verification Steps:
1. Run `npx tsc --noEmit` and confirm 0 errors.
2. Run `npx tsx tests/e2e/run_all.ts` (or `npm test`) and confirm that 100% of tests pass with exit code 0.
3. Document all changes and verification outputs in `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m4_it2/handoff.md`.
4. Send a completion message back to the orchestrator.
