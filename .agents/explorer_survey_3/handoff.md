# Handoff Report: Survey Explorer 3 (Global Search, Header UI, next-intl, & Build Pipeline)

**Agent:** Survey Explorer 3  
**Target:** Orchestrator & Implementers  
**Date:** 2026-08-14  
**Type:** Hard Handoff  

---

## 1. Observation

1. **Header Search UI Current State:**
   - File: `src/app/[locale]/dashboard/layout.tsx` (lines 126–129)
     ```tsx
     <div className={styles.searchBar}>
       <Search size={18} className={styles.searchIcon} />
       <input type="text" placeholder="Axtarış..." />
     </div>
     ```
   - Stylings are in `src/app/[locale]/dashboard/layout.module.css` (lines 148–177). The search input is static and unlinked to any API or state.
2. **Global Search API Route:**
   - Path `src/app/api/search` does **not exist** in the workspace.
   - Database queries in existing endpoints (`src/app/api/students/route.ts:7`, `src/app/api/teachers/route.ts:7`, `src/app/api/groups/route.ts:7`) use raw SQL via `sql` imported from `@/lib/db` (`postgres.js`).
3. **Database Schema & Columns Observed:**
   - `students`: `id`, `profile_id`, `created_at` (joined with `user_profiles` on `profile_id = user_profiles.id`: `first_name`, `last_name`, `email`, `phone`).
   - `teachers`: `id`, `profile_id`, `specialization` (joined with `user_profiles` on `profile_id = user_profiles.id`: `first_name`, `last_name`, `email`, `phone`).
   - `groups`: `id`, `name`, `room`, `program_id`, `teacher_id` (joined with `programs` on `program_id = programs.id`: `name as program_name`).
4. **`next-intl` Configuration & Translation Dictionaries:**
   - Configuration in `src/i18n/routing.ts` defines `locales: ['en', 'az', 'ru']` with `defaultLocale: 'en'`.
   - Dictionaries: `messages/en.json`, `messages/az.json`, `messages/ru.json` (each currently 289 lines).
   - The namespace `"Search"` is **completely absent** across all 3 translation files.
   - Profile namespaces (`"Profile"`, `"StudentProfile"`, `"TeacherProfile"`, `"GroupProfile"`) and modal form keys for `"Tasks"`, `"Finance"`, `"Schedule"` are missing.
5. **Build & TypeScript Stack:**
   - `package.json`: Next.js `15.1.7`, React `19.0.0`, `next-intl` `^3.26.3`, `postgres` `^3.4.9`, TypeScript `^5`.
   - `tsconfig.json`: `"strict": true`, `"moduleResolution": "bundler"`, `"noEmit": true`, path alias `"@/*": ["./src/*"]`.
   - Next.js 15 route params convention: Server components and API route handlers must handle `params` as `Promise<{ ... }>`.

---

## 2. Logic Chain

1. **Global Search Feature:**
   - *Observation 1 & 2:* The header currently has a non-functional static input and no `src/app/api/search/route.ts` endpoint exists.
   - *Reasoning:* Implementing `GET /api/search?q=...` that queries `students`, `teachers`, and `groups` in parallel using `Promise.all([ ... ])` with `ILIKE` and `CONCAT_WS(' ', first_name, last_name)` will return a structured `{ students: [...], teachers: [...], groups: [...] }` payload.
   - *Reasoning:* Replacing the static input in `layout.tsx` with a debounced `GlobalSearch` component (or dropdown palette) linking to `/dashboard/students/${id}`, `/dashboard/teachers/${id}`, `/dashboard/groups/${id}` fulfills Requirement 3 and Acceptance Criteria item 2.
2. **Translation Completeness:**
   - *Observation 4:* `next-intl` is configured for 3 locales (`en`, `az`, `ru`), but none contain keys for `Search`, profile detail views, or management modals.
   - *Reasoning:* Missing translation keys in `next-intl` cause raw key strings or runtime warnings/crashes in strict configurations. Adding matched keys across `messages/en.json`, `messages/az.json`, and `messages/ru.json` guarantees smooth rendering and meets Acceptance Criteria item 3.
3. **Build & TypeScript Pipeline:**
   - *Observation 5:* The project is on Next.js 15 + React 19 with strict TypeScript.
   - *Reasoning:* All new API routes (`src/app/api/search/route.ts`, `src/app/api/students/[id]/route.ts`, etc.) and dynamic page components must properly type and await asynchronous `params: Promise<...>` to achieve 0 errors in `npx tsc --noEmit` and `npm run build`.

---

## 3. Caveats

- **Network / Interactive Shell Access:** Subagent environment does not run interactive bash/powershell commands directly without user prompt approval. All findings were verified through direct static analysis of source files, AST/types, and configs.
- **Database Search Performance:** For production scale, adding GIN/trigram indexes on `user_profiles.first_name`, `user_profiles.last_name`, and `groups.name` is recommended; for current CRM data size, `ILIKE %term%` with `LIMIT 8` is optimal and lightweight.

---

## 4. Conclusion

1. **Global Search Backend:** Create `src/app/api/search/route.ts` with `GET(req: Request)` querying `students`, `teachers`, and `groups` via `postgres.js` with `CONCAT_WS` and `ILIKE`.
2. **Global Search Frontend:** Implement `src/components/GlobalSearch.tsx` (and `.module.css`) with debounced input, dropdown results categorized by Students, Teachers, Groups, and navigation links. Wire into `src/app/[locale]/dashboard/layout.tsx`.
3. **Localization Dictionary Parity:** Add `Search`, `Profile`, and modal action keys to `messages/en.json`, `messages/az.json`, and `messages/ru.json`.
4. **TypeScript / Build Verification:** Ensure all Next.js 15 route parameters use `Promise<...>` and proper `await` syntax to ensure `npx tsc --noEmit` and `npm run build` pass cleanly with 0 errors.

---

## 5. Verification Method

1. **Search API Contract Check:**
   - Query `GET /api/search?q=test`
   - Expected status: `200 OK`
   - Expected JSON format:
     ```json
     {
       "students": [{"id": "...", "name": "...", "email": "...", "phone": "..."}],
       "teachers": [{"id": "...", "name": "...", "email": "...", "specialization": "..."}],
       "groups": [{"id": "...", "name": "...", "program": "...", "room": "..."}]
     }
     ```
2. **Translation Key Integrity:**
   - Inspect `messages/en.json`, `messages/az.json`, and `messages/ru.json` to verify that all referenced `useTranslations(...)` keys exist across all three files.
3. **TypeScript & Build Pipeline:**
   - Run `npx tsc --noEmit` -> Must complete with exit code 0.
   - Run `npm run build` -> Next.js build compilation must finish with 0 errors.
