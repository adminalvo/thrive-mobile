# Handoff Report: Core Management Modules Survey (Tasks, Finance, Schedule)

## 1. Observation

### 1.1 Tasks Module
- **File**: `src/app/[locale]/dashboard/tasks/page.tsx:83`
  - Direct Observation: `<button className={styles.addBtn} onClick={() => toast.success("Yeni tapşırıq yaradılması tezliklə!")}>`
  - There is no modal or form implemented to create a task.
- **File**: `src/app/[locale]/dashboard/tasks/page.tsx:122`
  - Direct Observation: `<button className={styles.moreBtn}><MoreVertical size={16} /></button>`
  - The more options button has no `onClick` handler, no dropdown menu, and no Edit or Delete task functionality.
- **File**: `src/app/[locale]/dashboard/tasks/page.tsx:130-137`
  - Direct Observation:
    ```tsx
    <span>{task.assignee?.name || "Təyin edilməyib"}</span>
    {task.deadline && (<span>{new Date(task.deadline).toLocaleDateString()}</span>)}
    ```
    In `kanban_tasks` table, the column name is `due_date`, not `deadline`. `assignee` is stored as a string or null, so `task.assignee?.name` is `undefined`.
- **File**: `src/app/api/tasks/[id]/route.ts:11-16`
  - Direct Observation:
    ```typescript
    const task = await sql`
      UPDATE kanban_tasks
      SET title = ${body.title}, description = ${body.description || null}, status = ${body.status}, priority = ${body.priority}, due_date = ${body.due_date || null}, assignee = ${body.assignee || null}
      WHERE id = ${id}
      RETURNING *
    `;
    ```
    Frontend `handleDrop` sends `{ status: newStatus }` without `title` or `priority`, which causes `body.title` to be `undefined` and can fail or corrupt data on status change.

### 1.2 Finance Module
- **File**: `src/app/api/finance/route.ts:15-21`
  - Direct Observation:
    ```typescript
    const formatted = payments.map(p => ({
      id: p.id,
      studentName: p.first_name ? `${p.first_name} ${p.last_name}` : "N/A",
      amount: p.amount,
      status: p.status,
      date: p.created_at
    }));
    ```
- **File**: `src/app/[locale]/dashboard/finance/page.tsx:38-42, 64, 108, 121, 133`
  - Direct Observation:
    ```tsx
    // calculateTotalDebt:
    invoices.filter(i => i.status !== "PAID").reduce((total, i) => total + (i.amount - i.paidAmount), 0)
    // Monthly income:
    invoices.reduce((t, i) => t + i.paidAmount, 0)
    // Student name:
    {inv.student.user?.name}
    // Due date:
    {new Date(inv.dueDate).toLocaleDateString()}
    ```
    Because `GET /api/finance` returns `{ id, studentName, amount, status, date }` instead of `{ id, student, amount, paidAmount, status, dueDate }`, the stats evaluate to `NaN ₼`, student names are blank, and dates evaluate to `Invalid Date`.
- **File**: `src/app/[locale]/dashboard/finance/page.tsx:51-53`
  - Direct Observation: `<button className={styles.addBtn}><CreditCard size={18} /> {t("newInvoice")}</button>` has no `onClick` handler. There is no invoice creation modal or payment processing modal.
- **File**: `src/app/api/finance/route.ts`
  - Direct Observation: Only `GET` is exported. `POST`, `PUT`, `PATCH`, and `DELETE` endpoints do not exist.

### 1.3 Schedule Module
- **File**: `src/app/api/schedules/route.ts:13-23`
  - Direct Observation:
    ```typescript
    const formatted = groups.map(g => ({
      id: g.id,
      name: g.name,
      language: "AZ",
      maxCapacity: 15,
      _count: { students: 0 },
      program: { name: g.program_name || "Proqram seçilməyib" },
      schedules: []
    }));
    ```
    The endpoint hardcodes `schedules: []` and does not query any schedule table.
- **File**: `src/app/[locale]/dashboard/schedule/page.tsx:50-52, 103-113`
  - Direct Observation:
    ```tsx
    <button className={styles.addBtn} onClick={() => setShowModal(true)}>
      <Plus size={18} /> Yeni Qrup
    </button>
    ...
    <h2>Yeni Qrup (Tezliklə)</h2>
    <p>Proqramların (Program) və Cədvəllərin formalaşdırılması üzərində işlənir.</p>
    ```
    The modal is a static placeholder without any form inputs to add weekly schedules or assign schedules to groups.

