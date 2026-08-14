# Survey & Specification Mining: Requirement 3 (i18n Completeness)

## Executive Summary
This survey provides a comprehensive audit of the internationalization (i18n) setup for Thrive CRM across Azerbaijani (`az`), English (`en`), and Russian (`ru`). It inspects the locale message files, `NotificationsDropdown.tsx`, all dashboard sub-routes, empty table states, loading states, and all component UI strings to ensure complete next-intl coverage.

---

## 1. Existing Locale Message Files Architecture

- **File Locations**:
  - `messages/az.json` (368 lines, 289 leaf keys)
  - `messages/en.json` (368 lines, 289 leaf keys)
  - `messages/ru.json` (368 lines, 289 leaf keys)
- **Configuration**:
  - `src/i18n/routing.ts`: Locales `['en', 'az', 'ru']`, default `'en'`, prefix `'as-needed'`.
  - `src/i18n/request.ts`: Dynamic import of `../../messages/${locale}.json`.
  - `src/app/[locale]/layout.tsx`: `NextIntlClientProvider` supplies loaded messages to client components.

### Existing Message Namespaces Map
| Namespace | Scope / Description | Key Count |
|---|---|---|
| `HomePage` | Landing page hero, typewriter slogans, about, website | 10 |
| `Auth` | Login page labels, placeholders, errors, buttons | 9 |
| `Sidebar` | Navigation links and logout | 11 |
| `Dashboard` | Welcome header, KPI card titles, recent registrations table headers | 10 |
| `Leads` | Lead management, Kanban columns, status labels, search, errors | 14 |
| `Students` | Student base directory, search, table headers | 8 |
| `Teachers` | Teacher directory, search, table headers | 8 |
| `Schedule` | Class schedules, days of the week (`days.mon`...`days.sun`) | 12 |
| `Groups` | Group listings and table headers | 7 |
| `Parents` | Parent directory and table headers | 7 |
| `Finance` | Financial metrics, invoices table headers, payment statuses | 14 |
| `Contract` | Electronic contract & invoice modal, legal terms, signatures | 24 |
| `Tasks` | Kanban task board, column headers (`columns.TODO`...`columns.DONE`) | 6 |
| `Settings` | Profile, Notifications, Security, System tabs, theme & language choices | 21 |
| `Common` | Status badges (`active`, `pending`, `inactive`), actions (`save`, `saving`, `cancel`), loading text (`loading`) | 7 |
| `NotFound` | 404 cyber terminal error strings | 5 |
| `Programs` | Course / subject program labels (TOEFL, IELTS, IB, SAT, etc.) | 17 |
| `Profile` | Detailed student/teacher/group profiles, KPI metrics, tabs, table headers, empty states | 58 |
| `Search` | Global search modal (`Cmd+K`), category headers, placeholders, empty results | 16 |

---

## 2. NotificationsDropdown Audit (`src/components/NotificationsDropdown.tsx`)

| Line | Hardcoded String | Context | Proposed Translation Key |
|---|---|---|---|
| 83 | `Notifications` | Dropdown header title `<h3>Notifications</h3>` | `Notifications.title` |
| 86 | `Mark all read` | Button `<Check size={14} /> Mark all read` | `Notifications.markAllRead` |
| 92 | `Loading...` | Loading container `<div className={styles.empty}>Loading...</div>` | `Common.loading` or `Notifications.loading` |
| 94 | `No new notifications` | Empty state `<div className={styles.empty}>No new notifications</div>` | `Notifications.noNewNotifications` |

---

## 3. Empty Table & View States Audit Across All Pages

