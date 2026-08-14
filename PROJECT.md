# Project: Thrive CRM Enhancement (Responsiveness, Loading States, i18n, Pure Dynamic SSR)

## Architecture
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict mode).
- **Rendering Strategy**: Pure Dynamic Server-Side Rendering (SSR) via `export const dynamic = "force-dynamic";` in `src/app/[locale]/layout.tsx` (static generation removed).
- **Internationalization**: `next-intl` (v3.26.3) with locales `['en', 'az', 'ru']`, routing in `src/i18n/routing.ts`, messages in `messages/{az,en,ru}.json`.
- **Styling & Responsiveness**: CSS Modules with targeted tablet media queries (`@media (max-width: 1024px)` and `@media (max-width: 768px)`), overflow-x containers for tables and Kanban boards, flexible 90% modal widths.
- **State & Transitions**: Client-side `loading.tsx` route boundaries using `useTranslations("Common")` and animated skeleton placeholders.

## Feature Inventory
Every feature from the Survey phase and ORIGINAL_REQUEST.md is enumerated and assigned to a milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1: Dashboard Loading States | Create client `loading.tsx` with translated skeletons in all 8 sub-routes (`students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`) | M1 | ORIGINAL_REQUEST § R1 |
| 2 | R4: Pure Dynamic SSR | Remove `generateStaticParams` and add `export const dynamic = "force-dynamic";` in `src/app/[locale]/layout.tsx` | M1 | ORIGINAL_REQUEST § R4 |
| 3 | R2: Sidebar Tablet Drawer | Refactor `layout.tsx` and `layout.module.css` to collapse sidebar on `< 1024px` without hydration/inline transform desync | M2 | ORIGINAL_REQUEST § R2 |
| 4 | R2: Data Tables Horizontal Scroll | Add `min-width` (650px - 750px) to tables and ensure `overflow-x: auto` on table wrappers across all pages | M2 | ORIGINAL_REQUEST § R2 |
| 5 | R2: Kanban Board Tablet Scaling | Adjust column widths (`270px`) and board gaps (`1rem`) on Kanban boards (`tasks`, `leads`) for tablet screens | M2 | ORIGINAL_REQUEST § R2 |
| 6 | R2: Modal 90% Width & Responsiveness | Standardize all modals across dashboard to `width: 90%`, `max-height: 90vh; overflow-y: auto`, and 1-column input stacking on tablet | M2 | ORIGINAL_REQUEST § R2 |
| 7 | R3: Locale Translations Completeness | Synchronize `az.json`, `en.json`, `ru.json` with `Notifications`, `Common.empty`, `Common.loading`, and missing UI keys | M3 | ORIGINAL_REQUEST § R3 |
| 8 | R3: NotificationsDropdown i18n | Eliminate hardcoded strings in `NotificationsDropdown.tsx` using `useTranslations("Notifications")` and `useTranslations("Common")` | M3 | ORIGINAL_REQUEST § R3 |
| 9 | R3: Empty States & Loading Text i18n | Replace hardcoded empty table texts in 6 pages with `{c("empty")}` and loading indicators with `{c("loading")}` | M3 | ORIGINAL_REQUEST § R3 |
| 10 | Final Comprehensive Validation | Pass 100% of 136 E2E tests (Tiers 1-5), `npx tsc --noEmit` (0 errors), and `npm run build` (ƒ Dynamic for `/dashboard/...`) | M4 | ORIGINAL_REQUEST § Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Loading States & Dynamic SSR | R1 (8 `loading.tsx` files), R4 (`layout.tsx` dynamic SSR configuration) | none | DONE |
| 2 | M2: iPad/Tablet Responsiveness | R2 (Sidebar drawer, table min-width/overflow-x, Kanban layout, 90% modal widths) | M1 | DONE |
| 3 | M3: i18n Completeness | R3 (`messages/{az,en,ru}.json`, `NotificationsDropdown.tsx`, empty states, loading texts) | M1 | DONE |
| 4 | M4: E2E Validation & Final Hardening | 100% E2E test pass (132 tests across Tiers 1-5), `tsc --noEmit`, `npm run build` verification | M1, M2, M3 | DONE |


## Interface Contracts

### 1. Route Loading State Contract
- File: `src/app/[locale]/dashboard/<route>/loading.tsx`
- Component: `"use client"; export default function Loading() { const t = useTranslations("Common"); return <div className={...}>...{t("loading")}...</div>; }`
- Skeleton layout archetype matched to route content: Table Skeleton for `students`/`parents`/`groups`, Card Grid for `teachers`/`schedule`, Kanban for `leads`/`tasks`, Stats+Table for `finance`.

### 2. Pure Dynamic SSR Contract
- File: `src/app/[locale]/layout.tsx`
- `export const dynamic = "force-dynamic";`
- No `generateStaticParams` export.
- Build Output: All `/[locale]/...` routes display `ƒ (Dynamic)` in Next.js build manifest.

### 3. Responsive Layout & Breakpoint Contract
- Tablet Breakpoint: `@media (max-width: 1024px)` for sidebar drawer toggle, table scrolling, and Kanban sizing.
- Mobile/Tablet Portrait Breakpoint: `@media (max-width: 768px)` for form grid 1-column collapse and modal sizing.
- Modal standard: `width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;`.

### 4. Internationalization Key Contract
- `Notifications` namespace: `{ "title": "Notifications", "markAllRead": "Mark all read", "noNotifications": "No new notifications", "loading": "Loading...", "unread": "unread", "markRead": "Mark as read" }` (localized in az, en, ru).
- `Common` namespace: `{ "loading": "Loading...", "empty": "No data found.", "actions": "Actions", ... }` (localized in az, en, ru).

## Code Layout
- `src/app/[locale]/layout.tsx` — Root locale layout (dynamic SSR)
- `src/app/[locale]/dashboard/layout.tsx` & `layout.module.css` — Responsive sidebar and layout shell
- `src/app/[locale]/dashboard/students/loading.tsx` — Students loading skeleton
- `src/app/[locale]/dashboard/teachers/loading.tsx` — Teachers loading skeleton
- `src/app/[locale]/dashboard/parents/loading.tsx` — Parents loading skeleton
- `src/app/[locale]/dashboard/groups/loading.tsx` — Groups loading skeleton
- `src/app/[locale]/dashboard/leads/loading.tsx` — Leads loading skeleton
- `src/app/[locale]/dashboard/finance/loading.tsx` — Finance loading skeleton
- `src/app/[locale]/dashboard/tasks/loading.tsx` — Tasks loading skeleton
- `src/app/[locale]/dashboard/schedule/loading.tsx` — Schedule loading skeleton
- `src/app/[locale]/dashboard/*/*.module.css` — Scoped page styling and tablet media queries
- `src/components/NotificationsDropdown.tsx` & `NotificationsDropdown.module.css` — Localized notifications drawer
- `messages/az.json`, `messages/en.json`, `messages/ru.json` — Translation bundles
- `tests/e2e/` — E2E test harness and test suites (Tiers 1-5)
