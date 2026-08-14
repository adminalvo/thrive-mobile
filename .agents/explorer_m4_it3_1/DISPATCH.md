## 2026-08-15T02:33:00Z
Investigate the foreign key constraint failure in `src/app/api/payments/route.ts` which caused 4 test failures (F5.3, B5.4, X4, Scenario 1).
Specifically:
- Check the foreign key constraint `payments_student_id_fkey` on the `payments` table. What table and column does `payments.student_id` reference? (e.g. `users.id`, `user_profiles.id`, or `students.user_id`?)
- Check `src/app/api/students/route.ts` and `src/app/api/payments/route.ts` and database schemas/migrations to see how `students`, `user_profiles`, and `payments` tables relate.
- When creating a payment via `POST /api/payments` with `studentId` (or `student_id`), how should the payment record resolve the foreign key reference? If `studentId` is passed, does `SELECT user_id FROM students WHERE id = ${studentId}` give the foreign key `student_id` for `payments`? Or does `students` table have `user_id` / `profile_id`? Or if `studentId` is already a user ID, what should be inserted?
- Provide exact, verified code changes for `src/app/api/payments/route.ts` that will resolve F5.3, B5.4, X4, and Scenario 1 cleanly and authentically.
