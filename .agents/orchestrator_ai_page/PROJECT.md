# Project: Dedicated AI Dashboard Page & Sidebar Integration

## Architecture
- **Route**: `src/app/[locale]/dashboard/ai/page.tsx`
- **Component**: `src/components/Sidebar.tsx` and layout integration in `src/app/[locale]/dashboard/layout.tsx`
- **Styles**: Modern glassmorphism utilizing CSS variables (`var(--glass-bg)`, `var(--glass-border)`, `var(--aqua-teal)`, `var(--ocean-blue)`, `var(--deep-navy)`).
- **i18n**: Translations in `messages/az.json`, `messages/en.json`, `messages/ru.json` for Sidebar and AI Dashboard.
- **Backend API**: `POST /api/ai` supporting text and OpenAI Vision formatted multimodal messages.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | AI Dashboard Page (`page.tsx`) | Full-screen / large centered ChatGPT-like UI with glassmorphism | M1 | ORIGINAL_REQUEST |
| 2 | Multimodal Chat Functionality | Text messaging, OpenAI Vision image input with preview & removal, Web Speech voice input with pulse indicator | M1 | ORIGINAL_REQUEST |
| 3 | Conversation Management | Clear chat button, quick prompt chips, auto-scroll, loading state with spinner | M1 | ORIGINAL_REQUEST |
| 4 | Sidebar Navigation Integration | Add "AI Köməkçi" item with `Bot` icon from `lucide-react` routing to `/dashboard/ai` in `Sidebar.tsx` & `layout.tsx` | M2 | ORIGINAL_REQUEST |
| 5 | Localization (i18n) | Translation keys for AI Assistant in Azerbaijani, English, and Russian | M2 | ORIGINAL_REQUEST |
| 6 | TypeScript & Build Verification | Clean compilation with `npx tsc --noEmit` and build test | M3 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Dedicated AI Dashboard Page | Create `src/app/[locale]/dashboard/ai/page.tsx` and any accompanying CSS module with full voice/image/text AI capabilities | none | IN_PROGRESS |
| 2 | M2: Sidebar & Navigation & i18n | Update `src/components/Sidebar.tsx`, `src/app/[locale]/dashboard/layout.tsx`, and `messages/*.json` | M1 | PLANNED |
| 3 | M3: Verification & Polish | Reviewers, Challengers, and Forensic Auditor verification, TypeScript check | M1, M2 | PLANNED |

## Code Layout
- `src/app/[locale]/dashboard/ai/page.tsx`: Main AI dashboard client component
- `src/app/[locale]/dashboard/ai/ai.module.css`: Glassmorphic styles and animations for the AI page
- `src/components/Sidebar.tsx`: Standalone sidebar component with AI assistant link and `Bot` icon
- `src/app/[locale]/dashboard/layout.tsx`: Dashboard shell with updated nav items
- `messages/{az,en,ru}.json`: Translation keys
