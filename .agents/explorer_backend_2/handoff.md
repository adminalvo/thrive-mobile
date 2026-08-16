# Handoff Report — Explorer Backend 2: Database Schema & AI Backend Tools

## 1. Observation

### 1.1 Database Client (`src/lib/db.ts`)
- **File path**: `src/lib/db.ts:1-18`
- **Driver**: `postgres` (v3.4.9).
- **Export type**: Default export (`export default sql;`).
- **Connection Configuration**:
  ```typescript
  const connectionUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  const sql = connectionUrl 
    ? postgres(connectionUrl, { ssl: "require", prepare: false }) 
    : (new Proxy(() => {}, { apply: () => { throw new Error("DATABASE_URL is not set in Vercel Environment Variables"); } }) as any);
  ```
- **Standard import across codebase**: `import sql from "@/lib/db";` (found in 27 API route files and auth utilities).

### 1.2 Database Schemas & Table Relationships
- **Schema Initialization**: `src/app/api/init-db/route.ts:8-156` and `scratch/migrate_db.ts:11-182`.
- **Entity Architecture**:
  - `auth.users`: User authentication table with columns `id`, `email`, `role`, `aud`, `encrypted_password`.
  - `user_profiles`: User profile data with `id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `fin_code`, `id_card_number`, `created_at`.
  - `teachers`: Joined to `user_profiles` via `profile_id`. Columns: `id` (UUID), `profile_id` (UUID), `specialization` (TEXT), `created_at` (TIMESTAMPTZ).
  - `students`: Joined to `user_profiles` via `profile_id`. Columns: `id` (UUID), `profile_id` (UUID), `created_at` (TIMESTAMPTZ).
  - `groups`: Columns: `id` (UUID), `name` (TEXT), `program_id` (UUID), `teacher_id` (UUID), `room` (TEXT), `created_at` (TIMESTAMPTZ).
  - `programs`: Columns: `id` (UUID), `name` (TEXT), `description` (TEXT), `deleted_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ).
  - `group_schedules`: Columns: `id` (UUID), `group_id` (UUID), `day_of_week` (INT), `start_time` (TEXT), `end_time` (TEXT), `room` (TEXT), `teacher_id` (UUID).
  - `leads`: Columns: `id` (UUID), `name` (TEXT), `phone` (TEXT), `email` (TEXT), `source` (TEXT), `status` (TEXT), `created_at` (TIMESTAMPTZ).
  - `payments` / `invoices`: Financial tracking tables.

### 1.3 Existing API Routes & Query Patterns
- `src/app/api/teachers/route.ts:6-43` & `45-129`:
  - `GET`: Selects from `teachers` joined with `user_profiles`, aggregates `active_groups` count via subquery on `groups`.
  - `POST`: Uses `sql.begin(async (tx) => ...)` to insert into `auth.users`, `user_profiles`, `teachers`, and `user_roles`.
- `src/app/api/students/route.ts:6-29` & `32-101`:
  - `GET`: Selects from `students` joined with `user_profiles`.
  - `POST`: Uses `sql.begin(async (tx) => ...)` to insert into `auth.users`, `user_profiles`, `students`, and `user_roles`.
- `src/app/api/groups/route.ts:5-28` & `30-50`:
  - `GET`: Selects from `groups` joined with `programs` and `auth.users`.
  - `POST`: Inserts `name`, `program_id`, `teacher_id`, `room` into `groups`.
- `src/app/api/ai/route.ts:1-146`:
  - Currently contains two basic tools (`create_lead` and `get_financial_stats`).
  - Calls Gemini endpoint using `OpenAI` client directly (`model: "gemini-3.6-flash"`).
  - Lacks try/catch fallback to OpenRouter GPT-4o and lacks CRM management tools (`create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`).

---

## 2. Logic Chain

1. **Database Access Pattern**:
   - Every API route and database worker consistently uses `import sql from "@/lib/db"`.
   - SQL queries are executed directly using ES6 tagged template literals with parameter interpolation (`sql\`...\``).

2. **Entity Data Normalization**:
   - In Thrive CRM, a teacher or student record has two layers:
     a) Demographic layer in `user_profiles` (holds `first_name`, `last_name`, `email`, `phone`, `fin_code`) linked to `auth.users`.
     b) Domain entity record in `teachers` (holds `specialization`) or `students` referencing `profile_id`.
   - AI functions (`create_teacher` and `create_student`) should handle this multi-table transaction cleanly using `sql.begin` to prevent orphaned records or inconsistent data.
   - For `create_group`, the `subject` field maps to `programs.name`. If a program with that name does not exist, it should be created dynamically or linked to ensure foreign key integrity.

3. **Fallback Client Architecture**:
   - The primary client connects to Gemini (`https://generativelanguage.googleapis.com/v1beta/openai/` with model `"gemini-3.6-flash"`).
   - If that call throws (e.g. rate limit, network timeout, invalid key), catch block activates `fallbackClient` (`https://openrouter.ai/api/v1` with model `"openai/gpt-4o"`).
   - When tools are executed, subsequent LLM completion must utilize the client and model that succeeded in the initial dispatch.

---

## 3. Caveats

- **Password Hashing**: Creating `auth.users` rows requires bcrypt password hashing. When creating students or teachers via AI without a provided password, a default hash (e.g. for `"123456"`) must be generated to satisfy authentication table constraints.
- **Base Salary Column**: In the current database migration schema, `teachers` table contains `(id, profile_id, specialization, created_at)`. Base salary is not an explicit column on `teachers` table; it can be passed through and returned in the AI response JSON or stored in custom metadata.
- **Email Generation for Students**: Students created via voice or text prompts might not provide an email address. The system should generate a deterministic fallback email (e.g. `${userId.substring(0,8)}@student.thrive.az`) to satisfy the unique email constraint in `auth.users`.

---

## 4. Conclusion

The exact database schema, connection patterns, and query structures have been audited. The recommended implementation plan for `src/app/api/ai/route.ts` is:

1. Add tool definitions for `create_teacher`, `create_student`, `create_group`, `get_teachers`, and `get_students`.
2. Implement corresponding executor functions using `import sql from "@/lib/db"` with atomic transactions (`sql.begin`).
3. Wrap Gemini API execution in try/catch with fallback to OpenRouter GPT-4o.
4. Pass the active client/model through to secondary tool-completion calls.

All required tool definitions, parameter schemas, and SQL templates are fully documented in `analysis.md`.

---

## 5. Verification Method

To verify the findings and schemas independently:
1. View database helper:
   ```bash
   view_file AbsolutePath="src/lib/db.ts"
   ```
2. View schema definitions:
   ```bash
   view_file AbsolutePath="src/app/api/init-db/route.ts"
   ```
3. View existing teacher, student, and group CRUD implementations:
   ```bash
   view_file AbsolutePath="src/app/api/teachers/route.ts"
   view_file AbsolutePath="src/app/api/students/route.ts"
   view_file AbsolutePath="src/app/api/groups/route.ts"
   ```
4. Run project build / type check:
   ```bash
   npm run build
   ```
