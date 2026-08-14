# Technical Analysis: Core Management Modules (Tasks, Finance, Schedule)

## Executive Summary
This document provides a thorough audit of Requirement 2 (Core Management Modules: Tasks Kanban CRUD, Finance Invoices & Payment Processing, and Group Schedules). It details the current state of UI components, API routes, database schemas, identifies all functional and structural gaps, and outlines concrete technical recommendations for implementers.

---

## 1. Tasks Module (Kanban Board CRUD)

### 1.1 Current Architecture & Implementation
- **Frontend Page**: `src/app/[locale]/dashboard/tasks/page.tsx`
  - Columns: `TODO` ("Ediləcəklər"), `IN_PROGRESS` ("İcra Edilir"), `REVIEW` ("Yoxlamada"), `DONE` ("Tamamlandı").
  - Drag-and-drop: Implemented using native HTML5 drag-and-drop (`onDragStart`, `onDrop`, `onDragOver`).
  - Queries `GET /api/tasks` on mount.
- **Backend API Routes**:
  - `GET /api/tasks` (`src/app/api/tasks/route.ts`): Queries `SELECT * FROM kanban_tasks ORDER BY order_index ASC, created_at DESC`.
  - `POST /api/tasks` (`src/app/api/tasks/route.ts`): Inserts into `kanban_tasks` (`title`, `description`, `status`, `priority`, `due_date`, `assignee`, `order_index = 0`).
  - `PUT /api/tasks/[id]` (`src/app/api/tasks/[id]/route.ts`): Updates `kanban_tasks` setting `title`, `description`, `status`, `priority`, `due_date`, `assignee`.
  - `DELETE /api/tasks/[id]` (`src/app/api/tasks/[id]/route.ts`): Deletes `FROM kanban_tasks WHERE id = ${id}`.
- **Database Schema**:
  - Table: `kanban_tasks`
  - Columns: `id` (UUID PK), `title` (text, NOT NULL), `description` (text, nullable), `status` (text, 'TODO'|'IN_PROGRESS'|'REVIEW'|'DONE'), `priority` (text, 'LOW'|'MEDIUM'|'HIGH'), `due_date` (timestamptz/date, nullable), `assignee` (text, nullable), `order_index` (int, default 0), `created_at` (timestamptz), `updated_at` (timestamptz).

