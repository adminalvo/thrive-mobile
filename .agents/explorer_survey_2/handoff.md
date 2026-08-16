# Handoff Report: Dedicated AI Dashboard Page & Sidebar Route Survey

**Agent:** `explorer_survey_2`  
**Milestone:** Survey  
**Working Directory:** `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/explorer_survey_2`

---

## 1. Observation
- **Sidebar Implementation Location**:
  - `src/app/[locale]/dashboard/layout.tsx:44-54`: Navigation items are declared inline via `navItems` array consisting of 9 items (`dashboard`, `leads`, `students`, `groups`, `parents`, `teachers`, `schedule`, `finance`, `tasks`).
  - `src/app/[locale]/dashboard/layout.tsx:88-100`: Navigation mapped into `<Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>`.
  - `src/app/[locale]/dashboard/layout.tsx:102-118`: Settings (`/dashboard/settings`) and Logout (`signOut`) reside in `.sidebarFooter`.
  - `src/components/Sidebar.tsx` does not currently exist as a separate file; all sidebar UI and logic are integrated within `layout.tsx`.
- **Active State & Navigation Mechanics**:
  - `src/app/[locale]/dashboard/layout.tsx:23`: `import { Link, usePathname, useRouter } from "@/i18n/routing";`
  - `src/app/[locale]/dashboard/layout.tsx:90`: `const isActive = pathname === item.href;`
  - Active styling uses CSS module classes `styles.navActive` and `styles.iconActive` (`layout.module.css:79-83, 94-97`).
- **Translations (`next-intl`)**:
  - `messages/az.json:25-37`, `messages/en.json:25-37`, `messages/ru.json:25-37`: `Sidebar` namespace has identical keys across all 3 files. `aiAssistant` key does not yet exist.
- **Icons (`lucide-react`)**:
  - `Bot` icon from `lucide-react` is used in `src/components/AiChatbot.tsx:5, 112, 157, 180` and is available for sidebar and dashboard page consumption.
- **Layout & Design Tokens**:
  - `src/app/globals.css:1-13`: Design tokens include `--glass-bg`, `--glass-border`, `--aqua-teal`, `--deep-navy`, `--ocean-blue`, `--text-primary`, `--text-secondary`.
  - `src/app/[locale]/dashboard/layout.module.css:1-382`: Desktop sidebar is 260px with collapsible 80px mode; tablet/mobile (<=1024px) utilizes an off-canvas drawer (`.sidebarOpen`) with `z-index: 100` and backdrop overlay (`.overlay`) with `z-index: 90`.

---

## 2. Logic Chain
1. **Sidebar Navigation Placement**:
   - `ORIGINAL_REQUEST.md` specifies adding a new menu item for "AI Köməkçi" (AI Assistant) below the existing menu items with the `Bot` icon and route `/dashboard/ai`.
   - By appending `{ name: t("aiAssistant"), href: "/dashboard/ai", icon: Bot }` to the end of `navItems` in `layout.tsx` (and exporting/creating `src/components/Sidebar.tsx` if standalone modularity is required), the AI assistant will be rendered immediately below `tasks` (`/dashboard/tasks`) in the navigation menu.
2. **Translation Synchronization**:
   - Because `next-intl` requires key parity across all locales (`az.json`, `en.json`, `ru.json`), adding `"aiAssistant"` to `"Sidebar"` namespace across all 3 files ensures zero hydration or missing key errors.
3. **Dedicated Page Integration (`/dashboard/ai`)**:
   - Page will live at `src/app/[locale]/dashboard/ai/page.tsx` with styles in `src/app/[locale]/dashboard/ai/page.module.css`.
   - It will render inside `DashboardLayout`'s `<main className={styles.pageContent}>`, providing consistent header, language switching, search, and responsive drawer behavior.

---

## 3. Caveats
- `ORIGINAL_REQUEST.md` specifically mentions updating `src/components/Sidebar.tsx`. Since the existing sidebar is embedded in `layout.tsx`, both creating a dedicated `src/components/Sidebar.tsx` (or refactoring/exporting) and updating `src/app/[locale]/dashboard/layout.tsx` should be done so that neither convention nor existing test suites are broken.
- SpeechRecognition browser support: Native `window.SpeechRecognition` / `window.webkitSpeechRecognition` is supported in Chromium browsers and Safari, but fallback error handling should be in place if unavailable or permission is denied.

---

## 4. Conclusion
The path for adding `/dashboard/ai` and the AI sidebar item is straightforward and fully compatible with the existing architecture:
1. Update `src/app/[locale]/dashboard/layout.tsx` (and provide `src/components/Sidebar.tsx`) to include the `Bot` icon and `/dashboard/ai` route.
2. Add `"aiAssistant"` key to `"Sidebar"` in `messages/az.json`, `messages/en.json`, `messages/ru.json`.
3. Create `src/app/[locale]/dashboard/ai/page.tsx` and `page.module.css` leveraging glassmorphic design tokens (`--glass-bg`, `--aqua-teal`), full-height responsive layout, voice/image input, and `/api/ai` communication.

---

## 5. Verification Method
1. Inspect `src/app/[locale]/dashboard/layout.tsx` and `src/components/Sidebar.tsx` for `Bot` import and `/dashboard/ai` entry.
2. Inspect `messages/az.json`, `messages/en.json`, and `messages/ru.json` for `"aiAssistant"` under `"Sidebar"`.
3. Run project build / typecheck:
   `npm run build` or `npx tsc --noEmit`
4. Run e2e test suite:
   `npx tsx tests/e2e/run_all.ts`
