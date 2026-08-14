# Technical Investigation Report: Global Search, Header UI, next-intl, & Build Pipeline

**Author:** Survey Explorer 3  
**Date:** 2026-08-14  
**Scope:** Global Search (`GET /api/search?q=...`), Header UI integration, next-intl dictionary completeness & routing, and TypeScript/Build verification pipeline.

---

## 1. Global Search Architecture & Header UI Integration

### 1.1 Current Header Implementation
- **Location:** `src/app/[locale]/dashboard/layout.tsx` (Lines 120–156) & `src/app/[locale]/dashboard/layout.module.css` (Lines 148–177).
- **Current State:**
  ```tsx
  <div className={styles.searchBar}>
    <Search size={18} className={styles.searchIcon} />
    <input type="text" placeholder="Axtarış..." />
  </div>
  ```
  The current search bar is a static placeholder input without event handlers, state, debouncing, dropdown/modal display, or API integration. The placeholder text is hardcoded to `"Axtarış..."` rather than using `next-intl` translation.

### 1.2 Proposed Header Search Component (`src/components/GlobalSearch.tsx`)
To fulfill R3 with high usability:
1. **Interactive Search Input & Command Palette:**
   - Implement either an expanding search dropdown or keyboard-accessible command palette (`Cmd+K` / `Ctrl+K`).
   - Include auto-focus, ESC-to-close, outside-click detection, and clear button (`X`).
2. **Debounced Fetching:**
   - Debounce search queries (250–300ms) to avoid excessive backend SQL load.
   - Target endpoint: `GET /api/search?q=${encodeURIComponent(query)}`.
3. **Categorized Results Display:**
   - Three distinct sections:
     - 🎓 **Students** (`students`): Shows full name, contact (email/phone), and links directly to `/dashboard/students/${student.id}`.
     - 👨‍🏫 **Teachers** (`teachers`): Shows full name, specialization, and links directly to `/dashboard/teachers/${teacher.id}`.
     - 👥 **Groups** (`groups`): Shows group name, program name, room, and links directly to `/dashboard/groups/${group.id}`.
4. **State Handling:**
   - Loading skeleton/spinner when fetching.
   - Empty state: `"No results found for '{query}'"` when array lengths are 0.
   - Initial state / Quick shortcuts when query is empty.
5. **Localization:**
   - Use `useTranslations("Search")` for dynamic placeholder, section headers, loading text, and empty messages across `en`, `az`, and `ru`.

---

## 2. Search API Specification (`GET /api/search?q=...`)

### 2.1 Endpoint Path & Configuration
- **File Path:** `src/app/api/search/route.ts`
- **Route Options:** `export const dynamic = "force-dynamic";`
- **Method:** `GET(req: Request)`

### 2.2 Query Logic with Raw SQL (`postgres.js`)
The database uses PostgreSQL accessed via `sql` from `@/lib/db`.

#### Multi-Table Search Query:
```ts
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        students: [],
        teachers: [],
        groups: []
      });
    }

    const term = `%${q}%`;

    // Query Students, Teachers, and Groups simultaneously
    const [students, teachers, groups] = await Promise.all([
      // 1. Students Query (joining user_profiles)
      sql`
        SELECT s.id, p.first_name, p.last_name, p.email, p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 8
      `,
      // 2. Teachers Query (joining user_profiles)
      sql`
        SELECT t.id, t.specialization, p.first_name, p.last_name, p.email, p.phone
        FROM teachers t
        LEFT JOIN user_profiles p ON t.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          t.specialization ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 8
      `,
      // 3. Groups Query (joining programs)
      sql`
        SELECT g.id, g.name, g.room, p.name as program_name
        FROM groups g
        LEFT JOIN programs p ON g.program_id = p.id
        WHERE (
          g.name ILIKE ${term} OR
          g.room ILIKE ${term} OR
          p.name ILIKE ${term}
        )
        LIMIT 8
      `
    ]);

    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
        email: s.email || "",
        phone: s.phone || ""
      })),
      teachers: teachers.map(t => ({
        id: t.id,
        name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
        email: t.email || "",
        specialization: t.specialization || "Təyin edilməyib"
      })),
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        program: g.program_name || "Proqram seçilməyib",
        room: g.room || ""
      }))
    });
  } catch (error: any) {
    console.error("Global Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
```

#### Critical SQL Caveat:
In PostgreSQL, `'str1' || ' ' || NULL` produces `NULL`. Using `CONCAT_WS(' ', p.first_name, p.last_name)` avoids NULL propagation when one of the names is null.

### 2.3 Verification Compatibility
This response format matches the acceptance test requirement:
- An independent script or agent can query `GET /api/search?q=mock` and receive `{ students: [...], teachers: [...], groups: [...] }`.

---

## 3. `next-intl` Configuration & Localization Audit

### 3.1 Architecture Overview
- **Next-intl Version:** `^3.26.3`
- **Supported Locales:** `['en', 'az', 'ru']` (Default: `'en'`) defined in `src/i18n/routing.ts`.
- **Navigation Utilities:** `src/i18n/routing.ts` exports `{ Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)`.
- **Middleware:** `src/middleware.ts` routes all non-API and non-static requests through `intlMiddleware = createMiddleware(routing)`.
- **Layout Provider:** `src/app/[locale]/layout.tsx` wraps the app in `<NextIntlClientProvider messages={messages}>` using messages loaded by `src/i18n/request.ts`.

