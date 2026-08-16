## 2026-08-16T01:40:25Z
Tasks to Implement:
1. Create `src/types/speech.d.ts` with ambient type declarations for `SpeechRecognition`, `webkitSpeechRecognition`, and event types so TypeScript compiles cleanly.
2. Update `src/components/AiChatbot.tsx`:
   - Voice Input: Microphone button next to the input field, native `window.SpeechRecognition` or `window.webkitSpeechRecognition` dictation (voice to text), updates input text as user speaks, mic icon pulsates or turns red when recording (with `@keyframes pulseRed`).
   - Image Input: Paperclip attachment button, hidden file input accepting `image/*`, `FileReader` reading as Base64 data URL (`readAsDataURL`), tiny preview thumbnail above the input bar with an 'X' button to remove it.
   - Multimodal `sendMessage`: If an image is selected, format `userMessage.content` as:
     `[ { type: "text", text: input }, { type: "image_url", image_url: { url: base64ImageString } } ]`
     If no image, `content: input`.
   - Clear image attachment state immediately upon sending.
   - Render sent images in the message list UI (support both string content and array parts with text + image_url).
3. Update or create `src/app/[locale]/dashboard/ai/page.tsx`:
   - Dedicated full-page AI dashboard matching system glassmorphism styling (`var(--glass-bg)`, `var(--aqua-teal)`, etc.), connected to `/api/ai`, with voice dictation and image attachment.
4. Update `src/app/[locale]/dashboard/layout.tsx` and `messages/{az,en,ru}.json`:
   - Add sidebar navigation item for "AI Köməkçi" (`/dashboard/ai`) using `Bot` icon from `lucide-react`.
5. Verify `/api/ai/route.ts` handles tool execution and multimodal messages smoothly.
6. Run TypeScript typecheck: `npx tsc --noEmit` and ensure ZERO errors.
7. Write your detailed handoff report to `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_1/handoff.md` and send a message back with your verification results.
