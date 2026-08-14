# BRIEFING — 2026-08-15T02:38:00Z

## Mission
Investigate the foreign key constraint failure in `src/app/api/payments/route.ts` affecting tests F5.3, B5.4, X4, and Scenario 1, and propose exact verified fix.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, analysis, synthesis
- Working directory: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_1
- Original parent: 9df0eece-df84-44d1-85a4-677153dfa90f
- Milestone: Milestone 4 Iteration 3

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code files.
- Deliver findings and code proposal in handoff.md.

## Current Parent
- Conversation ID: 9df0eece-df84-44d1-85a4-677153dfa90f
- Updated: 2026-08-15T02:38:00Z

## Investigation State
- **Explored paths**:
  - PostgreSQL schema constraints via `pg_constraint` on `payments`, `students`, `user_profiles`, `auth.users`
  - `src/app/api/payments/route.ts`
  - `src/app/api/students/route.ts`
  - `src/app/api/students/[id]/route.ts`
  - `src/app/api/finance/route.ts`
  - `src/lib/authOptions.ts`
  - `tests/e2e/tier1_feature_coverage.test.ts` (F5.3)
  - `tests/e2e/tier2_boundary_corner.test.ts` (B5.4)
  - `tests/e2e/tier3_cross_feature.test.ts` (X4)
  - `tests/e2e/tier4_real_world.test.ts` (Scenario 1)
  - `tests/e2e/tier5_adversarial.test.ts` (ADV2.5)
- **Key findings**:
  - `payments_student_id_fkey` references `auth.users(id)` ON DELETE CASCADE.
  - `students` table has NO `user_id` column; it only has `profile_id` referencing `user_profiles(id)`. `user_profiles` has `user_id` referencing `auth.users(id)`.
  - When `POST /api/payments` receives a `student_id` (which is `students.id`), inserting `students.id` directly into `payments.student_id` causes error 23503 because `students.id` is not in `auth.users`.
  - The resolution requires joining `students` -> `user_profiles` to obtain `user_id`, and inserting `user_id` into `payments.student_id`.
  - `src/app/api/students/[id]/route.ts` must query payments with `WHERE p.student_id = ${id} OR p.student_id = ${s.user_id} OR p.student_id = ${s.profile_id}` so that student stats reflect the recorded payments.
  - ADV2.5 failed because NextAuth's `CredentialsProvider` wrapper stubs `authorize: () => null` at the top level while putting the user callback in `provider.options.authorize`.
- **Unexplored areas**: None. All root causes and code solutions fully verified empirically.

## Key Decisions Made
- Designed comprehensive resolution queries supporting `students.id`, `user_profiles.id`, and `auth.users.id`.
- Verified end-to-end payment insertion and student profile debt recalculation with live PostgreSQL queries.

## Artifact Index
- `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_1/DISPATCH.md` — Initial task dispatch
- `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_1/progress.md` — Liveness and progress tracking
- `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_m4_it3_1/handoff.md` — Final handoff report
