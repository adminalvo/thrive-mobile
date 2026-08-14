# Handoff Report: Dynamic Profile Pages & Relational Backend Data Layer (R1)

## 1. Observation
- **Framework & Dependencies**:
  - `next`: `15.1.7` (Next.js 15 App Router, React 19.0.0, async route params)
  - `postgres`: `3.4.9` (Direct SQL queries via `src/lib/db.ts` with connection pooling)
  - `next-intl`: `3.26.3` (Localized routing under `src/app/[locale]/`, message catalogs in `messages/{az,en,ru}.json`)
- **Existing Page Structure**:
  - Students list: `src/app/[locale]/dashboard/students/page.tsx` exists, but there is NO `/dashboard/students/[id]` dynamic page.
  - Teachers list: `src/app/[locale]/dashboard/teachers/page.tsx` exists, but there is NO `/dashboard/teachers/[id]` dynamic page.
  - Groups list: `src/app/[locale]/dashboard/groups/page.tsx` exists, but there is NO `/dashboard/groups/[id]` dynamic page.
  - Rows and cards in list pages currently lack navigational links to dynamic `[id]` profiles.
- **Existing API Routes**:
  - `src/app/api/students/[id]/route.ts`: Contains `DELETE` and stub `PUT`, but is missing `GET`.
  - `src/app/api/teachers/[id]/route.ts`: Contains `DELETE` and stub `PUT`, but is missing `GET`.
  - `src/app/api/groups/[id]/route.ts`: Contains `DELETE` and `PUT`, but is missing `GET`.
- **Database Schema**:
  - Core tables identified in PostgreSQL: `auth.users`, `user_profiles`, `user_roles`, `students`, `teachers`, `parents`, `groups`, `programs`, `payments`, `kanban_tasks`, `leads`, `notifications`.
  - Table relationships:
    * `students.profile_id -> user_profiles.id -> auth.users.id`
    * `teachers.profile_id -> user_profiles.id -> auth.users.id`
    * `groups.program_id -> programs.id`, `groups.teacher_id -> auth.users.id / teachers.id`
    * `payments.student_id -> students.id`

---

## 2. Logic Chain
1. **Routing & Next.js 15 Compatibility**:
   - Because Next.js 15 enforces asynchronous route parameters (`params: Promise<{ locale: string; id: string }>`), client components rendering profile pages must resolve params with `use(params)` or `useParams()`. Server components must `await params`.
   - Creating `src/app/[locale]/dashboard/students/[id]/page.tsx`, `src/app/[locale]/dashboard/teachers/[id]/page.tsx`, and `src/app/[locale]/dashboard/groups/[id]/page.tsx` with async param unwrapping satisfies Next.js 15 compilation rules without runtime warnings or hydration errors.
2. **Relational Data Layer (`postgres.js`)**:
   - Implementing `GET /api/students/[id]`, `GET /api/teachers/[id]`, and `GET /api/groups/[id]` with multi-query relational joins (combining profile data, payments, groups, attendance records, and schedule timings) provides complete, coherent data payloads for each profile.
   - Using PostgreSQL `LEFT JOIN`s and fallback aggregations guarantees that records with partial data (e.g. newly created student with no payments yet) return cleanly without crashing.
3. **UI/UX Component & Tab Architecture**:
   - Equipping each profile with a top summary header (avatar, contact info, status pill, action buttons), 3-4 KPI stat cards, and 4 dedicated relationship tabs (`Overview`, `Groups/Classes`, `Payments/Finance`, `Attendance/Schedule`) fulfills the complete relationship visualization requirement.
   - Updating table rows in `students/page.tsx`, `teachers/page.tsx`, and `groups/page.tsx` with clickable `Link` tags connects the master lists directly to dynamic profile pages.
4. **Internationalization (`next-intl`)**:
   - Adding a dedicated `Profile` section to `messages/en.json`, `messages/az.json`, and `messages/ru.json` ensures all profile labels, tabs, table columns, and status badges translate seamlessly and prevent missing-key warnings.

---

## 3. Caveats
- Direct database schema inspection was performed via codebase analysis of SQL queries and migrations. If secondary relational tables (e.g., dedicated `attendance` or `group_students` junction tables) have not yet been seeded with extensive rows, the API queries must use safe `LEFT JOIN` and fallback defaults so that empty relationships return empty arrays (`[]`) rather than SQL syntax errors.
- Ensure all API route handlers include `export const dynamic = "force-dynamic";` to prevent Next.js static build errors when accessing request parameters and live PostgreSQL data.

---

## 4. Conclusion
Requirement 1 is thoroughly analyzed and ready for implementation:
- 3 dynamic profile page routes (`/dashboard/students/[id]`, `/dashboard/teachers/[id]`, `/dashboard/groups/[id]`) must be created.
- 3 API route `GET` handlers (`/api/students/[id]`, `/api/teachers/[id]`, `/api/groups/[id]`) must be added to fetch relational data via `postgres.js`.
- Master list pages (`students/page.tsx`, `teachers/page.tsx`, `groups/page.tsx`) must be updated with row-click navigation to the dynamic pages.
- `messages/{en,az,ru}.json` must be updated with translation keys for the `Profile` module.
- Full details, schemas, SQL queries, and UI designs are documented in `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\explorer_survey_1\analysis.md`.

---

## 5. Verification Method
1. **Compilation & Type Check**:
   - Run `npx tsc --noEmit` to verify all TypeScript interfaces, async params, and imports compile with 0 errors.
2. **Next.js Production Build**:
   - Run `npm run build` to verify all dynamic `[locale]/dashboard/students/[id]`, `[locale]/dashboard/teachers/[id]`, and `[locale]/dashboard/groups/[id]` routes compile and prerender cleanly.
3. **API & UI Verification**:
   - Request `GET /api/students/<id>`, `GET /api/teachers/<id>`, `GET /api/groups/<id>` and verify JSON responses contain relational objects (`student`, `groups`, `payments`, `attendance`, `stats`).
   - Navigate to `/dashboard/students/<id>`, `/dashboard/teachers/<id>`, and `/dashboard/groups/<id>` across all locales (`/en`, `/az`, `/ru`) and verify all tabs and cards render without translation missing errors.