### 3.2 Message Dictionaries Gap Analysis (`messages/{en,az,ru}.json`)
The current dictionary files (`messages/en.json`, `messages/az.json`, `messages/ru.json`) have 289 lines each and match each other, but have critical omissions for new features:

1. **`Search` Namespace (MISSING ENTIRELY):**
   - Missing in `en.json`, `az.json`, and `ru.json`.
   - Keys needed: `placeholder`, `title`, `students`, `teachers`, `groups`, `noResults`, `searching`, `shortcutHint`, `viewProfile`.
2. **`Profile` / `DynamicProfiles` Namespace (MISSING ENTIRELY):**
   - Profile pages (`/dashboard/students/[id]`, `/dashboard/teachers/[id]`, `/dashboard/groups/[id]`) need translation keys:
     - Tabs: `overview`, `payments`, `attendance`, `schedules`, `details`.
     - Labels: `back`, `personalInfo`, `contactInfo`, `academicInfo`, `status`, `enrolledAt`, `specialization`, `assignedTeacher`, `room`, `program`, `enrolledStudents`.
     - Empty states: `noPayments`, `noAttendance`, `noSchedule`.
3. **`Tasks` Namespace Expansion:**
   - Currently only contains `title`, `subtitle`, `newTask`, and `columns`.
   - Modals and forms need: `createModalTitle`, `editModalTitle`, `taskTitle`, `description`, `priority`, `priorityLow`, `priorityMedium`, `priorityHigh`, `dueDate`, `assignee`, `deleteConfirm`.
4. **`Finance` Namespace Expansion:**
   - Modals and payment processing need: `createInvoiceModal`, `processPaymentModal`, `selectStudent`, `amount`, `paymentMethod`, `cash`, `card`, `bankTransfer`, `dueDate`, `notes`.
5. **`Schedule` Namespace Expansion:**
   - Modals and schedule form need: `addScheduleModal`, `selectGroup`, `selectTeacher`, `dayOfWeek`, `startTime`, `endTime`, `room`.
6. **`Common` Namespace Additions:**
   - Add utility keys: `delete`, `edit`, `confirm`, `actions`, `back`, `all`, `search`, `error`, `success`, `close`.

---

## 4. TypeScript & Build Pipeline Verification

### 4.1 Dependency Stack
- **Framework:** Next.js `15.1.7` (App Router)
- **UI Runtime:** React `19.0.0` & React-DOM `19.0.0`
- **TypeScript:** `5.x`
- **Database:** `postgres: ^3.4.9` (postgres.js)
- **Styling:** CSS Modules with CSS Variables (`globals.css`)

### 4.2 TypeScript Strictness & Next.js 15 Breaking Changes
- `tsconfig.json` has `"strict": true`, `"moduleResolution": "bundler"`, `"noEmit": true`, and path alias `"@/*": ["./src/*"]`.
- **Next.js 15 Dynamic Route Params:**
  In Next.js 15, route `params` are asynchronous (`Promise<{ [key: string]: string }>`).
  - **Server Components:** Must type `params: Promise<{ locale: string; id: string }>` and use `const { locale, id } = await params;`.
  - **API Routes:** Must type `{ params }: { params: Promise<{ id: string }> }` and use `const { id } = await params;`.
  - **Client Components:** Use `useParams()` from `next/navigation` or unwrap via React 19 `use(params)`.
  - Violating this pattern causes TypeScript errors (`tsc --noEmit`) and build-time failure (`npm run build`).

### 4.3 Build Config Analysis (`next.config.ts`)
- `next.config.ts` wraps with `withNextIntl`.
- Note: `next.config.ts` currently sets `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }`.
- **However, Acceptance Criterion R3 explicitly requires `npx tsc --noEmit` and `npm run build` to pass with 0 errors.**
- Therefore, all types, imports, and exports must be 100% strictly valid.

### 4.4 Automated Testing & Verification Infrastructure
- `package.json` contains: `dev`, `build`, `start`, `lint`.
- There is no unit test runner (Jest/Vitest) installed in `package.json`.
- Verification can be performed using:
  1. `npx tsc --noEmit` to verify type safety across all files.
  2. `npm run build` to verify Next.js page generation and bundle compilation.
  3. API tests using `tsx` or Node fetch scripts against `/api/search?q=...`, `/api/tasks`, etc.

---

## 5. Summary Matrix & Action Plan for Implementation

| Module / Requirement | Current Status | Required Action |
|---|---|---|
| **Global Search Header UI** | Static dummy input | Build interactive dropdown/palette component with debounce, keyboard shortcuts (`Cmd+K`), and direct profile links |
| **Global Search API (`/api/search`)** | Not implemented (404) | Create `src/app/api/search/route.ts` querying `students`, `teachers`, and `groups` via `postgres.js` with `ILIKE` |
| **next-intl Message Keys** | Missing keys in `en`, `az`, `ru` | Add `Search`, `Profile`, `Tasks` modal keys, `Finance` modal keys, and `Schedule` modal keys in all 3 language files |
| **Dynamic Routing Integration** | Profile links not connected | Connect search results and table rows to `/dashboard/students/[id]`, `/teachers/[id]`, `/groups/[id]` |
| **TypeScript / Build Cleanliness** | Next.js 15 params typing needed | Ensure all dynamic route Server & API handlers properly await `params: Promise<...>` |
