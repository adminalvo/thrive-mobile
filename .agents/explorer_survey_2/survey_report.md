# Survey Report: Sidebar Navigation & Dashboard Route Integration

**Agent:** `explorer_survey_2`  
**Date:** 2026-08-16  
**Target:** Dedicated AI Dashboard Page & Sidebar Integration (`/dashboard/ai`)

---

## 1. Sidebar & Navigation Architecture

### Current Structure & Location
In the Thrive CRM codebase, sidebar navigation is currently implemented directly in:
- **`src/app/[locale]/dashboard/layout.tsx`** (Lines 1–166)
- **`src/app/[locale]/dashboard/layout.module.css`** (Lines 1–382)

*(Note: While `ORIGINAL_REQUEST.md` refers to `src/components/Sidebar.tsx`, the project currently embeds the sidebar in `layout.tsx`. To achieve full modularity and satisfy any external component imports, a standalone `src/components/Sidebar.tsx` should also be created or exported while keeping `layout.tsx` in sync.)*

### Current Navigation Items Array (`layout.tsx:44-54`)
```tsx
const navItems = [
  { name: t("dashboard"), href: `/dashboard`, icon: LayoutDashboard },
  { name: t("leads"), href: `/dashboard/leads`, icon: Target },
  { name: t("students"), href: "/dashboard/students", icon: Users },
  { name: t("groups"), href: "/dashboard/groups", icon: Component },
  { name: t("parents"), href: "/dashboard/parents", icon: UserPlus },
  { name: t("teachers"), href: "/dashboard/teachers", icon: BookOpen },
  { name: t("schedule"), href: `/dashboard/schedule`, icon: Calendar },
  { name: t("finance"), href: `/dashboard/finance`, icon: CreditCard },
  { name: t("tasks"), href: `/dashboard/tasks`, icon: KanbanSquare },
];
```

### Footer Items (`layout.tsx:102-118`)
- **Settings**: `/dashboard/settings` with `Settings` icon (`t("settings")`)
- **Logout**: Triggers `signOut({ callbackUrl: '/login' })` with `LogOut` icon (`t("logout")`)

---

## 2. Routing, Active State, i18n & Icons

### Routing & Navigation
- **i18n Config**: `src/i18n/routing.ts` defines:
  ```typescript
  export const routing = defineRouting({
    locales: ['en', 'az', 'ru'],
    defaultLocale: 'az',
    localePrefix: 'always'
  });
  export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
  ```
- **Locale Routing**:
  - `Link` from `@/i18n/routing` automatically prefixes paths with the active locale (e.g. `/az/dashboard/ai`, `/en/dashboard/ai`, `/ru/dashboard/ai`).
  - `usePathname()` from `@/i18n/routing` returns the path without the locale prefix (e.g. `/dashboard/ai`, `/dashboard`).

### Active State Detection (`layout.tsx:90`)
```tsx
const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
```
- Active style class: `styles.navActive` (background: `rgba(76, 162, 181, 0.1)`, border: `1px solid rgba(76, 162, 181, 0.2)`)
- Active icon class: `styles.iconActive` (color: `var(--aqua-teal)`, drop-shadow: `0 0 5px rgba(76, 162, 181, 0.5)`)

### Translations (`next-intl`)
- Translation hook: `const t = useTranslations("Sidebar");`
- Current `Sidebar` namespace across `messages/az.json`, `messages/en.json`, `messages/ru.json`:
  - `dashboard`: `"İdarə Paneli"` | `"Dashboard"` | `"Главная"`
  - `leads`: `"Potensial Müştəri"` | `"Leads"` | `"Лиды"`
  - `students`: `"Tələbələr"` | `"Students"` | `"Студенты"`
  - `groups`: `"Qruplar"` | `"Groups"` | `"Группы"`
  - `parents`: `"Valideynlər"` | `"Parents"` | `"Родители"`
  - `teachers`: `"Müəllimlər"` | `"Teachers"` | `"Преподаватели"`
  - `schedule`: `"Cədvəl"` | `"Schedule"` | `"Расписание"`
  - `finance`: `"Maliyyə"` | `"Finance"` | `"Финансы"`
  - `tasks`: `"Tapşırıqlar"` | `"Tasks"` | `"Задачи"`
  - `settings`: `"Tənzimləmələr"` | `"Settings"` | `"Настройки"`
  - `logout`: `"Çıxış"` | `"Logout"` | `"Выйти"`

**Proposed i18n Addition (`Sidebar.aiAssistant` or `Sidebar.ai`):**
- `messages/az.json`: `"aiAssistant": "AI Köməkçi"`
- `messages/en.json`: `"aiAssistant": "AI Assistant"`
- `messages/ru.json`: `"aiAssistant": "AI Помощник"`

