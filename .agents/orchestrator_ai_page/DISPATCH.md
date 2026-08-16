## 2026-08-16T01:37:58+04:00
You are the Project Orchestrator for this task.
Your working directory is: `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/orchestrator_ai_page`
The authoritative user request is in: `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md`

Task Summary:
1. Create a new page: `src/app/[locale]/dashboard/ai/page.tsx`.
   - This page should be a full-screen or large centered interface identical in functionality to the `AiChatbot.tsx` component (including recent voice and image input support, message sending to `/api/ai`, clear chat, etc.), but optimized for a dedicated dashboard page (like the ChatGPT web UI).
   - It must support sending messages to `/api/ai`.
   - It must have a modern, glassmorphic UI matching the system's design (use `var(--glass-bg)`, `var(--aqua-teal)`, etc.).
   - Make sure to use `useTranslations` from `next-intl` if you hardcode any texts, or just hardcode Azerbaijani/English placeholders if translations are missing.

2. Update `src/components/Sidebar.tsx`:
   - Add a new menu item for the "AI Köməkçi" (AI Assistant) below the existing menu items.
   - Use the `Bot` icon from `lucide-react`.
   - The route should be `/dashboard/ai`.

Ensure the project compiles with TypeScript (`npx tsc --noEmit` or `npm run build`) without errors.
Maintain your `plan.md`, `progress.md`, and `BRIEFING.md` in your working directory.
When done, verify everything thoroughly and report back with your completion handoff.
