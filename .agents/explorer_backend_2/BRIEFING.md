# BRIEFING — 2026-08-15T21:40:00Z

## Mission
Investigate database connection helper (`@/lib/db`), schema, migrations, tables (`teachers`, `students`, `groups`), and existing API routes/server actions for AI backend enhancements.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2
- Original parent: 2f3ca9b6-c1ba-45cb-b97e-f77edc8b07e2
- Milestone: DB Schema and Query Patterns Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Inspect `@/lib/db`, database schemas/types/migrations for teachers, students, groups, and existing API routes / server actions

## Current Parent
- Conversation ID: 2f3ca9b6-c1ba-45cb-b97e-f77edc8b07e2
- Updated: not yet

## Investigation State
- **Explored paths**: `src/lib/db.ts`, `src/app/api/init-db/route.ts`, `src/app/api/teachers/route.ts`, `src/app/api/teachers/[id]/route.ts`, `src/app/api/students/route.ts`, `src/app/api/students/[id]/route.ts`, `src/app/api/groups/route.ts`, `src/app/api/groups/[id]/route.ts`, `src/app/api/programs/route.ts`, `src/app/api/finance/route.ts`, `src/app/api/search/route.ts`, `src/app/api/ai/route.ts`, `scratch/migrate_db.ts`.
- **Key findings**:
  - `src/lib/db.ts` exports `sql` as default using `postgres` tagged templates.
  - Entities decouple auth (`auth.users`), demographics (`user_profiles`), and roles (`teachers`, `students`, `parents`).
  - Creation requires transaction via `sql.begin(async (tx) => ...)`.
  - Schema mapping for all requested AI tools (`create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`) synthesized.
  - Fallback logic specified for Gemini -> OpenRouter GPT-4o.
- **Unexplored areas**: None.

## Key Decisions Made
- Completed in-depth mapping of database schemas, foreign keys, insert patterns, and fallback logic in `analysis.md` and `handoff.md`.

## Artifact Index
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\DISPATCH.md` — Dispatch log
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\BRIEFING.md` — Persistent working memory
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\progress.md` — Liveness heartbeat
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\analysis.md` — Technical analysis report
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\handoff.md` — 5-component handoff report