### 1.2 Identified Bugs & Gaps
1. **Missing Task Creation UI**:
   - In `tasks/page.tsx:83`: Clicking `+ New Task` (`addBtn`) only triggers a placeholder `toast.success("Yeni tapşırıq yaradılması tezliklə!")`.
   - Missing Modal and Form with inputs: `title` (text, required), `description` (textarea), `status` (select: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`), `priority` (select: `LOW`, `MEDIUM`, `HIGH`), `due_date` (date picker), `assignee` (text or user select).
2. **Missing Task Edit & Delete UI**:
   - In `tasks/page.tsx:122`: The card header includes a `<button className={styles.moreBtn}><MoreVertical size={16} /></button>` which has **no click handler**, no dropdown menu, and no Edit or Delete actions.
   - Users cannot edit existing task contents or delete tasks from the UI.
3. **Severe API Bug in PUT `/api/tasks/[id]`**:
   - In `tasks/page.tsx:54-58`: `handleDrop` calls `fetch('/api/tasks/' + taskId, { method: "PUT", body: JSON.stringify({ status: newStatus }) })`.
   - In `tasks/[id]/route.ts:11-16`: The SQL query does a full overwrite:
     ```sql
     UPDATE kanban_tasks
     SET title = ${body.title}, description = ${body.description || null}, status = ${body.status}, priority = ${body.priority}, due_date = ${body.due_date || null}, assignee = ${body.assignee || null}
     WHERE id = ${id}
     ```
   - When dropping a card, `body.title`, `body.priority`, etc., are `undefined`, causing PostgreSQL error or destroying task metadata (`title` becomes null/error).
   - **Fix**: Implement `PATCH` or use dynamic `COALESCE`:
     ```sql
     UPDATE kanban_tasks
     SET 
       status = COALESCE(${body.status}, status),
       title = COALESCE(${body.title}, title),
       description = CASE WHEN ${body.description !== undefined} THEN ${body.description} ELSE description END,
       priority = COALESCE(${body.priority}, priority),
       due_date = CASE WHEN ${body.due_date !== undefined} THEN ${body.due_date} ELSE due_date END,
       assignee = CASE WHEN ${body.assignee !== undefined} THEN ${body.assignee} ELSE assignee END
     WHERE id = ${id}
     RETURNING *
     ```
4. **Field Property Name Mismatches**:
   - `tasks/page.tsx:132`: Checks `task.deadline`, but the database column and API return `due_date`. Due dates never render on cards!
   - `tasks/page.tsx:130`: Accesses `task.assignee?.name || "Təyin edilməyib"`. But in `kanban_tasks`, `assignee` is stored as a string name. Accessing `.name` on a string returns `undefined`, always falling back to `"Təyin edilməyib"`.

---

## 2. Finance Module (Invoices & Payment Processing)

### 2.1 Current Architecture & Implementation
- **Frontend Page**: `src/app/[locale]/dashboard/finance/page.tsx`
  - Stats: Monthly Income, Total Debt (Pending).
  - Search input: For filtering invoices.
  - Table columns: Invoice #, Student, Amount, Paid, Debt, Status, Deadline, Contract button.
  - Contract Modal: `src/components/ContractModal.tsx` handles digital signature & printable invoice/contract.
- **Backend API Route**:
  - `GET /api/finance` (`src/app/api/finance/route.ts`):
    ```sql
    SELECT p.*, pr.first_name, pr.last_name 
    FROM payments p
    LEFT JOIN students s ON p.student_id = s.id
    LEFT JOIN user_profiles pr ON s.profile_id = pr.id
    ORDER BY p.created_at DESC
    ```
    Returns: `[{ id, studentName, amount, status, date }]`.

### 2.2 Identified Bugs & Gaps
1. **Critical Data Structure Mismatch Causing `NaN` and Crashes**:
   - `finance/page.tsx` accesses properties: `inv.paidAmount`, `inv.student.user.name` (or `inv.student.name`), `inv.dueDate`, `inv.status`.
   - But `GET /api/finance` returns: `{ id, studentName, amount, status, date }`.
   - **Consequences**:
     - `calculateTotalDebt()`: `invoices.filter(...).reduce((t, i) => t + (i.amount - i.paidAmount), 0)` computes `i.amount - undefined` -> **`NaN ₼`**.
     - Monthly Income stat: `invoices.reduce((t, i) => t + i.paidAmount, 0)` -> **`NaN ₼`**.
     - Student Name: `inv.student.user?.name` -> `undefined` (renders blank).
     - Deadline: `new Date(inv.dueDate)` -> **`Invalid Date`**.
     - Status check: `finance/page.tsx` checks `inv.status !== "PAID"`, while database / stats route might store `"Paid"` or `"Pending"`.
2. **Missing "New Invoice" Creation UI & API**:
   - In `finance/page.tsx:51`: `<button className={styles.addBtn}><CreditCard size={18} /> {t("newInvoice")}</button>` has **no `onClick` handler**.
   - Missing Invoice Modal with fields:
     - Student selector (fetch active students list via `/api/students`).
     - Total Amount (numeric input, e.g. `250.00`).
     - Paid Amount (initial paid amount, default `0`).
     - Due Date (deadline date picker).
     - Status (`PAID`, `PENDING`, `PARTIAL`).
     - Notes/Service Name (optional text).
   - Missing backend endpoint: `POST /api/finance` (or `POST /api/invoices`).
3. **Missing "Process Payment" UI & API**:
   - Requirement 2 mandates: "Finance: Create new invoices and process payments."
   - No UI action exists on invoice rows to record/process a payment against an invoice (e.g. pay remaining debt, update `paid_amount`, and update status to `PAID`).
   - Missing endpoint: `POST /api/payments` or `PATCH /api/finance/[id]` to record a payment transaction and update the invoice status.
4. **Search Filter Not Connected**:
   - In `finance/page.tsx:83`: `<input type="text" placeholder={t("search")} />` has no `value` or `onChange` state, so invoice search does not work.
5. **Database Schema Harmonization**:
   - Tables: `payments` (used in CRM as payment/invoice ledger).
   - Columns: `id` (UUID PK), `student_id` (UUID FK -> students.id), `amount` (numeric), `paid_amount` (numeric default 0), `status` (text: 'PAID'|'PENDING'|'PARTIAL'), `due_date` (timestamptz), `payment_method` (text), `created_at` (timestamptz).
   - `GET /api/finance` should return:
     ```json
     {
       "id": "...",
       "amount": 300,
       "paidAmount": 300,
       "status": "PAID",
       "dueDate": "2026-09-01",
       "createdAt": "2026-08-14",
       "student": {
         "id": "...",
         "name": "Ali Aliyev",
         "phone": "+994501234567"
       }
     }
     ```

---

## 3. Schedule Module (Group Schedules Management)

### 3.1 Current Architecture & Implementation
- **Frontend Page**: `src/app/[locale]/dashboard/schedule/page.tsx`
  - Renders a grid of group cards displaying group title, language, program name, student count, and schedule items (`dayOfWeek`, `startTime`, `endTime`, `room`).
  - Helper `getDayName(day)` maps 1-7 to localized weekday names (Monday - Sunday).
- **Backend API Route**:
  - `GET /api/schedules` (`src/app/api/schedules/route.ts`):
    - Queries: `SELECT g.id, g.name, g.room, p.name as program_name FROM groups g LEFT JOIN programs p ON g.program_id = p.id`.
    - Returns groups with **hardcoded empty schedules**: `schedules: []`, `maxCapacity: 15`, `_count: { students: 0 }`.
- **Database Schema**:
  - Groups table: `groups` (`id`, `name`, `program_id`, `teacher_id`, `room`, `created_at`).
  - Schedules table: `schedules` or `group_schedules` (`id`, `group_id`, `day_of_week`, `start_time`, `end_time`, `room`, `teacher_id`, `created_at`).

### 3.2 Identified Bugs & Gaps
1. **Hardcoded Empty Schedules in Backend**:
   - `src/app/api/schedules/route.ts:20` returns `schedules: []`.
   - It does not query schedule entries from database or join `group_schedules`/`schedules`.
2. **Missing "Add Schedule" Form & Modal**:
   - In `schedule/page.tsx:50-52`: The button says `+ Yeni Qrup` and opens `showModal` displaying:
     `<h2>Yeni Qrup (Tezliklə)</h2><p>Proqramların (Program) və Cədvəllərin formalaşdırılması üzərində işlənir.</p>`.
   - Requirement 2 mandates: "Schedule: Add new schedules to groups."
   - Missing Schedule Modal with fields:
     - Group selector (dropdown of groups from `/api/groups`).
     - Day of Week (dropdown: Monday to Sunday / 1 to 7).
     - Start Time (time input, e.g. "09:00", "14:30").
     - End Time (time input, e.g. "10:30", "16:00").
     - Room (text or dropdown, e.g. "Room 204", "Lab A").
     - Teacher (optional dropdown of teachers).
3. **Missing API Endpoints**:
   - `POST /api/schedules`: Creates a schedule entry linked to a group:
     ```sql
     INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, room, teacher_id)
     VALUES (${group_id}, ${day_of_week}, ${start_time}, ${end_time}, ${room || null}, ${teacher_id || null})
     RETURNING *
     ```
   - `DELETE /api/schedules/[id]`: Removes a schedule item from a group.
   - `GET /api/schedules`: Should aggregate/join schedules per group:
     ```sql
     SELECT 
       g.id, g.name, g.room as group_room, p.name as program_name,
       COALESCE(
         json_agg(
           json_build_object(
             'id', s.id,
             'dayOfWeek', s.day_of_week,
             'startTime', s.start_time,
             'endTime', s.end_time,
             'room', COALESCE(s.room, g.room)
           ) ORDER BY s.day_of_week, s.start_time
         ) FILTER (WHERE s.id IS NOT NULL),
         '[]'
       ) as schedules
     FROM groups g
     LEFT JOIN programs p ON g.program_id = p.id
     LEFT JOIN group_schedules s ON g.id = s.group_id
     GROUP BY g.id, g.name, g.room, p.name
     ORDER BY g.name ASC
     ```

---

## 4. Internationalization (i18n) & Translations Matrix
Check translation files `messages/en.json`, `messages/az.json`, `messages/ru.json` for missing modal keys:

| Namespace | Key / Action | AZ | EN | RU |
|---|---|---|---|---|
| `Tasks` | `createModal.title` | "Yeni Tapşırıq Yarat" | "Create New Task" | "Создать новую задачу" |
| `Tasks` | `createModal.taskTitle` | "Tapşırıq Başlığı" | "Task Title" | "Название задачи" |
| `Tasks` | `createModal.description` | "Təsvir" | "Description" | "Описание" |
| `Tasks` | `createModal.priority` | "Prioritet" | "Priority" | "Приоритет" |
| `Tasks` | `createModal.assignee` | "Məsul Şəxs" | "Assignee" | "Исполнитель" |
| `Tasks` | `createModal.dueDate` | "İcra Müddəti" | "Due Date" | "Срок выполнения" |
| `Finance` | `createModal.title` | "Yeni Faktura Yarat" | "Create New Invoice" | "Создать новый счет" |
| `Finance` | `createModal.student` | "Tələbə Seçin" | "Select Student" | "Выберите студента" |
| `Finance` | `createModal.amount` | "Ümumi Məbləğ (AZN)" | "Total Amount (AZN)" | "Общая сумма (AZN)" |
| `Finance` | `createModal.paidAmount` | "Ödənilən Məbləğ (AZN)" | "Paid Amount (AZN)" | "Оплаченная сумма (AZN)" |
| `Finance` | `processPayment.title` | "Ödəniş Qəbul Et" | "Process Payment" | "Принять платеж" |
| `Schedule`| `addModal.title` | "Qrupa Dərs Cədvəli Əlavə Et" | "Add Schedule to Group" | "Добавить расписание группе" |
| `Schedule`| `addModal.group` | "Qrup Seçin" | "Select Group" | "Выберите группу" |
| `Schedule`| `addModal.day` | "Həftənin Günü" | "Day of Week" | "День недели" |
| `Schedule`| `addModal.time` | "Dərs Saatı" | "Class Time" | "Время урока" |
| `Schedule`| `addModal.room` | "Otaq" | "Room" | "Комната" |

---

## 5. Summary Action Items for Implementers

1. **Tasks Module**:
   - Implement `CreateTaskModal` and `EditTaskModal` in `src/app/[locale]/dashboard/tasks/page.tsx`.
   - Connect card action menu (`MoreVertical`) with Edit and Delete handlers.
   - Fix `PUT /api/tasks/[id]` and support partial updates (`PATCH`).
   - Fix card property names (`task.due_date` vs `task.deadline`, `task.assignee`).
2. **Finance Module**:
   - Harmonize `GET /api/finance` response structure with `FinancePage` expectations.
   - Implement `CreateInvoiceModal` and `ProcessPaymentModal`.
   - Implement `POST /api/finance` (invoice creation) and payment update endpoint (`PATCH /api/finance/[id]` or `POST /api/payments`).
   - Connect client-side search filtering.
3. **Schedule Module**:
   - Implement `AddScheduleModal` in `src/app/[locale]/dashboard/schedule/page.tsx`.
   - Implement `POST /api/schedules` and `DELETE /api/schedules/[id]`.
   - Update `GET /api/schedules` to join and aggregate schedules from `group_schedules` / `schedules` table.
4. **i18n**:
   - Add all missing translation strings to `messages/az.json`, `messages/en.json`, and `messages/ru.json`.
