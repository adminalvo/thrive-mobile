# Handoff Report: AI Backend Enhancements & Tool Schemas

**Author:** Explorer Backend 3  
**Working Directory:** `.agents/explorer_backend_3/`  
**Handoff Type:** Hard (Complete)  
**Date:** 2026-08-16  

---

## 1. Observation

### 1.1 Existing Route Implementation (`src/app/api/ai/route.ts`)
- **Lines 7–10:** Primary OpenAI client initialization with Gemini endpoint:
  ```typescript
  const client = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY || "missing-key-during-build"
  });
  ```
- **Lines 13–42:** Currently defines 2 tools: `create_lead` and `get_financial_stats`.
- **Lines 97–102:** Calls `client.chat.completions.create` with `model: "gemini-3.6-flash"` directly without a fallback `try/catch`.
- **Lines 106–138:** Iterates `aiMessage.tool_calls`, executes functions synchronously, appends tool responses with `{ role: "tool", tool_call_id, name, content }` to `finalMessages`, and issues a second completion call using `client.chat.completions.create`.

### 1.2 Database Models & Existing Query Patterns
- **Database Helper:** `@/lib/db.ts` exposes `sql` (`postgres` instance with connection pooling).
- **Teacher Pattern (`src/app/api/teachers/route.ts:80–112`):** Inserts `auth.users`, `user_profiles`, and `teachers` within `sql.begin(async (tx) => ...)`, hashing password with `bcrypt`.
- **Student Pattern (`src/app/api/students/route.ts:48–93`):** Inserts `auth.users`, `user_profiles`, and `students` with `sql.begin`.
- **Group Pattern (`src/app/api/groups/route.ts:39–43`):** Inserts `groups (name, program_id, teacher_id, room)`.
- **Table Definitions (`src/app/api/init-db/route.ts:8–156`):**
  - `user_profiles` (id, user_id, first_name, last_name, email, phone, created_at)
  - `teachers` (id, profile_id, specialization, created_at)
  - `students` (id, profile_id, created_at)
  - `parents` (id, profile_id, fin_code, id_card_number, created_at)
  - `groups` (id, name, program_id, teacher_id, room, created_at)
  - `programs` (id, name, deleted_at, created_at)
  - `group_schedules` (id, group_id, day_of_week, start_time, end_time, room, teacher_id, created_at)

---

## 2. Logic Chain

1. **Schema Compliance:**
   - OpenAI tool format requires `{ type: "function", function: { name, description, parameters: { type: "object", properties, required } } }`.
   - Tool definitions for `create_teacher`, `create_student`, `create_group`, `get_teachers`, and `get_students` must adhere to this standard with descriptive Azerbaijani prompts so the LLM knows when and how to extract arguments.

2. **Database Integrity & Foreign Key Satisfaction:**
   - In Thrive CRM, `students` and `teachers` reference `user_profiles.id`, and `user_profiles` reference `auth.users.id`.
   - Executing `create_teacher` and `create_student` via transactions (`sql.begin`) ensures atomic creation of auth user -> profile -> role -> teacher/student table.
   - For `create_group`, if a subject name is provided, finding or creating a corresponding `programs` entry ensures relational consistency.

3. **Resilience & Fallback Strategy:**
   - If Gemini (`gemini-3.6-flash`) encounters quota limits, latency spikes, or network errors, wrapping in `try/catch` allows instant failover to OpenRouter (`openai/gpt-4o`).
   - Maintaining `activeClient` and `activeModel` ensures that if the first step fell back to OpenRouter, the second completion call (after tool execution) also uses OpenRouter with the identical context.
   - Guarding `JSON.parse(toolCall.function.arguments)` and individual tool executions prevents any single malformed or failed tool call from crashing the API route.

---

## 3. Caveats

- **API Keys:** `OPENROUTER_API_KEY` and `GEMINI_API_KEY` must be set in `.env.local` or environment variables for live calls.
- **Multimodal Payload Handling:** When user messages contain image payloads (`content: [{ type: "text", text: ... }, { type: "image_url", ... }]`), both `gemini-3.6-flash` and `openai/gpt-4o` handle this natively via the OpenAI SDK `messages` array.
- **Password Hashes:** Synthetic placeholder auth users created via AI use bcrypt hash of `"123456"`.

---

## 4. Conclusion

The complete tool schemas, executor implementations, fallback logic, and route structure are fully designed and documented in `analysis.md`. The implementer can directly apply the proposed code in `analysis.md` (Section 7) to `src/app/api/ai/route.ts`.

---

## 5. Verification Method

1. **Static Analysis & Type Checking:**
   - Run `npx tsc --noEmit` or `npm run lint` to verify that `src/app/api/ai/route.ts` compiles without TypeScript errors.
2. **API Execution Test:**
   - Send test POST requests to `/api/ai` with JSON payloads:
     - `{"messages": [{"role": "user", "content": "Müəllimlərin siyahısını göstər"}]}` -> Verifies `get_teachers` execution.
     - `{"messages": [{"role": "user", "content": "Yeni tələbə yarat: Murad Əliyev, nömrəsi 0501234567"}]}` -> Verifies `create_student` execution.
     - `{"messages": [{"role": "user", "content": "Yeni IELTS qrupu yarat"}]}` -> Verifies `create_group` execution.
   - Test failover by providing an invalid Gemini key and verifying OpenRouter fallback executes smoothly.
