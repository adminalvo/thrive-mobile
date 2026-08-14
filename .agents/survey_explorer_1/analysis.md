# Technical Survey & Architecture Analysis: R1 (Loading States) & R4 (Pure Dynamic SSR)

**Agent**: `survey_explorer_1`  
**Date**: 2026-08-15  
**Working Directory**: `c:/Users/mexty/OneDrive/Desktop/thrive-crm/.agents/survey_explorer_1`  
**Target Scope**: 
- **Requirement 1 (R1)**: Loading states (`loading.tsx`) across all 8 dashboard sub-routes (`students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`).
- **Requirement 4 (R4)**: Pure dynamic SSR in `src/app/[locale]/layout.tsx` (removal of `generateStaticParams`, addition of `export const dynamic = "force-dynamic"`).

---

## 1. Executive Summary

This investigation performed a comprehensive audit of the Thrive CRM codebase regarding **Server-Side Rendering configuration** and **Next.js App Router loading state boundaries**.

### Key Findings:
1. **Requirement 4 (Pure Dynamic SSR)**:
   - `src/app/[locale]/layout.tsx:21-23` currently exports `generateStaticParams()`.
   - Running `npm run build` generates 40 static/SSG prerendered pages marked `● (SSG)`.
   - Removing `generateStaticParams()` and exporting `export const dynamic = "force-dynamic";` in `src/app/[locale]/layout.tsx` forces all `/[locale]` routes to render as `ƒ (Dynamic)` on demand. This also directly satisfies test `ADV1.2` in `tests/e2e/tier5_adversarial.test.ts`.
2. **Requirement 1 (Loading States `loading.tsx`)**:
   - There are currently **zero** `loading.tsx` files in the entire project (`src/app/`).
   - Client navigations currently rely solely on in-component `useState(loading)` flags, meaning Next.js route transitions can block or feel sluggish before the target page bundle evaluates.
   - All 8 sub-routes are `"use client"` components with distinct layout profiles (3 Table views, 2 Kanban views, 2 Grid views, 1 Financial/Stats view).
   - Translation keys for loading (`Common.loading`) already exist across all three locales:
     - `messages/az.json`: `"Yüklənir..."`
     - `messages/en.json`: `"Loading..."`
     - `messages/ru.json`: `"Загрузка..."`
   - Using `"use client"` `loading.tsx` files consuming `useTranslations("Common")` provides instant, localized, non-blocking visual feedback during navigation.

---

## 2. Requirement 4 Deep-Dive: Enforce Pure Dynamic SSR

### 2.1 Current File Inspection: `src/app/[locale]/layout.tsx`

```tsx
// File: src/app/[locale]/layout.tsx (Lines 20-36)
export const metadata: Metadata = {
  title: "Thrive CRM - Future of Education",
  description: "Premium CRM for Thrive Education Center.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  ...
```

