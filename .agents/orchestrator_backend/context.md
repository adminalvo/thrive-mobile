# Task Context

User Request:
AI Backend Enhancements in `src/app/api/ai/route.ts`:
1. Wrap the current `client.chat.completions.create` in a try/catch block.
2. If the Gemini API call fails, initialize a new fallback OpenAI client pointing to OpenRouter:
```typescript
const fallbackClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "missing-key"
});
```
And execute the exact same call (messages, tools, etc.) using `fallbackClient` and `model: "openai/gpt-4o"`.
3. Add a bunch of new tools to the `tools` array to give the AI full control over the CRM. Add functions and executors for:
   - `create_teacher` (name, phone, email, subject, base_salary)
   - `create_student` (first_name, last_name, phone, fin, grade, parent_phone)
   - `create_group` (name, teacher_id, schedule, subject, price)
   - `get_teachers` (returns a list of teachers)
   - `get_students` (returns a list of students)
Use the `sql` helper from `@/lib/db` to interact with the database.

Ensure you properly handle the tool executions exactly as it currently does (parsing JSON arguments, running the function, pushing to `finalMessages`, and calling the AI again). If the first call used the fallback client, the second call must also use the fallback client.

Reference: `ORIGINAL_REQUEST.md` located at `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\ORIGINAL_REQUEST.md`.
