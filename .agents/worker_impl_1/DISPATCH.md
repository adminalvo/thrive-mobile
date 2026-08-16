## 2026-08-16T01:40:12+04:00
You are the Lead Implementation Worker for the AI Dedicated Dashboard Page and Sidebar integration.
Your working directory is: `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_impl_1`
You MUST read `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md` and `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/orchestrator_ai_page/PROJECT.md` before starting work.
You should also read the survey reports at `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_survey_1/survey_report.md` and `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_survey_2/survey_report.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Files / Write Ownership:
- `src/app/[locale]/dashboard/ai/page.tsx`
- `src/app/[locale]/dashboard/ai/ai.module.css` (or `page.module.css` in same dir)
- `src/components/Sidebar.tsx`
- `src/app/[locale]/dashboard/layout.tsx`
- `messages/az.json`, `messages/en.json`, `messages/ru.json`

Implementation Requirements:
1. **Dedicated AI Dashboard Page (`src/app/[locale]/dashboard/ai/page.tsx`)**:
   - Create a modern, responsive, glassmorphic ChatGPT-like interface (large centered layout or full-height container).
   - Use design system CSS variables: `var(--glass-bg)`, `var(--glass-border)`, `var(--aqua-teal)`, `var(--ocean-blue)`, `var(--deep-navy)`, `var(--text-primary)`, `var(--text-secondary)`.
   - **Voice Input**:
     - Implement microphone button using `window.SpeechRecognition` / `window.webkitSpeechRecognition` with SSR safety guard (`typeof window !== 'undefined'`).
     - Pulsating red icon/glow when listening.
     - Live or final transcript updates input field.
   - **Image Input (Multimodal Vision)**:
     - Attachment button (Paperclip or Image icon) next to input.
     - File input reading image as Base64 data URL via `FileReader`.
     - Display thumbnail preview above input with 'X' button to remove image before sending.
     - When sending with image, format message content using OpenAI Vision format:
       `content: [{ type: "text", text: input }, { type: "image_url", image_url: { url: base64ImageString } }]`.
       When sending text only, use `content: input`.
     - Clear attached image after sending.
     - Render sent images in the conversation message stream.
   - **Chat Operations**:
     - Message state history with user and assistant messages.
     - Clear chat / Reset conversation button in header.
     - Quick prompt suggestion chips on empty/welcome state (e.g. "Maliyyə hesabatı", "Tələbələrin siyahısı", "Yeni müəllim qeydiyyatı", "Cədvəli yoxla").
     - Send messages to `POST /api/ai` with JSON payload `{ messages: [...] }`.
     - Handle loading state with animated bot/spinner and disable send button while in flight.
     - Auto-scroll to bottom using `messagesEndRef`.
     - Error handling with user-friendly notices.
     - Use `useTranslations` from `next-intl` (with fallback defaults).

2. **Sidebar & Layout Navigation Update**:
   - Update `src/app/[locale]/dashboard/layout.tsx`:
     - Import `Bot` from `lucide-react`.
     - Add `{ name: t("aiAssistant"), href: "/dashboard/ai", icon: Bot }` below `tasks` in `navItems`.
     - Ensure active route highlighting and mobile drawer closing on click work properly.
   - Create / Update `src/components/Sidebar.tsx` as a clean, reusable component conforming to the sidebar structure and exporting `Sidebar`.
   - Update `messages/az.json`, `messages/en.json`, `messages/ru.json` to include `"aiAssistant"` under `"Sidebar"` and any needed `"ai"` page keys.

3. **Compilation & Verification**:
   - Run `npx tsc --noEmit` to verify TypeScript compilation has 0 errors.
   - Document verification commands and results in `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_impl_1/handoff.md`.
   - Send a message to your parent when done.
