## 2026-08-15T01:48:42+04:00

You are worker_m2.
Your working directory is: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m2
Read the original user request at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/ORIGINAL_REQUEST.md
Read the project specification at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/PROJECT.md
Read the survey findings at: c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_explorer_2/handoff.md and c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_explorer_2/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Assigned Files:
You exclusively own and will modify:
1. `src/app/[locale]/dashboard/layout.tsx` & `src/app/[locale]/dashboard/layout.module.css`:
   - Refactor sidebar drawer so it collapses on `< 1024px`. Ensure clean CSS class-based transitions (`sidebarOpen`) without inline Framer Motion transforms overriding media queries during SSR/hydration.
   - Adjust tablet padding (`.pageContent`, `.header`) for screens 768px - 1024px.
2. Data Tables Responsiveness:
   - `src/app/[locale]/dashboard/students/page.module.css`
   - `src/app/[locale]/dashboard/finance/page.module.css`
   - Profile modules if applicable (`studentProfile.module.css`, `teacherProfile.module.css`, `groupProfile.module.css`, `ContractModal.module.css`)
   - Ensure all `.tableContainer` / wrappers have `overflow-x: auto;` and `.table` has `min-width: 650px - 750px` to prevent text squashing and enable smooth horizontal scrolling on iPad screens.
3. Kanban Boards Responsiveness:
   - `src/app/[locale]/dashboard/tasks/page.module.css`
   - `src/app/[locale]/dashboard/leads/page.module.css`
   - Ensure `.kanbanBoard` has `overflow-x: auto;`, `.column` has `min-width: 270px;`, and board gaps scale cleanly on tablet screens.
4. Modal Dialogs Responsiveness:
   - Standardize all modals (`.modal`) to `width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;`.
   - Ensure form input grids (`.formGrid`, `.rowInputs`) collapse to a single column on tablet/mobile screens (`@media (max-width: 768px)` or `@media (max-width: 1024px)`).

Verification Steps:
1. Run `npx tsc --noEmit` and ensure 0 TypeScript errors.
2. Run `npm test` or `npx tsx tests/e2e/run_all.ts` and verify all R2 tests pass.
3. Write your handoff report to `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/worker_m2/handoff.md`.
4. Send a completion message back to the orchestrator.
