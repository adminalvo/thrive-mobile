# Handoff Report: TypeScript, SpeechRecognition, AI Backend & Message Interface

## 1. Observation
- **TypeScript & Project Config:**
  - `tsconfig.json` specifies `"strict": true`, `"moduleResolution": "bundler"`, and includes all `.ts` and `.tsx` files in the project.
  - `package.json` contains `"build": "rm -rf .next && next build"`, `"test": "tsx tests/e2e/run_all.ts"`, `"openai": "^7.4.0"`.
  - Typechecking can be executed via `npx tsc --noEmit`.
- **Speech API & Declarations:**
  - `window.SpeechRecognition` / `window.webkitSpeechRecognition` are browser-only APIs and not declared in standard DOM typings for TS strict mode.
  - Creating `src/types/speech.d.ts` provides ambient global types without adding npm dependencies.
  - SSR guard (`typeof window !== "undefined"`) is required before referencing `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
- **Backend AI Handler (`src/app/api/ai/route.ts`):**
  - Currently connects to Gemini using `OpenAI` client with base URL `https://generativelanguage.googleapis.com/v1beta/openai/`.
  - Tools currently defined: `create_lead` and `get_financial_stats`.
  - Database queries use `sql` helper from `@/lib/db`.
- **Message Interface & Vision Format:**
  - `AiChatbot.tsx` previously handled simple string messages `{ role: "user" | "assistant", content: string }`.
  - OpenAI Vision API format expects `content: [ { type: "text", text: input }, { type: "image_url", image_url: { url: base64 } } ]` when an image is attached.
  - Messages in the UI should render both text and image elements when content is an array.

## 2. Logic Chain
1. *From Observation of `tsconfig.json` & `npx tsc --noEmit`:* Global ambient type declaration files in `src/types/` are automatically picked up by TypeScript. Adding `src/types/speech.d.ts` will resolve any `SpeechRecognition` type errors across the entire codebase.
2. *From Observation of Next.js client component SSR behavior:* Components rendered with `"use client"` are still pre-rendered on the server. Safely wrapping `window.SpeechRecognition` checks in client-side hooks/guards prevents SSR hydration crashes.
3. *From Observation of OpenAI SDK message parsing:* The SDK natively accepts `ChatMessage` with `content: string | Array<ChatCompletionContentPart>`. Passing OpenAI Vision structure directly through `/api/ai` enables multimodal understanding without rewriting payload transformations.
4. *From Observation of Backend requirements:* Implementing a try/catch wrapper on the initial LLM call and falling back to `fallbackClient` (`OpenRouter` / `openai/gpt-4o`) ensures high availability. Reusing the client flag (`usedFallback`) ensures that the second completion after tool execution uses the same client.
5. *From Observation of Schema & CRM requirements:* The new tools (`create_teacher`, `create_student`, `create_group`, `get_teachers`, `get_students`) map directly to the `teachers`, `students`, `groups`, `user_profiles`, and `auth.users` tables via `sql` queries in `@/lib/db`.

## 3. Caveats
- Speech recognition depends on browser support (Chrome, Edge, Safari have native support; Firefox requires user flags or may not support `webkitSpeechRecognition`). A user-friendly fallback alert should be displayed if unavailable.
- Base64 images are sent in the payload. Very large image files (>5MB) may increase request payload size, so frontend preview and reasonable image handling is recommended.
- Database operations in tool executors should handle errors gracefully and return `{ success: false, error: err.message }` to allow the LLM to explain the issue to the user.

## 4. Conclusion
The architecture and implementation strategy are fully verified and ready for implementation:
- Ambient speech definitions in `src/types/speech.d.ts`.
- Multimodal chat state & UI rendering in `AiChatbot.tsx` and `src/app/[locale]/dashboard/ai/page.tsx`.
- Fallback-enabled multi-tool AI pipeline in `src/app/api/ai/route.ts`.
- Sidebar navigation update in `src/app/[locale]/dashboard/layout.tsx` and i18n message catalogs.

## 5. Verification Method
- **Typecheck Verification:** Run `npx tsc --noEmit` to verify that `SpeechRecognition`, message interfaces, and route handlers compile without type errors.
- **Build Verification:** Run `npm run build` or `npx next build` to ensure SSR pre-rendering passes.
- **API Endpoint Verification:** Send POST request with vision content and test tool calling.
- **E2E Test Suite:** Run `npm test` (`tsx tests/e2e/run_all.ts`).