| File | Line | Current Hardcoded Text | Target Translation Key |
|---|---|---|---|
| `src/app/[locale]/dashboard/page.tsx` | 106 | `Məlumat yoxdur` | `Common.empty` |
| `src/app/[locale]/dashboard/students/page.tsx` | 159 | `Məlumat tapılmadı` | `Common.empty` |
| `src/app/[locale]/dashboard/groups/page.tsx` | 192 | `Məlumat tapılmadı` | `Common.empty` |
| `src/app/[locale]/dashboard/parents/page.tsx` | 170 | `Məlumat tapılmadı` | `Common.empty` |
| `src/app/[locale]/dashboard/finance/page.tsx` | 284 | `Hələ heç bir faktura yoxdur.` | `Common.empty` |
| `src/app/[locale]/dashboard/schedule/page.tsx` | 185 | `Hələ heç bir qrup və cədvəl yoxdur.` | `Common.empty` |
| `src/app/[locale]/dashboard/schedule/page.tsx` | 243 | `Cədvəl təyin edilməyib` | `Profile.noSchedule` |
| `src/app/[locale]/dashboard/teachers/page.tsx` | 136 | `{t("noTeachers")}` | Already uses `Teachers.noTeachers` |
| `src/app/[locale]/dashboard/students/[id]/page.tsx` | 416, 465, 523 | `{t("noGroups")}`, `{t("noPayments")}`, `{t("noAttendance")}` | Already uses `Profile.*` keys |
| `src/app/[locale]/dashboard/teachers/[id]/page.tsx` | 340, 382, 420 | `{t("noGroups")}`, `{t("noSchedule")}`, `{t("noStudents")}` | Already uses `Profile.*` keys |
| `src/app/[locale]/dashboard/groups/[id]/page.tsx` | 400, 448, 484 | `{t("noStudents")}`, `{t("noSchedule")}`, `{t("noAttendance")}` | Already uses `Profile.*` keys |

---

## 4. Loading States Audit (`loading.tsx` and Components)

### Component In-line Loading States
| File | Line | Current Text / Indicator | Standardized Translation Key |
|---|---|---|---|
| `src/app/[locale]/dashboard/finance/page.tsx` | 282 | `<div className={styles.loading}>Yüklənir...</div>` | `Common.loading` (`c("loading")`) |
| `src/app/[locale]/dashboard/schedule/page.tsx` | 183 | `<div className={styles.loading}>Yüklənir...</div>` | `Common.loading` (`c("loading")`) |
| `src/app/[locale]/dashboard/tasks/page.tsx` | 287 | `<div className={styles.loading}>Yüklənir...</div>` | `Common.loading` (`c("loading")`) |
| `src/components/NotificationsDropdown.tsx` | 92 | `<div className={styles.empty}>Loading...</div>` | `Common.loading` (`c("loading")`) |
| `src/app/[locale]/dashboard/teachers/page.tsx` | 134 | `{c("loading")}` | Correctly using `Common.loading` |
| `src/app/[locale]/dashboard/groups/page.tsx` | 149 | `{c("loading")}` | Correctly using `Common.loading` |
| `src/app/[locale]/dashboard/parents/page.tsx` | 133 | `{c("loading")}` | Correctly using `Common.loading` |
| `src/app/[locale]/dashboard/leads/page.tsx` | 160 | `{t("loading")}` | Uses `Leads.loading` |

### Missing `loading.tsx` Route Boundaries (Requirement 1 & Requirement 3)
Currently, no `loading.tsx` files exist in the project. Each of the following routes requires a `loading.tsx` that renders a styled skeleton or spinner with translated loading text using `useTranslations("Common")("loading")` or `getTranslations("Common")("loading")`:
1. `src/app/[locale]/dashboard/students/loading.tsx`
2. `src/app/[locale]/dashboard/teachers/loading.tsx`
3. `src/app/[locale]/dashboard/parents/loading.tsx`
4. `src/app/[locale]/dashboard/groups/loading.tsx`
5. `src/app/[locale]/dashboard/leads/loading.tsx`
6. `src/app/[locale]/dashboard/finance/loading.tsx`
7. `src/app/[locale]/dashboard/tasks/loading.tsx`
8. `src/app/[locale]/dashboard/schedule/loading.tsx`
9. `src/app/[locale]/dashboard/loading.tsx` (Dashboard root loading boundary)