---

## 2. Logic Chain

1. **Tasks Failure Chain**:
   - Observation 1.1 shows clicking the "+ New Task" button only triggers a toast, and card action menu has no handlers.
   - Observation 1.1 shows `PUT /api/tasks/[id]` requires all fields (`title`, `priority`), but `handleDrop` only sends `{ status }`.
   - Therefore, task creation is impossible from the UI, task editing/deletion is impossible from the UI, and drag-and-drop status update fails or destroys required fields due to missing `COALESCE` or partial update support.

2. **Finance Failure Chain**:
   - Observation 1.2 shows the API returns properties `studentName`, `amount`, `status`, `date`.
   - Observation 1.2 shows the UI attempts arithmetic and access on `i.paidAmount`, `i.student.user.name`, and `i.dueDate`.
   - Arithmetic on `undefined` produces `NaN`, causing stats cards on the finance dashboard to display `NaN ₼`.
   - Observation 1.2 shows the "+ New Invoice" button has no click handler and the API lacks `POST` / payment processing endpoints.
   - Therefore, the Finance module currently renders broken stats and has zero create or payment processing capability.

3. **Schedule Failure Chain**:
   - Observation 1.3 shows `GET /api/schedules` returns an empty array for `schedules: []`.
   - Observation 1.3 shows the "+ Yeni Qrup" button opens a static placeholder modal saying "Tezliklə".
   - There is no API route (`POST /api/schedules`) to persist schedule entries (`day_of_week`, `start_time`, `end_time`, `room`, `group_id`).
   - Therefore, groups can never display schedules, and users have no UI or API to add schedules to groups.

---

## 3. Caveats
- Database connection relies on Supabase PostgreSQL via `src/lib/db.ts` (`postgres.js`).
- If `group_schedules` or `schedules` table does not already have existing rows in PostgreSQL, the table definition should be created or ensured (`CREATE TABLE IF NOT EXISTS group_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), group_id UUID REFERENCES groups(id) ON DELETE CASCADE, day_of_week INT, start_time TEXT, end_time TEXT, room TEXT, teacher_id UUID, created_at TIMESTAMPTZ DEFAULT NOW())`).
- Status casing convention: Ensure consistent upper-case status values (`'PAID'`, `'PENDING'`, `'PARTIAL'` vs `'TODO'`, `'IN_PROGRESS'`, `'REVIEW'`, `'DONE'`).

---

## 4. Conclusion
Requirement 2 requires full-stack implementation across three modules:
1. **Tasks**: Implement Task creation modal, edit/delete modal, fix `task.due_date` & `task.assignee` rendering, and update `PUT/PATCH /api/tasks/[id]` with partial field support (`COALESCE`).
2. **Finance**: Align `GET /api/finance` response payload (`paidAmount`, `student`, `dueDate`), implement `CreateInvoiceModal`, implement `ProcessPaymentModal`, and add `POST /api/finance` & `PATCH /api/finance/[id]` (or `POST /api/payments`).
3. **Schedule**: Replace the hardcoded `schedules: []` in `GET /api/schedules` with a database query joining `group_schedules`, implement `AddScheduleModal` on the Schedule page, and implement `POST /api/schedules` & `DELETE /api/schedules/[id]`.

---

## 5. Verification Method
1. **TypeScript & Build Check**:
   - Run `npx tsc --noEmit`
   - Run `npm run build`
2. **API Verification**:
   - `POST /api/tasks` with `{ title: "Test Task", status: "TODO", priority: "HIGH" }` -> verify 200 OK and valid JSON returned.
   - `PUT /api/tasks/<id>` with `{ status: "DONE" }` -> verify status is updated without clearing title or priority.
   - `GET /api/finance` -> verify response includes `paidAmount`, `dueDate`, and `student` object, and finance page stats do not show `NaN`.
   - `POST /api/finance` (or `/api/invoices`) -> verify invoice creation.
   - `GET /api/schedules` & `POST /api/schedules` with `{ group_id, day_of_week: 1, start_time: "10:00", end_time: "11:30", room: "101" }` -> verify schedule is saved and returned under the group's `schedules` array.
