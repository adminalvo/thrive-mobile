# Handoff Report: Project-Wide Context & AI Features Investigation

## 1. Observation

- **Sidebar Implementation**:
  - `src/components/Sidebar.tsx` does not exist in the codebase.
  - The entire sidebar UI and navigation list is implemented inline in `src/app/[locale]/dashboard/layout.tsx` (lines 44–54 and 72–119).
  - Navigation items in `layout.tsx` currently map: `dashboard`, `leads`, `students`, `groups`, `parents`, `teachers`, `schedule`, `finance`, `tasks`.
- **Dedicated AI Page**:
  - `src/app/[locale]/dashboard/ai/page.tsx` does not exist yet.
- **AiChatbot Component**:
  - `src/components/AiChatbot.tsx` is globally mounted in `src/app/[locale]/layout.tsx` (line 44) as a floating widget with a fixed button (`60x60px`) and a popup chat window (`350x500px`).
- **Internationalization**:
  - Managed with `next-intl` (v3.26.3). Locales configured in `src/i18n/routing.ts` (`locales: ['en', 'az', 'ru']`, `defaultLocale: 'az'`).
  - `messages/az.json`, `messages/en.json`, and `messages/ru.json` define the `"Sidebar"` namespace, which currently lacks the `"ai"` key.
- **Theme & CSS Tokens**:
  - Defined in `src/app/globals.css` (lines 1–27): `--deep-navy: #000b21`, `--ocean-blue: #003f82`, `--aqua-teal: #4ca2b5`, `--white: #ffffff`, `--glass-bg: rgba(2, 6, 23, 0.7)`, `--glass-border: rgba(255, 255, 255, 0.1)`, `--text-primary: #f8fafc`, `--text-secondary: #94a3b8`.
- **Backend API**:
  - `src/app/api/ai/route.ts` expects `POST` with `{ messages: Array<{ role: string, content: string | any[] }> }`.

## 2. Logic Chain

1. Since `src/components/Sidebar.tsx` does not exist and sidebar navigation is inlined inside `src/app/[locale]/dashboard/layout.tsx`, implementing the new "AI Köməkçi" menu item requires modifying `src/app/[locale]/dashboard/layout.tsx` by adding `Bot` from `lucide-react` and `{ name: t("ai"), href: "/dashboard/ai", icon: Bot }` to `navItems`. For maximum compatibility with prompt expectations, a dedicated `src/components/Sidebar.tsx` can also be created.
2. Because `next-intl` is configured across `az`, `en`, and `ru`, the `"ai"` translation key must be added to the `"Sidebar"` namespace in `messages/az.json` ("AI Köməkçi"), `messages/en.json` ("AI Assistant"), and `messages/ru.json` ("AI Помощник").
3. Because `/dashboard/ai` needs a dedicated ChatGPT-style interface, creating `src/app/[locale]/dashboard/ai/page.tsx` with a CSS module using `--glass-bg`, `--aqua-teal`, `--glass-border` and glassmorphic styling satisfies the visual and functional requirements.
4. Because `AiChatbot.tsx` is mounted globally in `src/app/[locale]/layout.tsx`, leaving it visible on `/dashboard/ai` would result in two overlapping AI chat interfaces on the same screen. Therefore, `AiChatbot.tsx` should conditionally return `null` or hide when `pathname.includes('/dashboard/ai')`.
5. Both `AiChatbot.tsx` and the dedicated `/dashboard/ai` page should support SpeechRecognition dictation and image upload with FileReader converting to OpenAI Vision JSON format sent to `/api/ai`.

## 3. Caveats

- Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) is supported in modern Chromium and Safari browsers, but requires HTTPS or localhost and microphone permission. A graceful fallback (toast / alert) should be provided if unsupported.
- The backend OpenAI Vision call requires an API endpoint/model capable of processing image content parts (Gemini 2.5/Flash or GPT-4o).

## 4. Conclusion

1. Add `"ai"` key to `"Sidebar"` namespace in `messages/{az,en,ru}.json`.
2. Add the `/dashboard/ai` menu item with `Bot` icon to `src/app/[locale]/dashboard/layout.tsx` (and optionally create `src/components/Sidebar.tsx`).
3. Build `src/app/[locale]/dashboard/ai/page.tsx` with glassmorphic styling, speech-to-text, and image attachments.
4. Update `src/components/AiChatbot.tsx` with speech-to-text, image attachments, and suppress display on `/dashboard/ai`.
5. The full architectural details, code structures, and styling variables are documented in `.agents/explorer_0_3/report.md`.

## 5. Verification Method

- **TypeScript check**: Run `npx tsc --noEmit` to ensure zero compilation or type errors.
- **Route verification**: Inspect `src/app/[locale]/dashboard/layout.tsx` and `src/app/[locale]/dashboard/ai/page.tsx`.
- **Locale verification**: Check that `messages/{az,en,ru}.json` contain valid JSON with the new `"ai"` keys.
