# AI Backend Enhancements Plan

## Architecture & Objective
Update `src/app/api/ai/route.ts` to add robust fallback to OpenRouter GPT-4o on Gemini failure, and expand the AI tool registry with CRM database operations via `@/lib/db`.

## Milestones & Work Items
1. **Milestone 1: Codebase & Schema Exploration**
   - Inspect `src/app/api/ai/route.ts`, existing tools, message format, client initialization.
   - Inspect `@/lib/db.ts` (or `@/lib/db/index.ts`) to understand `sql` helper usage and table schemas (teachers, students, groups).
   - Inspect any migration/schema files or TypeScript types for `teachers`, `students`, `groups` to ensure columns match requirements:
     - `create_teacher` (name, phone, email, subject, base_salary)
     - `create_student` (first_name, last_name, phone, fin, grade, parent_phone)
     - `create_group` (name, teacher_id, schedule, subject, price)
     - `get_teachers`
     - `get_students`
   - Investigate fallback client pattern and how `model` + client selection should persist across initial call and tool-result follow-up call.

2. **Milestone 2: Implementation (Worker)**
   - Wrap initial `client.chat.completions.create` in try/catch.
   - On error, initialize `fallbackClient` (`baseURL: "https://openrouter.ai/api/v1"`, `apiKey: process.env.OPENROUTER_API_KEY || "missing-key"`) and call with `model: "openai/gpt-4o"`.
   - Track active client and active model so subsequent completions (after executing tool calls) use the same active client and model.
   - Define OpenAI tool definitions for all 5 new functions with proper JSON schema parameters.
   - Implement function executors using `sql` helper for database operations.
   - Ensure tool execution results are properly formatted, added to `finalMessages`, and AI is re-invoked.
   - Verify TypeScript compilation (`npm run build` or `npx tsc --noEmit`).

3. **Milestone 3: Review, Challenge & Audit**
   - Independent review for correctness, completeness, edge case handling, and TypeScript conformance.
   - Adversarial challenge for fallback switching, database operations, error handling, parameter parsing.
   - Forensic integrity audit ensuring no mock shortcuts or hardcoded responses.

4. **Milestone 4: Synthesis & Sentinel Handoff**
   - Verify all pass criteria.
   - Write `handoff.md` and report to Sentinel.
