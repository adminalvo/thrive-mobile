# Handoff Report: AI Dashboard Page Survey & Architecture Investigation

**Agent**: `explorer_survey_3`  
**Target Module**: AI Dashboard (`src/app/[locale]/dashboard/ai/page.tsx`) & Sidebar Integration (`src/app/[locale]/dashboard/layout.tsx`)  
**Date**: 2026-08-16  

---

## 1. Observation

1. **Design System & Styling**:
   - `src/app/globals.css` (lines 1–28) defines custom properties for dark (`:root, [data-theme='dark']`) and light (`[data-theme='light']`) modes:
     - `--deep-navy: #000b21;`
     - `--ocean-blue: #003f82;`
     - `--aqua-teal: #4ca2b5;`
     - `--white: #ffffff;`
     - `--gray-light: #f4f7f6;`
     - `--text-primary: #f8fafc;`
     - `--text-secondary: #94a3b8;`
     - `--glass-bg: rgba(2, 6, 23, 0.7);`
     - `--glass-border: rgba(255, 255, 255, 0.1);`
     - `--gradient-primary: linear-gradient(135deg, var(--deep-navy) 0%, var(--ocean-blue) 50%, var(--aqua-teal) 100%);`
     - `--bg-main: var(--deep-navy);`
   - Background lighting in `src/app/globals.css` (lines 40–43) uses fixed radial gradients:
     ```css
     background-image: 
       radial-gradient(circle at 15% 50%, rgba(0, 63, 130, 0.15) 0%, transparent 50%),
       radial-gradient(circle at 85% 30%, rgba(76, 162, 181, 0.1) 0%, transparent 50%);
     background-attachment: fixed;
     ```
   - No Tailwind CSS configuration exists; the project relies on CSS Modules (`*.module.css`), `framer-motion` (v12.4.7), and `lucide-react` (v0.475.0) in `package.json`.

2. **Dashboard Shell & Layout**:
   - `src/app/[locale]/dashboard/layout.tsx` (lines 44–54) configures `navItems`:
     ```tsx
     const navItems = [
       { name: t("dashboard"), href: `/dashboard`, icon: LayoutDashboard },
       { name: t("leads"), href: `/dashboard/leads`, icon: Target },
       { name: t("students"), href: "/dashboard/students", icon: Users },
       { name: t("groups"), href: "/dashboard/groups", icon: Component },
       { name: t("parents"), href: "/dashboard/parents", icon: UserPlus },
       { name: t("teachers"), href: "/dashboard/teachers", icon: BookOpen },
       { name: t("schedule"), href: `/dashboard/schedule`, icon: Calendar },
       { name: t("finance"), href: `/dashboard/finance`, icon: CreditCard },
       { name: t("tasks"), href: `/dashboard/tasks`, icon: KanbanSquare },
     ];
     ```
   - Main content wrapping in `src/app/[locale]/dashboard/layout.module.css` (line 314):
     ```css
     .pageContent {
       flex: 1;
       padding: 2rem;
       overflow-y: auto;
       position: relative;
     }
     ```
   - Currently, `src/app/[locale]/dashboard/ai/page.tsx` does not exist.

3. **Translation Dictionaries**:
   - `messages/az.json` (lines 25–37), `messages/en.json` (lines 25–37), and `messages/ru.json` (lines 25–37) contain the `Sidebar` namespace with keys `dashboard`, `leads`, `students`, `groups`, `parents`, `teachers`, `schedule`, `finance`, `tasks`, `settings`, `logout`. Currently, `"ai"` is missing from `Sidebar`.
   - Dedicated namespace for AI features does not yet exist in `messages/*.json`.

4. **Existing Chatbot Implementation**:
   - `src/components/AiChatbot.tsx` (lines 1–243) renders a floating widget using Framer Motion, communicating with `POST /api/ai` with `{ messages: [...] }`.
   - `src/app/api/ai/route.ts` (lines 1–146) implements `client.chat.completions.create` targeting Gemini with function calling tools (`create_lead`, `get_financial_stats`).

---

## 2. Logic Chain