---

## 5. Missing Translation Keys in Current Codebase

Codebase probing revealed key lookups in active code that do not currently exist in `az.json`, `en.json`, or `ru.json`:

| File | Code Reference | Missing Key Path | Impact |
|---|---|---|---|
| `dashboard/teachers/page.tsx:35` | `t("errors.fetch")` | `Teachers.errors.fetch` | Renders empty / key path fallback on error |
| `dashboard/teachers/page.tsx:38, 81` | `c("errors.unexpected")` | `Common.errors.unexpected` | Renders key path fallback on error |
| `dashboard/teachers/page.tsx:72` | `t("success.created")` | `Teachers.success.created` | Fallback to hardcoded string |
| `dashboard/teachers/page.tsx:77` | `t("errors.create")` | `Teachers.errors.create` | Fallback to hardcoded string |
| `dashboard/teachers/page.tsx:179` | `t("noSubject")` | `Teachers.noSubject` | Renders key path fallback when specialty is empty |
| `dashboard/teachers/page.tsx:183` | `t("activeGroups")` | `Teachers.activeGroups` | Renders key path fallback next to count |
| `components/GlobalSearch.tsx:354` | `"result"` / `"results"` | `Search.result` / `Search.results` | Hardcoded English pluralization |
| `components/ContractModal.tsx:78` | `"Qeyd edilməyib"` | `Common.notSpecified` | Hardcoded Azerbaijani fallback |
| `dashboard/tasks/page.tsx:241` | `"Təyin edilməyib"` | `Tasks.unassigned` | Hardcoded Azerbaijani assignee fallback |
| All table empty states | `c("empty")` | `Common.empty` | Missing `empty` key under `Common` |

---

## 6. Full Translation Additions Roadmap

### `messages/en.json`
```json
{
  "Common": {
    "active": "Active",
    "pending": "Pending",
    "inactive": "Inactive",
    "loading": "Loading...",
    "empty": "No data found.",
    "cancel": "Cancel",
    "save": "Save",
    "saving": "Saving...",
    "actions": "Actions",
    "notSpecified": "Not specified",
    "errors": {
      "unexpected": "An unexpected error occurred"
    }
  },
  "Notifications": {
    "title": "Notifications",
    "markAllRead": "Mark all read",
    "noNewNotifications": "No new notifications",
    "loading": "Loading..."
  },
  "Teachers": {
    "title": "Teachers & Subjects",
    "subtitle": "List of teaching staff and their specialties.",
    "newTeacher": "+ New Teacher",
    "search": "Search by teacher name or subject...",
    "noTeachers": "No teachers found",
    "noSubject": "No subject specified",
    "activeGroups": "Active groups",
    "table": {
      "name": "Teacher (Full Name)",
      "contact": "Contact",
      "subject": "Subject",
      "status": "Status",
      "joinDate": "Join Date"
    },
    "errors": {
      "fetch": "Failed to load teachers",
      "create": "Failed to add teacher"
    },
    "success": {
      "created": "Teacher added successfully!"
    }
  },
  "Search": {
    "result": "result",
    "results": "results"
  },
  "Tasks": {
    "unassigned": "Unassigned"
  }
}
```