### Icon Imports
- `lucide-react` is used across all components.
- The `Bot` icon (`import { Bot } from "lucide-react";`) is available and already used in `AiChatbot.tsx`.

---

## 3. Existing Dashboard Pages & Layout Analysis

### Dashboard Layout Container (`src/app/[locale]/dashboard/layout.tsx`)
1. **Container (`.container`)**:
   - `display: flex; height: 100vh; overflow: hidden; background-color: #010409;`
2. **Sidebar (`.sidebar`)**:
   - Width: `260px` (or `80px` when `.sidebarCollapsed` is toggled on desktop).
   - Glassmorphism: `background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(20px); border-right: 1px solid rgba(255, 255, 255, 0.05);`
   - Z-index: `100`.
3. **Main Content (`.mainContent`)**:
   - Header height: `70px` (`z-index: 40`), includes hamburger toggle, `GlobalSearch`, language switcher (`az`, `en`, `ru`), `NotificationsDropdown`, and Profile avatar.
   - Page Content (`.pageContent`): `flex: 1; padding: 2rem; overflow-y: auto; position: relative;`
4. **Responsive Behavior (`@media (max-width: 1024px)`)**:
   - Sidebar becomes a fixed off-canvas drawer: `position: fixed; transform: translateX(-100%); z-index: 100;`
   - When open: `.sidebarOpen` applies `transform: translateX(0);`
   - Semi-transparent backdrop overlay: `z-index: 90; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);`
   - Page padding reduces to `1.25rem`.
   - On link navigation click, `setSidebarOpen(false)` is automatically invoked.

### Design Tokens (`src/app/globals.css`)
- `--deep-navy`: `#000b21`
- `--ocean-blue`: `#003f82`
- `--aqua-teal`: `#4ca2b5`
- `--white`: `#ffffff`
- `--text-primary`: `#f8fafc`
- `--text-secondary`: `#94a3b8`
- `--glass-bg`: `rgba(2, 6, 23, 0.7)` (Dark) / `rgba(255, 255, 255, 0.8)` (Light)
- `--glass-border`: `rgba(255, 255, 255, 0.1)` (Dark) / `rgba(0, 0, 0, 0.1)` (Light)
- `--gradient-primary`: `linear-gradient(135deg, var(--deep-navy) 0%, var(--ocean-blue) 50%, var(--aqua-teal) 100%)`

---

## 4. Integration Plan for `/dashboard/ai`

### A. Sidebar Update in `src/app/[locale]/dashboard/layout.tsx` (and `src/components/Sidebar.tsx`)
1. Import `Bot` from `lucide-react`.
2. Append `{ name: t("aiAssistant"), href: `/dashboard/ai`, icon: Bot }` at the bottom of `navItems` (below `tasks`).
3. Ensure active state highlights `/dashboard/ai`.
4. Ensure mobile drawer click handler closes the sidebar on navigation (`onClick={() => setSidebarOpen(false)}`).

### B. Translation Dictionaries (`messages/az.json`, `messages/en.json`, `messages/ru.json`)
Add `"aiAssistant"` into the `"Sidebar"` namespace across all 3 locale JSON files:
- `az.json`: `"aiAssistant": "AI Köməkçi"`
- `en.json`: `"aiAssistant": "AI Assistant"`
- `ru.json`: `"aiAssistant": "AI Помощник"`

Also add an `"AI"` namespace for dedicated page strings (header, placeholders, sample prompts, voice dictation tooltips, clear chat button, etc.).

### C. Dedicated AI Dashboard Page (`src/app/[locale]/dashboard/ai/page.tsx` & `page.module.css`)
1. **Layout**:
   - Full-height container (`height: calc(100vh - 70px - 4rem)` on desktop, responsive on tablet/mobile).
   - Glassmorphic card container (`background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: blur(16px)`).
2. **Features**:
   - Header with Thrive AI status badge, model indicator, and "Clear Conversation" button.
   - Quick action prompt chips when conversation is empty (e.g. "Yeni tələbə qeydiyyatı", "Maliyyə hesabatı", "Müəllimlərin siyahısı", "Cədvəl yoxla").
   - Scrollable messages stream with auto-scroll.
   - Rich message bubbles for User & Assistant with timestamp and role badge.
   - Voice Dictation via `window.SpeechRecognition` / `window.webkitSpeechRecognition` with pulsating indicator.
   - Image attachment with Base64 preview & OpenAI Vision payload format (`/api/ai`).
   - Loading indicator with animated spinning bot icon.
   - Error handling & toast notifications.
