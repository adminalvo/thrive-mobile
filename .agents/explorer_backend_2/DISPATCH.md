## 2026-08-15T21:38:30Z

You are Explorer 2 for AI Backend Enhancements.
Working directory: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2
Project root: c:\Users\mexty\OneDrive\Desktop\thrive-crm
Original Request file: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\ORIGINAL_REQUEST.md

Task:
1. Inspect `@/lib/db` (look for `src/lib/db.ts`, `src/lib/db/index.ts`, or similar) to see how the `sql` tagged template or helper is exported and used across the codebase.
2. Search and inspect the database schema / tables / migrations / types for:
   - `teachers` (expected fields: name, phone, email, subject, base_salary, id, created_at, etc.)
   - `students` (expected fields: first_name, last_name, phone, fin, grade, parent_phone, id, created_at, etc.)
   - `groups` (expected fields: name, teacher_id, schedule, subject, price, id, created_at, etc.)
3. Check existing API routes or server actions in `src/app/api/` or `src/lib/` or `src/actions/` that query or insert into these tables to see exact column names and SQL query patterns.
4. Write your detailed findings, exact table names, column names, constraints, and SQL snippets to `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\analysis.md` and `handoff.md`.
5. Send a completion message back to parent.