1. **Layout & Viewport Sizing (from Observation 2)**:
   - Because `.pageContent` in `layout.module.css` applies `padding: 2rem` and `overflow-y: auto`, a standalone full-height page component must set its container height to `calc(100vh - 70px - 4rem)` on desktop (and `calc(100vh - 70px - 2.5rem)` on mobile) with `display: flex; flex-direction: column; overflow: hidden;`.
   - This prevents double scrollbars and ensures the message list scrolls independently while the input bar remains docked at the bottom.

2. **Styling & Theming Integration (from Observation 1)**:
   - By exclusively referencing `var(--glass-bg)`, `var(--glass-border)`, `var(--aqua-teal)`, `var(--text-primary)`, and `var(--text-secondary)`, the new `page.module.css` will seamlessly support both dark and light modes with zero theme-switching breakage.
   - Glassmorphic card styling matching `GlobalSearch.module.css` and `dashboard/page.module.css` (`backdrop-filter: blur(16px); border-radius: 16px; border: 1px solid var(--glass-border)`) guarantees visual cohesion.

3. **Multimodal & Voice Capabilities (from Observation 4 & User Request)**:
   - To match ChatGPT's UX, the input bar requires:
     - Paperclip button triggering `FileReader` to convert attached image to Base64 and format message content as `[{ type: "text", text: input }, { type: "image_url", image_url: { url: base64 } }]`.
     - Mic button leveraging `window.SpeechRecognition` / `window.webkitSpeechRecognition` with locale parameter mapping (`az-AZ`, `en-US`, `ru-RU`) and pulsating red glow.

4. **Navigation & Localization Completeness (from Observations 2 & 3)**:
   - Adding `"ai": "AI Köməkçi"` (AZ), `"AI Assistant"` (EN), `"AI Помощник"` (RU) into `Sidebar` allows `layout.tsx` to include `{ name: t("ai"), href: "/dashboard/ai", icon: Bot }` cleanly.
   - Adding the `"AiDashboard"` namespace in all 3 language files ensures all UI labels (starter prompts, buttons, status badges, placeholders) are fully localized with no hardcoded strings.

---

## 3. Caveats

1. **Browser SpeechRecognition Support**:
   - `webkitSpeechRecognition` is supported on Chromium-based browsers (Chrome, Edge, Brave, Opera) and Safari, but Firefox has limited default support. The UI must include a graceful fallback error toast (`speechNotSupported`) if the API is undefined.
2. **TypeScript Window Augmentation**:
   - In Next.js 15 TypeScript strict mode, `window.SpeechRecognition` and `window.webkitSpeechRecognition` require `declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }` to pass `tsc` without errors.
3. **Payload Structure Compatibility**:
   - When sending an image, the message content becomes an array of objects (`[{type: "text", ...}, {type: "image_url", ...}]`). The backend route (`/api/ai`) must accept this OpenAI standard schema.

---

## 4. Conclusion

The dedicated AI Dashboard Page should be implemented with:
1. **Page File**: `src/app/[locale]/dashboard/ai/page.tsx` (Client component with full-height flex layout, speech recognition, Base64 image attachment, prompt suggestions, and auto-scrolling message list).
2. **Styling Module**: `src/app/[locale]/dashboard/ai/page.module.css` (Glassmorphic cards, docked input bar, cyan glow accents, responsive breakpoints).
3. **Sidebar Menu**: Update `src/app/[locale]/dashboard/layout.tsx` with `Bot` icon linking to `/dashboard/ai`.
4. **Translations**: Add `"ai"` key to `"Sidebar"` and add full `"AiDashboard"` namespace to `messages/az.json`, `messages/en.json`, and `messages/ru.json`.

Detailed architectural diagrams and complete translations are documented in `survey_report.md`.

---

## 5. Verification Method

To verify the implementation once built:

1. **Type-checking & Linting**:
   ```powershell
   npx tsc --noEmit
   npm run lint
   ```
2. **Build Verification**:
   ```powershell
   npm run build
   ```
3. **Functional Inspection**:
   - Visit `http://localhost:3000/az/dashboard/ai`, `http://localhost:3000/en/dashboard/ai`, `http://localhost:3000/ru/dashboard/ai`.
   - Verify sidebar displays "AI Köməkçi" / "AI Assistant" / "AI Помощник" with `Bot` icon.
   - Verify glassmorphic cards, empty state suggestions, image upload preview, voice dictation toggle, and message exchange with `/api/ai`.
