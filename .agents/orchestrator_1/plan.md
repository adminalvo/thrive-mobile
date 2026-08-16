# Plan: Chatbot Voice & Image Input Enhancements

## Project Overview
Enhance `src/components/AiChatbot.tsx` in `c:/Users/mexty/OneDrive/Desktop/thrive-crm` with native Web Speech API voice dictation, Base64 image attachment with preview & removal, OpenAI Vision API payload formatting, rendering attached images in chat bubbles, and ensuring zero TypeScript compilation errors across the workspace. Also ensure full consistency with `/dashboard/ai` and the sidebar.

## Feature Inventory
| # | Feature | Description | Target Component | Status |
|---|---------|-------------|------------------|--------|
| 1 | Speech Types Ambient Declaration | Global TypeScript declarations for `SpeechRecognition` & `webkitSpeechRecognition` | `src/types/speech.d.ts` | Ready for Dev |
| 2 | Voice Input in `AiChatbot.tsx` | Mic button, native SpeechRecognition dictation, input text update, pulsating/red recording state | `src/components/AiChatbot.tsx` | Ready for Dev |
| 3 | Image Attachment UI & Preview | Paperclip button, file input (images), FileReader to Base64, preview above input with 'X' remove button | `src/components/AiChatbot.tsx` | Ready for Dev |
| 4 | Vision API Payload in `sendMessage` | `content: [{ type: "text", text: input }, { type: "image_url", image_url: { url: base64 } }]` if image present, else `content: input` | `src/components/AiChatbot.tsx` | Ready for Dev |
| 5 | Image Attachment Reset & Render | Clear image attachment state after send, render sent image in message bubble | `src/components/AiChatbot.tsx` | Ready for Dev |
| 6 | Dedicated AI Dashboard Page | `src/app/[locale]/dashboard/ai/page.tsx` with matching voice, vision, glassmorphic UI | `src/app/[locale]/dashboard/ai/page.tsx` | Ready for Dev |
| 7 | Sidebar Navigation & Translations | Sidebar item for AI Assistant (`/dashboard/ai`), `messages/*.json` keys | `src/app/[locale]/dashboard/layout.tsx`, `messages/*.json` | Ready for Dev |
| 8 | TypeScript & Build Health | Strict TypeScript compilation (`npx tsc --noEmit`) with 0 errors | Full Project | Ready for Dev |

## Execution Milestones
- **Phase 0: Survey & Codebase Investigation** (Completed by Explorers 1, 2, 3)
- **Phase 1: Implementation** (Worker dispatched to implement items 1-8 and run build/typecheck)
- **Phase 2: Independent Review** (2 Reviewers)
- **Phase 3: Adversarial Challenge & Verification** (2 Challengers)
- **Phase 4: Forensic Audit** (1 Auditor)
- **Phase 5: Final Synthesis & Completion Report**
