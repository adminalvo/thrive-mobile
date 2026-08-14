# Original User Request

## 2026-08-15T01:28:55+04:00

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Delegate to teamwork_preview to implement responsive UI, loading states, i18n, and dynamic SSR.

Implement full iPad/Tablet responsiveness, transition loading states, complete missing translations, and enforce pure dynamic SSR for the Thrive CRM dashboard.

Working directory: c:/Users/mexty/OneDrive/Desktop/thrive-crm
Integrity mode: benchmark

## Requirements

### R1. Loading States (loading.tsx)
Add `loading.tsx` to all dashboard sub-routes (`students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`). These should display an aesthetically pleasing, translated "Loading..." (via next-intl) skeleton or spinner to prevent Next.js transition blocking.

### R2. iPad/Tablet Responsiveness (768px - 1024px)
Update the CSS modules (e.g. `layout.module.css`, `page.module.css`) to ensure the layout is fully responsive on tablets. 
- The sidebar should collapse or hide on `< 1024px`.
- All data tables must have `overflow-x: auto` so they don't break the layout.
- The Kanban board (Tasks) must fit within tablet screens.
- Modals should expand up to 90% width on smaller screens.

### R3. Internationalization (i18n) Completeness
Extract all hardcoded texts into `az.json`, `en.json`, and `ru.json` and use `useTranslations`. Specifically:
- `NotificationsDropdown.tsx` ("Notifications", "Mark all read", "No new notifications", "Loading...").
- Empty states in tables ("Məlumat tapılmadı", "Heç bir məlumat tapılmadı") must use `Common.empty` or similar keys.
- Loading texts in `loading.tsx` must use `Common.loading`.

### R4. Enforce Pure Dynamic SSR
Update `src/app/[locale]/layout.tsx`. Remove the `generateStaticParams` function and explicitly add `export const dynamic = "force-dynamic";` to enforce server-side rendering for all routes and prevent Next.js from statically building the `[locale]` segments.

## Acceptance Criteria

### Objective Programmatic Verification
- [ ] `npx tsc --noEmit` completes with 0 errors.
- [ ] `npm run build` completes successfully. The build output for `/dashboard/...` routes must show `ƒ  (Dynamic)` instead of `○  (Static)`.

### Objective Agent-as-Judge Verification
- [ ] Navigating to `/dashboard/students` should instantly render a `loading.tsx` boundary before data loads.
- [ ] `NotificationsDropdown.tsx` does not contain any hardcoded English strings.
- [ ] The `generateStaticParams` function is completely removed from `src/app/[locale]/layout.tsx`.
