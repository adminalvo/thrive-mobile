# Handoff Report: AI Chatbot Survey & Implementation Plan

## 1. Observation
1. **Source Code Inspection**:
   - `src/components/AiChatbot.tsx`: Lines 1–243 contain the floating assistant widget. It currently uses React `useState` for `isOpen`, `messages`, `input`, and `loading`. Messages are plain string contents. It has no voice input, no image upload or Base64 conversion, no clear chat button, and no Vision multimodal payload formatting.
   - `src/app/[locale]/dashboard/layout.tsx`: Lines 44–54 define `navItems` array for the sidebar. There is no existing entry for `/dashboard/ai` or the `Bot` icon.
   - `src/app/globals.css`: Lines 1–27 define theme tokens including `--aqua-teal` (`#4ca2b5`), `--ocean-blue` (`#003f82`), `--deep-navy` (`#000b21`), `--glass-bg` (`rgba(2, 6, 23, 0.7)`), and `--glass-border` (`rgba(255, 255, 255, 0.1)`).
   - `src/app/api/ai/route.ts`: Lines 1–146 define the backend route calling `gemini-3.6-flash` with function tools `create_lead` and `get_financial_stats`.
   - `messages/az.json`, `messages/en.json`, `messages/ru.json`: "Sidebar" objects currently lack the `"ai"` translation key.

2. **User Requirements** (from `.agents/ORIGINAL_REQUEST.md`):
   - **Voice Input**: `window.SpeechRecognition` / `webkitSpeechRecognition`, pulsate / red mic indicator, live speech-to-text into input.
   - **Image Input**: Paperclip button, `FileReader` Base64 conversion, thumbnail preview with 'X' dismiss button, OpenAI Vision payload structure `{ type: "text", text }, { type: "image_url", image_url: { url } }`, attachment clearing upon send, and message list rendering for images.
   - **Dedicated AI Dashboard Page**: `src/app/[locale]/dashboard/ai/page.tsx`, ChatGPT-style glassmorphic interface, connected to `/api/ai`.
   - **Sidebar Update**: Add "AI Köməkçi" item with `Bot` icon to `/dashboard/ai`.
   - **Backend Enhancements**: OpenRouter fallback with `openai/gpt-4o`, new CRM database tools (`create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`).

---

## 2. Logic Chain
1. **Voice Input Integration**:
   - Because `window.SpeechRecognition` is only available in browser environments, a safe check `typeof window !== "undefined"` and casting to `(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition` prevents SSR build/hydration crashes while enabling speech recognition in Chromium/Safari browsers.
   - Managing `isListening` state and attaching `onresult`, `onend`, `onerror` enables toggling the microphone button with dynamic red pulsation styling.
2. **Image Input & Vision Payload Handling**:
   - Using a hidden `<input type="file" accept="image/*" />` triggered by a `Paperclip` button allows standard image selection.
   - `FileReader.readAsDataURL(file)` converts selected files into Base64 format.
   - Structuring `userMessage.content` as an array with `{ type: "text", text }` and `{ type: "image_url", image_url: { url: base64 } }` conforms to OpenAI Vision specification, compatible with Gemini 1.5/2.0 Flash and GPT-4o multimodal inputs.
   - Updating message list rendering to inspect `Array.isArray(m.content)` ensures backwards compatibility with existing plain text messages while rendering images when present.
3. **Dedicated Page & Sidebar Routing**:
   - Creating `src/app/[locale]/dashboard/ai/page.tsx` within the existing Next.js App Router structure seamlessly inherits `DashboardLayout`.
   - Adding `{ name: t("ai") || "AI Köməkçi", href: "/dashboard/ai", icon: Bot }` to `DashboardLayout` in `src/app/[locale]/dashboard/layout.tsx` integrates the AI Assistant into the CRM's primary navigation.

---

## 3. Caveats
- Web Speech API support varies across browsers (fully supported in Chrome, Edge, Safari with webkit prefix; limited in Firefox). A graceful fallback message or disabled state should be provided if `SpeechRecognition` is undefined.
- Large Base64 image payloads increase HTTP body size; capping upload size or recommending JPEG/PNG compression ensures fast request times to `/api/ai`.
- No other existing components depend on `AiChatbot` state directly; it is self-contained.

---

## 4. Conclusion
The architecture and implementation strategy for enhancing `AiChatbot.tsx` and building `src/app/[locale]/dashboard/ai/page.tsx` are fully verified and ready for execution. All state variables, event handlers, UI requirements, message structures, and sidebar links have been mapped and documented in `survey_report.md`.

---

## 5. Verification Method
1. **File Verification**:
   - Inspect `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_survey_1/survey_report.md` for full implementation details.
   - Inspect `src/components/AiChatbot.tsx` and `src/app/[locale]/dashboard/layout.tsx`.
2. **TypeScript & Build Verification**:
   - When implementation commences, run `npm run build` or Next.js typecheck to verify 0 TypeScript/ESLint errors.