### `messages/az.json`
```json
{
  "Common": {
    "active": "Aktiv",
    "pending": "Gözləmədə",
    "inactive": "Qeyri-aktiv",
    "loading": "Yüklənir...",
    "empty": "Heç bir məlumat tapılmadı.",
    "cancel": "Ləğv et",
    "save": "Yadda saxla",
    "saving": "Yadda saxlanılır...",
    "actions": "Əməliyyatlar",
    "notSpecified": "Qeyd edilməyib",
    "errors": {
      "unexpected": "Gözlənilməz xəta baş verdi"
    }
  },
  "Notifications": {
    "title": "Bildirişlər",
    "markAllRead": "Hamısını oxunmuş et",
    "noNewNotifications": "Yeni bildiriş yoxdur",
    "loading": "Yüklənir..."
  },
  "Teachers": {
    "title": "Müəllimlər və İxtisaslar",
    "subtitle": "Tədris heyətinin siyahısı və ixtisas sahələri.",
    "newTeacher": "+ Yeni Müəllim",
    "search": "Müəllim adı və ya ixtisasla axtarış...",
    "noTeachers": "Müəllim tapılmadı",
    "noSubject": "İxtisas qeyd edilməyib",
    "activeGroups": "Aktiv qrup",
    "table": {
      "name": "Müəllim (Ad Soyad)",
      "contact": "Əlaqə",
      "subject": "İxtisas / Fənn",
      "status": "Status",
      "joinDate": "İşə Başlama"
    },
    "errors": {
      "fetch": "Müəllimləri yükləmək mümkün olmadı",
      "create": "Müəllim əlavə edilərkən xəta baş verdi"
    },
    "success": {
      "created": "Müəllim uğurla əlavə edildi!"
    }
  },
  "Search": {
    "result": "nəticə",
    "results": "nəticə"
  },
  "Tasks": {
    "unassigned": "Təyin edilməyib"
  }
}
```

### `messages/ru.json`
```json
{
  "Common": {
    "active": "Активный",
    "pending": "В ожидании",
    "inactive": "Неактивный",
    "loading": "Загрузка...",
    "empty": "Данные не найдены.",
    "cancel": "Отмена",
    "save": "Сохранить",
    "saving": "Сохранение...",
    "actions": "Действия",
    "notSpecified": "Не указано",
    "errors": {
      "unexpected": "Произошла непредвиденная ошибка"
    }
  },
  "Notifications": {
    "title": "Уведомления",
    "markAllRead": "Отметить все прочитанными",
    "noNewNotifications": "Нет новых уведомлений",
    "loading": "Загрузка..."
  },
  "Teachers": {
    "title": "Преподаватели и Предметы",
    "subtitle": "Список преподавательского состава и их специальности.",
    "newTeacher": "+ Новый Преподаватель",
    "search": "Поиск по имени преподавателя или предмету...",
    "noTeachers": "Преподаватели не найдены",
    "noSubject": "Предмет не указан",
    "activeGroups": "Активные группы",
    "table": {
      "name": "Преподаватель (ФИО)",
      "contact": "Контакт",
      "subject": "Предмет",
      "status": "Статус",
      "joinDate": "Дата приема"
    },
    "errors": {
      "fetch": "Не удалось загрузить преподавателей",
      "create": "Не удалось добавить преподавателя"
    },
    "success": {
      "created": "Преподаватель успешно добавлен!"
    }
  },
  "Search": {
    "result": "результат",
    "results": "результатов"
  },
  "Tasks": {
    "unassigned": "Не назначено"
  }
}
```

---

