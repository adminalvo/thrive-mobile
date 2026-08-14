## 2026-08-15T01:58:00Z
You are worker_m3.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m3
Read the original user request at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
Read the project specification at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
Read the survey findings at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_spec_miner_1/handoff.md and c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_spec_miner_1/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Assigned Files:
You exclusively own and will modify:
1. `messages/az.json`, `messages/en.json`, `messages/ru.json`:
   - Add `Notifications` namespace:
     ```json
     "Notifications": {
       "title": "...",
       "markAllRead": "...",
       "noNotifications": "...",
       "loading": "...",
       "unread": "...",
       "markRead": "..."
     }
     ```
   - Add `Common.empty` to all 3 files (`"Heç bir məlumat tapılmadı."` / `"No data found."` / `"Данные не найдены."`).
   - Add any missing keys referenced in code: `Teachers.noSubject`, `Teachers.activeGroups`, `Teachers.errors.*`, `Teachers.success.*`, `Common.errors.unexpected`, `Search.result`/`Search.results`.
   - Ensure all 3 JSON files have identical valid JSON structures and synchronized keys.
2. `src/components/NotificationsDropdown.tsx`:
   - Replace all hardcoded English strings ("Notifications", "Mark all read", "Loading...", "No new notifications") with `useTranslations("Notifications")` and `useTranslations("Common")`.
3. Table Empty States:
   - Replace hardcoded Azerbaijani/English empty state texts in `src/app/[locale]/dashboard/page.tsx`, `students/page.tsx`, `groups/page.tsx`, `parents/page.tsx`, `finance/page.tsx`, `schedule/page.tsx` with `{c("empty")}` / `useTranslations("Common")`.
4. In-line Loading States:
   - Ensure in-line loading indicators across pages use `{c("loading")}`.

Verification Steps:
1. Run `npx tsc --noEmit` and ensure 0 errors.
2. Run `npm test` or `npx tsx tests/e2e/run_all.ts` and verify all R3 tests pass.
3. Write your handoff report to `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m3/handoff.md`.
4. Send a completion message back to the orchestrator.
