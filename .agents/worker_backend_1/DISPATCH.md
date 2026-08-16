## 2026-08-15T21:40:29Z
You are Worker 1 for AI Backend Enhancements.
Working directory: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\worker_backend_1
Project root: c:\Users\mexty\OneDrive\Desktop\thrive-crm
Original Request file: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\ORIGINAL_REQUEST.md
Explorer Reports:
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_1\analysis.md`
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_2\analysis.md`
- `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_backend_3\analysis.md`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task:
Implement the complete enhancements in `src/app/api/ai/route.ts`:
1. Fallback OpenAI Client to OpenRouter:
   - Primary client connects to Gemini (`gemini-3.6-flash` or as configured with Gemini OpenAI compatibility).
   - Wrap initial `client.chat.completions.create` in a try/catch block.
   - If Gemini fails, initialize `fallbackClient`:
     ```typescript
     const fallbackClient = new OpenAI({
       baseURL: "https://openrouter.ai/api/v1",
       apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
     });
     ```
     And execute the exact same call (messages, tools, etc.) using `fallbackClient` and `model: "openai/gpt-4o"`.
   - Keep track of `activeClient` and `activeModel` so that if the first call used the fallback client, any second call (after tool executions) must also use `fallbackClient` and `activeModel`.

2. Add CRM Database Tools:
   Add functions and OpenAI tool definitions for:
   - `create_teacher` (name, phone, email, subject, base_salary)
   - `create_student` (first_name, last_name, phone, fin, grade, parent_phone)
   - `create_group` (name, teacher_id, schedule, subject, price)
   - `get_teachers` (returns list of teachers)
   - `get_students` (returns list of students)
   - Keep existing `create_lead` and `get_financial_stats`.

3. Database Operations:
   - Use `import sql from "@/lib/db";`
   - Use genuine SQL queries to interact with `auth.users`, `user_profiles`, `teachers`, `students`, `groups`, `programs`, etc.
   - Ensure proper transaction / query execution and robust error handling for each tool.

4. Multi-Turn / Tool Execution Handling:
   - Accurately parse tool call JSON arguments.
   - Execute corresponding tool functions.
   - Add tool result messages with `role: "tool"`, `tool_call_id`, `name`, `content` to `finalMessages`.
   - Issue second completion using `activeClient` and `activeModel`.
   - Return `{ content: finalContent }`.

5. Verification:
   - Run `npx tsc --noEmit` or `npm run build` to verify there are 0 TypeScript or build errors.
   - Write comprehensive report to `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\worker_backend_1\handoff.md`.
   - Send completion message to parent.