### 2.2 Current Build Baseline Output
When `generateStaticParams` is present, `next build` emits:
```
Route (app)                              Size     First Load JS
├ ● /[locale]                            6.24 kB         172 kB
├   ├ /en
├   ├ /az
├   └ /ru
├ ● /[locale]/dashboard                  2.35 kB         164 kB
├ ● /[locale]/dashboard/finance          5.58 kB         182 kB
├ ● /[locale]/dashboard/groups           9.41 kB         180 kB
├ ● /[locale]/dashboard/leads            2.96 kB         170 kB
├ ● /[locale]/dashboard/parents          2.8 kB          172 kB
├ ● /[locale]/dashboard/schedule         3.44 kB         170 kB
├ ● /[locale]/dashboard/settings         2.47 kB         130 kB
├ ● /[locale]/dashboard/students         8.2 kB          179 kB
├ ● /[locale]/dashboard/tasks            4.05 kB         171 kB
├ ● /[locale]/dashboard/teachers         7.54 kB         178 kB
├ ● /[locale]/login                      1.79 kB         180 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

### 2.3 Proposed Change in `src/app/[locale]/layout.tsx`
1. **Remove**:
   ```typescript
   export function generateStaticParams() {
     return routing.locales.map((locale) => ({locale}));
   }
   ```
2. **Add**:
   ```typescript
   export const dynamic = "force-dynamic";
   ```

### 2.4 Downstream & Architectural Verification
- **API Routes**: All 22 API route files under `src/app/api/**/route.ts` already declare `export const dynamic = "force-dynamic";`.
- **Middleware**: `src/middleware.ts` runs on the edge and forwards protected requests to `/dashboard` and uses `intlMiddleware(req)` for locale negotiation.
- **Dynamic SSR Result**: After this modification, `npm run build` will prerender 0 locale pages at build time and mark all `/[locale]/...` pages with `ƒ (Dynamic)`.

---

## 3. Requirement 1 Deep-Dive: Loading States (`loading.tsx`)

### 3.1 Sub-Route Inventory & Architectural Analysis

| Sub-Route | Current UI Archetype | Key Visual Elements | Existing Internal Loading State |
|---|---|---|---|
| `/dashboard/students` | **Table View** | Header, Search + Status Filter, Table with Student Avatars, Group Badges, Status Badges | `styles.skeletonContainer` (avatar + 2 skeleton lines) |
| `/dashboard/teachers` | **Card Grid View** | Header, Search, Responsive Card Grid (70px circular avatars, info rows) | `styles.loading` text (`c("loading")`) |
| `/dashboard/parents` | **Table View** | Header, Search, Table (Avatar icon with UserPlus, contact, FIN, ID card) | `<tr><td className={styles.emptyState}>{c("loading")}</td></tr>` |
| `/dashboard/groups` | **Table View** | Header, Search, Table (Avatar icon with Component, Program, Teacher, Room) | `<tr><td className={styles.emptyState}>{c("loading")}</td></tr>` |
| `/dashboard/leads` | **Kanban Board** | Header, Search, 5 Column Kanban (New, Contacted, Trial, Registered, Lost) | Column body text (`t("loading")`) |
| `/dashboard/finance` | **Stats + Table View** | Header, 2 Stat Cards (Income, Debt), Search, Invoices Table | `styles.loading` text (`"Yüklənir..."`) |
| `/dashboard/tasks` | **Kanban Board** | Header, 4 Column Kanban (TODO, IN_PROGRESS, REVIEW, DONE), Priority badges | Column body text (`"Yüklənir..."`) |
| `/dashboard/schedule` | **Card Grid View** | Header, Schedule Grid with Group Cards & Day/Time slot rows | `styles.loading` text (`"Yüklənir..."`) |
| `/dashboard` (Overview) | **Dashboard Hub** | 4 Summary Stat Cards, Recent Registrations table | In-page async fetch |

### 3.2 Design Patterns & i18n Strategy

1. **Client Component vs Server Component for `loading.tsx`**:
   - Marking `loading.tsx` with `"use client"` is standard in Next.js 15 App Router when using `useTranslations("Common")`.
   - Because `NextIntlClientProvider` is in `src/app/[locale]/layout.tsx`, client `loading.tsx` boundaries immediately inherit the loaded translation dictionary without requiring asynchronous server roundtrips.
2. **Translation Key**:
   - All `loading.tsx` files should invoke:
     ```tsx
     const t = useTranslations("Common");
     // t("loading") -> "Loading..." (en), "Yüklənir..." (az), "Загрузка..." (ru)
     ```
3. **Skeleton Aesthetics & Styling**:
   - To match Thrive CRM's futuristic dark glassmorphism theme, skeletons use pulse animations:
     - Base color: `rgba(255, 255, 255, 0.05)`
     - Background highlight: `rgba(76, 162, 181, 0.1)` (aqua teal tint)
     - Border: `1px solid rgba(255, 255, 255, 0.05)`
     - Pulse animation: `0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; }`
   - Incorporating `<Loader2 className="animate-spin" size={16} />` alongside `t("loading")` in a subtle badge or header provides crystal-clear user feedback while content skeletons hold layout dimensions to eliminate Cumulative Layout Shift (CLS).

---

## 4. Route-by-Route Blueprint & Implementation Designs

### 4.1 `src/app/[locale]/dashboard/students/loading.tsx` (Table Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function StudentsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeletonBox} style={{ width: 180, height: 32, marginBottom: 8 }} />
          <div className={styles.skeletonBox} style={{ width: 260, height: 16 }} />
        </div>
        <div className={styles.skeletonBox} style={{ width: 140, height: 42, borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.skeletonBox} style={{ flex: 1, height: 44, borderRadius: 8 }} />
        <div className={styles.skeletonBox} style={{ width: 180, height: 44, borderRadius: 8 }} />
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonBox} ${styles.skelAvatar}`} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: "40%" }} />
                <div className={styles.skeletonLine} style={{ width: "25%" }} />
              </div>
              <div className={styles.skeletonBox} style={{ width: 90, height: 24, borderRadius: 6 }} />
              <div className={styles.skeletonBox} style={{ width: 70, height: 24, borderRadius: 20 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.2 `src/app/[locale]/dashboard/teachers/loading.tsx` (Card Grid Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function TeachersLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 220, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 280, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", margin: "0.5rem 0" }}>
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
        <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
      </div>

      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.card} style={{ opacity: 0.7 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)", marginBottom: "1rem", animation: "pulse 1.5s infinite" }} />
            <div style={{ width: "60%", height: 18, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: "0.5rem", animation: "pulse 1.5s infinite" }} />
            <div style={{ width: "80%", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 4, marginBottom: "1.2rem", animation: "pulse 1.5s infinite" }} />
            <div style={{ width: "100%", height: 36, background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: "0.5rem" }} />
            <div style={{ width: "100%", height: 36, background: "rgba(255,255,255,0.02)", borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.3 `src/app/[locale]/dashboard/parents/loading.tsx` (Table Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "../students/page.module.css";

export default function ParentsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeletonBox} style={{ width: 180, height: 32, marginBottom: 8 }} />
          <div className={styles.skeletonBox} style={{ width: 260, height: 16 }} />
        </div>
        <div className={styles.skeletonBox} style={{ width: 140, height: 42, borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.skeletonBox} style={{ flex: 1, height: 44, borderRadius: 8 }} />
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonBox} ${styles.skelAvatar}`} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: "45%" }} />
                <div className={styles.skeletonLine} style={{ width: "30%" }} />
              </div>
              <div className={styles.skeletonBox} style={{ width: 100, height: 20 }} />
              <div className={styles.skeletonBox} style={{ width: 80, height: 20 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.4 `src/app/[locale]/dashboard/groups/loading.tsx` (Table Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "../students/page.module.css";

export default function GroupsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeletonBox} style={{ width: 180, height: 32, marginBottom: 8 }} />
          <div className={styles.skeletonBox} style={{ width: 260, height: 16 }} />
        </div>
        <div className={styles.skeletonBox} style={{ width: 140, height: 42, borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.skeletonBox} style={{ flex: 1, height: 44, borderRadius: 8 }} />
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={`${styles.skeletonBox} ${styles.skelAvatar}`} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: "50%" }} />
                <div className={styles.skeletonLine} style={{ width: "35%" }} />
              </div>
              <div className={styles.skeletonBox} style={{ width: 110, height: 20 }} />
              <div className={styles.skeletonBox} style={{ width: 60, height: 20 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.5 `src/app/[locale]/dashboard/leads/loading.tsx` (Kanban Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function LeadsLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 260, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
      </div>

      <div className={styles.toolbar}>
        <div style={{ flex: 1, height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", padding: "0 1rem" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className={styles.column} style={{ opacity: 0.7 }}>
            <div className={styles.columnHeader}>
              <div className={styles.colIndicator} style={{ background: "rgba(255,255,255,0.2)" }} />
              <div style={{ width: 100, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <span className={styles.count}>...</span>
            </div>
            <div className={styles.columnBody}>
              {[1, 2, 3].map((card) => (
                <div key={card} className={styles.card}>
                  <div style={{ width: 60, height: 18, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "80%", height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "50%", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.6 `src/app/[locale]/dashboard/finance/loading.tsx` (Finance Stats + Invoices Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function FinanceLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 260, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)" }} />
          <div>
            <div style={{ width: 100, height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: 120, height: 28, background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.debtCard}`}>
          <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)" }} />
          <div>
            <div style={{ width: 100, height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: 120, height: 28, background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <div style={{ width: "100%", height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0 1rem", color: "var(--text-secondary)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
          <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
              <div style={{ width: 60, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 140, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 80, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 70, height: 22, background: "rgba(255,255,255,0.05)", borderRadius: 20 }} />
              <div style={{ width: 90, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.7 `src/app/[locale]/dashboard/tasks/loading.tsx` (Tasks Kanban Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function TasksLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 260, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
            <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
          </div>
          <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className={styles.column} style={{ opacity: 0.7 }}>
            <div className={styles.columnHeader}>
              <div className={styles.colIndicator} style={{ background: "rgba(255,255,255,0.2)" }} />
              <div style={{ width: 100, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <span className={styles.count}>...</span>
            </div>
            <div className={styles.columnBody}>
              {[1, 2, 3].map((card) => (
                <div key={card} className={styles.card}>
                  <div style={{ width: 50, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "90%", height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ width: "65%", height: 12, background: "rgba(255,255,255,0.03)", borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 60, height: 12, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
                    <div style={{ width: 60, height: 12, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.8 `src/app/[locale]/dashboard/schedule/loading.tsx` (Schedule Grid Skeleton)
```tsx
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import styles from "./page.module.css";

export default function ScheduleLoading() {
  const t = useTranslations("Common");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ width: 180, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 260, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "var(--aqua-teal)" }} />
            <span style={{ fontSize: "0.9rem" }}>{t("loading")}</span>
          </div>
          <div style={{ width: 140, height: 42, background: "rgba(255,255,255,0.08)", borderRadius: 8 }} />
        </div>
      </div>

      <div className={styles.scheduleGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.groupCard} style={{ opacity: 0.7 }}>
            <div className={styles.cardHeader}>
              <div style={{ width: 120, height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
              <div style={{ width: 32, height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 6 }} />
            </div>
            <div className={styles.cardInfo}>
              <div style={{ width: "70%", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
              <div style={{ width: "50%", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
            </div>
            <div className={styles.schedulesList}>
              <div style={{ width: "100%", height: 24, background: "rgba(255,255,255,0.02)", borderRadius: 4 }} />
              <div style={{ width: "100%", height: 24, background: "rgba(255,255,255,0.02)", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Verification Strategy & Acceptance Matrix

| Check | Tool / Command | Target State / Criteria |
|---|---|---|
| TypeScript Typecheck | `npx tsc --noEmit` | Clean exit code 0 |
| Dynamic SSR Build | `npm run build` | `/dashboard/...` routes must be marked `ƒ (Dynamic)` with zero `● (SSG)` routes for `[locale]` |
| Adversarial Test | `npx tsx tests/e2e/run_all.ts` | Test `ADV1.2` in `tier5_adversarial.test.ts` passes (`generateStaticParams` absent, `dynamic = 'force-dynamic'` present) |
| Route Navigation Loading Boundary | Agent inspection / Next.js client router | Navigating between `/dashboard/students`, `/teachers`, `/parents`, etc. renders `loading.tsx` boundary immediately |
| i18n Translation Integrity | JSON message inspection | All `loading.tsx` use `useTranslations("Common")("loading")` corresponding to `en.json`, `az.json`, `ru.json` |

