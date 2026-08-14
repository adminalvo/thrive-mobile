# Handoff Report — survey_spec_miner_1

## 1. Observation
1. **Locale Files**:
   - Files: `messages/az.json`, `messages/en.json`, `messages/ru.json`.
   - Key count: 289 leaf keys in all three files, perfectly aligned across 19 namespaces (`HomePage`, `Auth`, `Sidebar`, `Dashboard`, `Leads`, `Students`, `Teachers`, `Schedule`, `Groups`, `Parents`, `Finance`, `Contract`, `Tasks`, `Settings`, `Common`, `NotFound`, `Programs`, `Profile`, `Search`).
2. **`NotificationsDropdown.tsx` (`src/components/NotificationsDropdown.tsx`)**:
   - Line 83: `<h3>Notifications</h3>` (Hardcoded English)
   - Line 86: `<Check size={14} /> Mark all read` (Hardcoded English)
   - Line 92: `<div className={styles.empty}>Loading...</div>` (Hardcoded English)
   - Line 94: `<div className={styles.empty}>No new notifications</div>` (Hardcoded English)
3. **Empty Table States Across Pages**:
   - `src/app/[locale]/dashboard/page.tsx:106`: `<td colSpan={4} style={{textAlign: "center", padding: "1rem"}}>Məlumat yoxdur</td>`
   - `src/app/[locale]/dashboard/students/page.tsx:159`: `<td colSpan={6} className={styles.emptyState}>Məlumat tapılmadı</td>`
   - `src/app/[locale]/dashboard/groups/page.tsx:192`: `<td colSpan={5} className={styles.emptyState}>Məlumat tapılmadı</td>`
   - `src/app/[locale]/dashboard/parents/page.tsx:170`: `<td colSpan={5} className={styles.emptyState}>Məlumat tapılmadı</td>`
   - `src/app/[locale]/dashboard/finance/page.tsx:284`: `<div className={styles.empty}>Hələ heç bir faktura yoxdur.</div>`
   - `src/app/[locale]/dashboard/schedule/page.tsx:185`: `<div className={styles.empty}>Hələ heç bir qrup və cədvəl yoxdur.</div>`
   - `Common.empty` key is currently missing in `messages/{az,en,ru}.json`.
4. **Loading States**:
   - `src/app/[locale]/dashboard/finance/page.tsx:282`: `<div className={styles.loading}>Yüklənir...</div>`
   - `src/app/[locale]/dashboard/schedule/page.tsx:183`: `<div className={styles.loading}>Yüklənir...</div>`
   - `src/app/[locale]/dashboard/tasks/page.tsx:287`: `<div className={styles.loading}>Yüklənir...</div>`
   - Zero `loading.tsx` route files currently exist in the codebase.
5. **Code References to Missing Translation Keys**:
   - `src/app/[locale]/dashboard/teachers/page.tsx`: Line 35 `t("errors.fetch")`, Line 38 & 81 `c("errors.unexpected")`, Line 72 `t("success.created")`, Line 77 `t("errors.create")`, Line 179 `t("noSubject")`, Line 183 `t("activeGroups")`.
   - `src/components/GlobalSearch.tsx:354`: `{totalResults === 1 ? "result" : "results"}`.

## 2. Logic Chain
1. *From Observation 1*: The application uses `next-intl` with JSON files in `messages/`. Translation keys must be kept synchronous across `az.json`, `en.json`, and `ru.json` to prevent key missing fallback errors in any locale.
2. *From Observation 2*: `NotificationsDropdown.tsx` currently bypasses `next-intl` for title, mark-all-read action, loading, and empty state. A dedicated `Notifications` namespace or `Common` keys must be introduced.
3. *From Observation 3*: Dashboard data tables currently hardcode Azerbaijani text ("Məlumat tapılmadı", "Məlumat yoxdur", "Hələ heç bir faktura yoxdur.") when arrays are empty. Adding `"empty"` to `Common` (`"No data found."` / `"Heç bir məlumat tapılmadı."` / `"Данные не найдены."`) and replacing these hardcoded strings with `{c("empty")}` provides consistent localized empty states everywhere.
4. *From Observation 4*: Route transition blocking occurs because Next.js has no `loading.tsx` boundaries for dashboard sub-routes. Adding `loading.tsx` to `students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`, and `dashboard` with `{c("loading")}` fulfills Requirement 1 & Requirement 3.
5. *From Observation 5*: `TeachersPage` had several pre-coded `t(...)` calls whose keys were omitted in the initial JSON files. Adding `Teachers.noSubject`, `Teachers.activeGroups`, `Teachers.errors.*`, `Teachers.success.*`, `Common.errors.unexpected`, and `Search.result`/`Search.results` resolves all runtime key lookup fallbacks.

## 3. Caveats
- Detail routes (`students/[id]`, `teachers/[id]`, `groups/[id]`) already have extensive `Profile` namespace translations and use `Profile.noGroups`, `Profile.noPayments`, `Profile.noAttendance`, `Profile.noSchedule`, `Profile.noStudents`. These do not require alteration unless harmonizing with `Common.empty`.
- Modal forms on creation (e.g. "Yeni Tələbə Əlavə Et") have hardcoded field labels in some pages; while Requirement 3 specifically demands `NotificationsDropdown`, empty table states, loading states, and missing message keys, full form localization can be addressed cleanly.

## 4. Conclusion
Requirement 3 is thoroughly mapped:
- 1 new namespace (`Notifications`) and additions to `Common`, `Teachers`, `Search`, and `Tasks` must be added to `messages/az.json`, `messages/en.json`, and `messages/ru.json`.
- `NotificationsDropdown.tsx` must be updated to use `useTranslations("Notifications")` and `useTranslations("Common")`.
- 6 table empty states in `dashboard`, `students`, `groups`, `parents`, `finance`, and `schedule` must use `c("empty")`.
- 3 component in-line loading indicators and all new `loading.tsx` files must use `Common.loading`.
- All detailed mappings are recorded in `analysis.md`.

## 5. Verification Method
1. Inspect `messages/{az,en,ru}.json` ensuring identical key count and presence of `Notifications`, `Common.empty`, and `Teachers` keys.
2. Run `node -e "['az','en','ru'].forEach(l => JSON.parse(fs.readFileSync('./messages/' + l + '.json')))"` to verify valid JSON syntax.
3. Check `NotificationsDropdown.tsx` with `grep_search` to verify 0 remaining hardcoded English text.
4. Check table pages with `grep_search` to verify 0 hardcoded "Məlumat tapılmadı" / "Məlumat yoxdur" strings.
5. Run `npx tsc --noEmit` and `npm run build` to confirm compilation.
