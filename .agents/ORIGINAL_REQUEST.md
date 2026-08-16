# Original User Request

## Initial Request — 2026-08-16T01:37:36+04:00

# Task: Chatbot Component Enhancements
Working directory: c:/Users/mexty/OneDrive/Desktop/thrive-crm

Update `src/components/AiChatbot.tsx` with the following:

1. **Voice Input:**
   - Add a microphone button next to the input field.
   - Use the native `window.SpeechRecognition` or `window.webkitSpeechRecognition` to implement dictation (voice to text). 
   - When speaking, the input text should update, and the mic icon should pulsate or turn red to indicate recording.

2. **Image Input:**
   - Add an attachment (Paperclip) button next to the input field.
   - When an image is selected, use a `FileReader` to convert it to a Base64 string.
   - Store the selected image preview in state and display a tiny preview above the input field with an 'X' to remove it.
   - Modify the `sendMessage` function to handle images: if an image is attached, append it to the `userMessage` content using the OpenAI Vision API format:
     ```json
     content: [
       { type: "text", text: input },
       { type: "image_url", image_url: { url: base64ImageString } }
     ]
     ```
     If there is no image, it can just be `content: input` as it is currently.
   - Clear the image attachment state after sending.
   - Render the sent images in the message list UI.

Let me know when you are done and the component compiles without TypeScript errors.

## Follow-up — 2026-08-16T01:37:36+04:00

# Task: Dedicated AI Dashboard Page
Working directory: c:/Users/mexty/OneDrive/Desktop/thrive-crm

1. Create a new page: `src/app/[locale]/dashboard/ai/page.tsx`.
   - This page should be a full-screen or large centered interface identical in functionality to the `AiChatbot.tsx` component, but optimized for a dedicated dashboard page (like the ChatGPT web UI).
   - It must support sending messages to `/api/ai`.
   - It must have a modern, glassmorphic UI matching the system's design (use `var(--glass-bg)`, `var(--aqua-teal)`, etc.).
   - Make sure to use `useTranslations` from `next-intl` if you hardcode any texts, or just hardcode Azerbaijani/English placeholders if translations are missing.

2. Update `src/components/Sidebar.tsx`:
   - Add a new menu item for the "AI Köməkçi" (AI Assistant) below the existing menu items.
   - Use the `Bot` icon from `lucide-react`.
   - The route should be `/dashboard/ai`.

Let me know when you are done and the page compiles without errors.

## Follow-up — 2026-08-16T01:37:36+04:00

# Task: AI Backend Enhancements
Working directory: c:/Users/mexty/OneDrive/Desktop/thrive-crm

You must update `src/app/api/ai/route.ts` with the following requirements:
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

Let me know when you are done.