## 7. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | i18n Core | Locale Request Handler | Dynamic loader for `az.json`, `en.json`, `ru.json` | `requestLocale` string | `{ locale, messages }` | Falls back to defaultLocale (`en`) | `src/i18n/request.ts` |
| 2 | i18n Core | Navigation Routing | Locale routing definitions with `as-needed` prefix | Locale prefix config | `Link`, `redirect`, `usePathname`, `useRouter` | Next.js navigation error if invalid locale | `src/i18n/routing.ts` |
| 3 | Notifications | Notifications Dropdown UI | Notification bell trigger, count badge, unread list, mark as read | Notification array from `/api/notifications` | Bell icon badge and dropdown list | Displays empty / loading text | `src/components/NotificationsDropdown.tsx` |
| 4 | Search | Global Search (`Cmd+K`) | Search bar with debounced API queries across students, teachers, groups | Query string `q` | Categorized dropdown results | Displays noResults empty state | `src/components/GlobalSearch.tsx` |
| 5 | Contracts | Contract / Invoice Modal & Print | Interactive digital signature pad & printable electronic invoice | Invoice object, canvas drawing | Rendered printable PDF / canvas PNG | Shows `notSigned` placeholder | `src/components/ContractModal.tsx` |
| 6 | Dashboard | Metric Overview & Recent Registrations | KPI cards with financial/student metrics, recent registrations table | `/api/dashboard/stats`, `/api/dashboard/recent` | KPI grid & mini student list | Shows empty table state `Common.empty` | `src/app/[locale]/dashboard/page.tsx` |
| 7 | Students | Student Directory & Management | Searchable, filterable student roster with creation modal | Student list from `/api/students` | Student table rows with avatar and FIN | Shows empty state `Common.empty` | `src/app/[locale]/dashboard/students/page.tsx` |
| 8 | Teachers | Teacher Directory & Specialties | Teacher cards with specialty, active groups, creation modal | Teacher list from `/api/teachers` | Grid cards of teachers | Shows empty state `Teachers.noTeachers` | `src/app/[locale]/dashboard/teachers/page.tsx` |
| 9 | Groups | Group Programs & Room Allocations | Group table with program, assigned teacher, and room | Group list from `/api/groups` | Group table rows with program link | Shows empty state `Common.empty` | `src/app/[locale]/dashboard/groups/page.tsx` |
| 10 | Parents | Parent Directory & FIN Tracking | Parent table with phone, FIN code, ID card number | Parent list from `/api/parents` | Parent table rows | Shows empty state `Common.empty` | `src/app/[locale]/dashboard/parents/page.tsx` |
| 11 | Finance | Invoices & Payment Ledger | Invoices table, debt calculator, process payment modal, PDF invoice generator | Invoice list from `/api/finance` | Financial table, overdue highlights | Shows empty state `Common.empty` | `src/app/[locale]/dashboard/finance/page.tsx` |
| 12 | Schedule | Class Timetable & Room Schedules | Weekly class schedule cards grouped by class and day | Schedule list from `/api/schedules` | Group schedule cards with day/time badges | Shows empty state `Common.empty` | `src/app/[locale]/dashboard/schedule/page.tsx` |
| 13 | Tasks | Kanban Workflow Board | Drag-and-drop Kanban board (TODO, IN_PROGRESS, REVIEW, DONE) | Task list from `/api/tasks` | Kanban column cards with priority badges | Shows column count 0 | `src/app/[locale]/dashboard/tasks/page.tsx` |
| 14 | Settings | User Preferences & System Controls | Tabbed settings (Profile, Notifications, Security, Theme/Language) | User profile & config | Profile / password updates | Toast notifications | `src/app/[locale]/dashboard/settings/page.tsx` |
| 15 | Profile Details | Detail View (Students/Teachers/Groups) | Multi-tab detailed dossier with KPIs, attendance, payments, schedules | Route parameter `id` | Detail profile header & tabbed panels | Renders `Profile.notFound` | `dashboard/[section]/[id]/page.tsx` |

---

## 8. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Locale Routing | Invalid locale `/fr/dashboard` | `src/app/[locale]/layout.tsx` calls `notFound()` and redirects to 404. |
| 2 | Notifications Dropdown | Zero notifications received from API | Currently renders hardcoded string `No new notifications`. |
| 3 | Notifications Loading | Slow API network response | Currently renders hardcoded string `Loading...`. |
| 4 | Search Results Count | Exactly 1 result returned | Currently evaluates `1 result` vs `results` via hardcoded English strings. |
| 5 | Table Empty Renders | Filter returning 0 results | Groups/Parents/Students/Finance/Schedule pages render hardcoded Azerbaijani strings instead of `c("empty")`. |
| 6 | Unassigned Specialty | Teacher record without specialty | Currently evaluates `t("noSubject")` which was missing from message files. |
