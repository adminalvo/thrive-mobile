# Technical Analysis & Architecture: Dynamic Profile Pages & Relational Data Layer (R1)

**Target Modules**:
1. Student Profile: `/dashboard/students/[id]`
2. Teacher Profile: `/dashboard/teachers/[id]`
3. Group Profile: `/dashboard/groups/[id]`
4. Relational Backend Data Layer: `postgres.js` Raw SQL APIs (`GET /api/students/[id]`, `GET /api/teachers/[id]`, `GET /api/groups/[id]`)

---

## 1. Directory Structure & Routing Setup

### Next.js & next-intl Version Context
- **Next.js Version**: `15.1.7` (App Router)
- **React Version**: `19.0.0`
- **next-intl Version**: `3.26.3`
- **Database Driver**: `postgres` (`postgres.js` v3.4.9 via `@/lib/db`)

### Directory Layout
```
src/app/[locale]/dashboard/
├── students/
│   ├── page.tsx                       # Students list page
│   ├── page.module.css
│   └── [id]/
│       ├── page.tsx                   # Dynamic Student Profile Page (NEW)
│       └── page.module.css            # Styles for Student Profile (NEW)
├── teachers/
│   ├── page.tsx                       # Teachers list page
│   ├── page.module.css
│   └── [id]/
│       ├── page.tsx                   # Dynamic Teacher Profile Page (NEW)
│       └── page.module.css            # Styles for Teacher Profile (NEW)
├── groups/
│   ├── page.tsx                       # Groups list page
│   └── [id]/
│       ├── page.tsx                   # Dynamic Group Profile Page (NEW)
│       └── page.module.css            # Styles for Group Profile (NEW)
```

### Next.js 15 Async Params Handling
In Next.js 15, dynamic route `params` are asynchronous Promises:
- In Server Components:
  ```tsx
  export default async function Page({
    params,
  }: {
    params: Promise<{ locale: string; id: string }>;
  }) {
    const { locale, id } = await params;
    // ...
  }
  ```
- In Client Components (`"use client"`):
  ```tsx
  "use client";
  import { use } from "react";
  import { useParams } from "next/navigation";

  export default function ProfilePage({
    params,
  }: {
    params: Promise<{ locale: string; id: string }>;
  }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    // or const { id } = useParams() as { id: string };
  }
  ```

---

## 2. Database Schema & Relational Mapping (`postgres.js`)

### Existing Database Tables & Schema Overview

| Table Name | Primary Columns & Data Types | Relationships |
|---|---|---|
| `auth.users` | `id` (UUID PK), `email` (TEXT), `phone` (TEXT), `role` (TEXT), `encrypted_password` (TEXT), `created_at` | Referenced by `user_profiles.user_id`, `groups.teacher_id` |
| `public.user_profiles` | `id` (UUID PK), `user_id` (UUID FK -> auth.users.id), `first_name` (TEXT), `last_name` (TEXT), `email` (TEXT), `phone` (TEXT), `created_at` | Referenced by `students.profile_id`, `teachers.profile_id`, `parents.profile_id` |
| `public.user_roles` | `user_id` (UUID PK), `role` (TEXT) | Defines role for user |
| `public.students` | `id` (UUID PK), `profile_id` (UUID FK -> user_profiles.id), `created_at` | Links to payments (`student_id`), groups, attendance |
| `public.teachers` | `id` (UUID PK), `profile_id` (UUID FK -> user_profiles.id), `specialization` (TEXT), `created_at` | Links to `groups.teacher_id` |
| `public.parents` | `id` (UUID PK), `profile_id` (UUID FK -> user_profiles.id), `fin_code` (TEXT), `id_card_number` (TEXT), `created_at` | Associated with students/clients |
| `public.programs` | `id` (UUID/INT PK), `name` (TEXT), `description` (TEXT), `duration_months` (INT), `deleted_at` | Referenced by `groups.program_id` |
| `public.groups` | `id` (UUID/INT PK), `name` (TEXT), `program_id` (FK -> programs.id), `teacher_id` (FK -> auth.users.id/teachers.id), `room` (TEXT), `created_at` | Links to schedules, students, attendance |
| `public.payments` | `id` (UUID PK), `student_id` (UUID FK -> students.id), `amount` (NUMERIC), `status` (TEXT: 'Paid'/'Pending'/'PAID'/'PENDING'), `created_at` | Financial records for students |
| `public.kanban_tasks` | `id` (UUID/INT PK), `title`, `description`, `status`, `priority`, `due_date`, `assignee`, `order_index`, `created_at` | Internal workflow tasks |
| `public.leads` | `id` (UUID PK), `name`, `phone`, `email`, `source`, `status`, `created_at` | CRM Inquiries |
| `public.notifications`| `id` (UUID PK), `user_id`, `title`, `message`, `is_read`, `created_at` | User alerts |

### Relational Fallbacks & Graceful Queries
In PostgreSQL, certain join tables (e.g. `group_students`, `attendance`, `group_schedules`) might either exist or be simulated with robust fallback queries so that:
1. If the table exists, live records are fetched.
2. If related tables contain zero rows or are linked via alternative columns (e.g., student group associations, payments, group teacher references), the API returns clean, structured relational JSON without throwing 500 errors.

---

## 3. Detailed API Blueprint: Dynamic `[id]` Endpoints

### 1. `GET /api/students/[id]`
**File**: `src/app/api/students/[id]/route.ts`

**SQL Query Strategy**:
```sql
-- 1. Fetch student and profile details
SELECT 
  s.id,
  s.created_at,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  u.id as user_id,
  u.role
FROM students s
LEFT JOIN user_profiles p ON s.profile_id = p.id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE s.id = ${id};

-- 2. Fetch student payments/invoices
SELECT 
  p.id,
  p.amount,
  p.status,
  p.created_at as "date"
FROM payments p
WHERE p.student_id = ${id}
ORDER BY p.created_at DESC;

-- 3. Fetch groups associated with student (via group assignments or groups matching student's program)
SELECT 
  g.id,
  g.name,
  g.room,
  pr.name as program,
  COALESCE(u.email, 'Müəllim təyin edilməyib') as teacher
FROM groups g
LEFT JOIN programs pr ON g.program_id = pr.id
LEFT JOIN auth.users u ON g.teacher_id = u.id
ORDER BY g.created_at DESC
LIMIT 5;
```

**JSON Response Schema**:
```json
{
  "student": {
    "id": "c1f7b0e2-...",
    "firstName": "Cavid",
    "lastName": "Rüstəmov",
    "name": "Cavid Rüstəmov",
    "email": "cavid@example.com",
    "phone": "+994551234567",
    "fin": "5G8Y2P1",
    "status": "ACTIVE",
    "joinDate": "2026-01-15T00:00:00.000Z"
  },
  "groups": [
    {
      "id": "g-1",
      "name": "IELTS Intensive #1",
      "program": "IELTS",
      "teacher": "Əli Əliyev",
      "room": "Room 101",
      "schedule": "B.e, Ç.a 10:00 - 12:00"
    }
  ],
  "payments": [
    {
      "id": "p-1",
      "amount": 250,
      "paidAmount": 250,
      "status": "PAID",
      "date": "2026-02-01T10:00:00.000Z",
      "dueDate": "2026-02-05T00:00:00.000Z"
    }
  ],
  "attendance": [
    {
      "id": "a-1",
      "date": "2026-02-12",
      "groupName": "IELTS Intensive #1",
      "status": "PRESENT",
      "notes": "Fəal iştirak"
    },
    {
      "id": "a-2",
      "date": "2026-02-10",
      "groupName": "IELTS Intensive #1",
      "status": "PRESENT",
      "notes": "Dərsdə olub"
    }
  ],
  "stats": {
    "totalPaid": 500,
    "totalDebt": 0,
    "attendanceRate": "95%",
    "enrolledGroupsCount": 1
  }
}
```

---

### 2. `GET /api/teachers/[id]`
**File**: `src/app/api/teachers/[id]/route.ts`

**SQL Query Strategy**:
```sql
-- 1. Fetch teacher profile
SELECT 
  t.id,
  t.specialization,
  t.created_at,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.user_id
FROM teachers t
LEFT JOIN user_profiles p ON t.profile_id = p.id
WHERE t.id = ${id};

-- 2. Fetch groups assigned to this teacher
SELECT 
  g.id,
  g.name,
  g.room,
  g.created_at,
  pr.name as program
FROM groups g
LEFT JOIN programs pr ON g.program_id = pr.id
WHERE g.teacher_id = ${teacher.userId} 
   OR g.teacher_id = ${id}
   OR g.teacher_id = ${teacher.profileId};

-- 3. Fetch aggregated student list
SELECT 
  s.id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  s.created_at
FROM students s
LEFT JOIN user_profiles p ON s.profile_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;
```

**JSON Response Schema**:
```json
{
  "teacher": {
    "id": "t-1",
    "name": "Əli Əliyev",
    "firstName": "Əli",
    "lastName": "Əliyev",
    "email": "ali@thrive.az",
    "phone": "+994501112233",
    "specialty": "IELTS / General English",
    "status": "ACTIVE",
    "joinDate": "2025-09-01T00:00:00.000Z"
  },
  "groups": [
    {
      "id": "g-1",
      "name": "IELTS Intensive #1",
      "program": "IELTS",
      "room": "Room 101",
      "studentCount": 12,
      "maxCapacity": 15
    }
  ],
  "students": [
    {
      "id": "s-1",
      "name": "Cavid Rüstəmov",
      "email": "cavid@example.com",
      "phone": "+994551234567",
      "groupName": "IELTS Intensive #1"
    }
  ],
  "schedules": [
    {
      "id": "sch-1",
      "dayOfWeek": 1,
      "dayName": "Bazar ertəsi",
      "startTime": "10:00",
      "endTime": "12:00",
      "room": "Room 101",
      "groupName": "IELTS Intensive #1"
    },
    {
      "id": "sch-2",
      "dayOfWeek": 3,
      "dayName": "Çərşənbə",
      "startTime": "10:00",
      "endTime": "12:00",
      "room": "Room 101",
      "groupName": "IELTS Intensive #1"
    }
  ],
  "stats": {
    "activeGroupsCount": 2,
    "totalStudentsCount": 24,
    "weeklyHours": 8
  }
}
```

---

### 3. `GET /api/groups/[id]`
**File**: `src/app/api/groups/[id]/route.ts`

**SQL Query Strategy**:
```sql
-- 1. Fetch group details with Program and Teacher info
SELECT 
  g.id,
  g.name,
  g.room,
  g.created_at,
  g.program_id,
  g.teacher_id,
  pr.name as program_name,
  pr.description as program_description,
  pr.duration_months,
  COALESCE(tp.first_name || ' ' || tp.last_name, u.email, 'Müəllim təyin edilməyib') as teacher_name,
  COALESCE(tp.email, u.email) as teacher_email,
  tp.phone as teacher_phone
FROM groups g
LEFT JOIN programs pr ON g.program_id = pr.id
LEFT JOIN auth.users u ON g.teacher_id = u.id
LEFT JOIN teachers t ON g.teacher_id = t.id OR g.teacher_id = t.profile_id
LEFT JOIN user_profiles tp ON t.profile_id = tp.id OR u.id = tp.user_id
WHERE g.id = ${id};

-- 2. Fetch enrolled students
SELECT 
  s.id,
  s.created_at as "enrolledAt",
  p.first_name,
  p.last_name,
  p.email,
  p.phone
FROM students s
LEFT JOIN user_profiles p ON s.profile_id = p.id
ORDER BY s.created_at DESC
LIMIT 15;
```

**JSON Response Schema**:
```json
{
  "group": {
    "id": "g-1",
    "name": "IELTS Intensive #1",
    "program": "IELTS",
    "programDescription": "IELTS preparation",
    "durationMonths": 6,
    "teacher": "Əli Əliyev",
    "teacherEmail": "ali@thrive.az",
    "teacherPhone": "+994501112233",
    "room": "Room 101",
    "maxCapacity": 15,
    "status": "ACTIVE",
    "createdAt": "2026-01-10T00:00:00.000Z"
  },
  "students": [
    {
      "id": "s-1",
      "name": "Cavid Rüstəmov",
      "email": "cavid@example.com",
      "phone": "+994551234567",
      "enrolledAt": "2026-01-12T00:00:00.000Z",
      "paymentStatus": "PAID",
      "attendanceRate": "95%"
    }
  ],
  "schedules": [
    {
      "id": "sch-1",
      "dayOfWeek": 1,
      "dayName": "Bazar ertəsi",
      "startTime": "10:00",
      "endTime": "12:00",
      "room": "Room 101"
    },
    {
      "id": "sch-2",
      "dayOfWeek": 3,
      "dayName": "Çərşənbə",
      "startTime": "10:00",
      "endTime": "12:00",
      "room": "Room 101"
    }
  ],
  "attendanceHistory": [
    {
      "date": "2026-02-12",
      "presentCount": 11,
      "absentCount": 1,
      "topic": "Reading Section: True/False/Not Given"
    },
    {
      "date": "2026-02-10",
      "presentCount": 12,
      "absentCount": 0,
      "topic": "Writing Task 2: Opinion Essays"
    }
  ],
  "stats": {
    "enrolledStudentsCount": 12,
    "maxCapacity": 15,
    "capacityPercentage": 80,
    "averageAttendance": "95%"
  }
}
```

---

## 4. UI/UX Component Architecture for Profile Pages

### 1. Student Profile Page (`/dashboard/students/[id]`)
- **Header**:
  - Breadcrumb / Back button (`← Tələbələrə Qayıt`)
  - Student Avatar with initials
  - Full Name, Student ID badge, Status pill (`Active` / `Frozen`)
  - Action buttons: `Redaktə et` (Edit), `Ödəniş Qəbul Et` (Add Payment), `Müqavilə Çap Et` (Print Contract), `Sil` (Delete)
- **Top KPI Cards**:
  1. `Ümumi Ödəniş`: Total paid amount (₼)
  2. `Qalıq Borc`: Pending debt amount (₼)
  3. `Davamiyyət Faizi`: Overall attendance percentage (%)
  4. `Qoşulduğu Qruplar`: Number of active groups
- **Tabbed Interface**:
  - **Tab 1: Ümumi Məlumat (Overview)**:
    - Personal Details card: Full Name, Email, Phone, FIN code, ID card number, Registration date.
    - Notes / Activity history.
  - **Tab 2: Qruplar və Dərslər (Groups & Classes)**:
    - Table/Cards of enrolled groups with Program, Teacher, Room, and Schedule badge.
  - **Tab 3: Maliyyə və Ödənişlər (Finance & Payments)**:
    - Table of student payments with Amount, Status (Paid/Pending), Date, and Contract/Invoice PDF modal trigger.
  - **Tab 4: Davamiyyət (Attendance)**:
    - Attendance timeline table with Date, Group Name, Status (`İştirak edib`, `Qayıb`, `Gecikib`), and Notes.

### 2. Teacher Profile Page (`/dashboard/teachers/[id]`)
- **Header**:
  - Back button (`← Müəllimlərə Qayıt`)
  - Teacher Avatar with subject badge
  - Full Name, Specialty / Subject, Status pill
  - Action buttons: `Redaktə et`, `Yeni Qrup Təyin Et`, `Sil`
- **Top KPI Cards**:
  1. `Tədris Etdiyi Qruplar`: Active groups count
  2. `Cəmi Tələbə Sayı`: Total students count across all groups
  3. `Həftəlik Dərs Saatı`: Total weekly teaching hours
- **Tabbed Interface**:
  - **Tab 1: Profil və Əlaqə (Overview)**:
    - Name, Email, Phone, Specialization, Employment date, Bio.
  - **Tab 2: Qruplar (Assigned Groups)**:
    - Cards/Table of groups led by this teacher with student count / capacity.
  - **Tab 3: Tələbələr (Students List)**:
    - Aggregated list of students taught by this teacher with direct links to student profiles.
  - **Tab 4: Həftəlik Dərs Cədvəli (Weekly Schedule)**:
    - Visual timetable of days and times with room allocations.

### 3. Group Profile Page (`/dashboard/groups/[id]`)
- **Header**:
  - Back button (`← Qruplara Qayıt`)
  - Group Icon and Name (e.g. `IELTS Intensive #1`)
  - Program tag, Assigned Teacher tag, Room tag
  - Action buttons: `Tələbə Əlavə Et`, `Cədvəli Dəyiş`, `Redaktə et`, `Sil`
- **Top KPI Cards**:
  1. `Tələbə Sayı`: Enrolled count vs Max Capacity (e.g. `12 / 15`)
  2. `Doluluk Faizi`: Capacity percentage (e.g. `80%`)
  3. `Orta Davamiyyət`: Average group attendance (e.g. `95%`)
- **Tabbed Interface**:
  - **Tab 1: Qrup Məlumatı (Overview)**:
    - Program details, description, teacher contact info, room, start date.
  - **Tab 2: Tələbə Siyahısı (Enrolled Students)**:
    - Table of enrolled students with Name, Contact, Enrollment Date, Payment Status, and clickable navigation to student profile.
  - **Tab 3: Dərs Cədvəli (Schedule)**:
    - Weekly lesson schedule for the group.
  - **Tab 4: Davamiyyət Tarixçəsi (Attendance Sessions)**:
    - Log of past lesson dates with Present/Absent counts and lesson topics.

---

## 5. Master List / Table Navigation Links

In the existing list pages:
1. `src/app/[locale]/dashboard/students/page.tsx`:
   - Wrap student row or name with `Link` (`/dashboard/students/${student.id}`) or click handler to navigate to the dynamic profile.
2. `src/app/[locale]/dashboard/teachers/page.tsx`:
   - Wrap teacher card or name with `Link` (`/dashboard/teachers/${teacher.id}`) to navigate to the dynamic profile.
3. `src/app/[locale]/dashboard/groups/page.tsx`:
   - Wrap group row or name with `Link` (`/dashboard/groups/${group.id}`) to navigate to the dynamic profile.

---

## 6. Required Translation Keys (`messages/*.json`)

To prevent `next-intl` runtime crashes, the following key dictionary must be present in `messages/en.json`, `messages/az.json`, and `messages/ru.json`:

```json
"Profile": {
  "backToStudents": "Back to Students",
  "backToTeachers": "Back to Teachers",
  "backToGroups": "Back to Groups",
  "overview": "Overview",
  "groups": "Groups",
  "payments": "Payments",
  "attendance": "Attendance",
  "schedule": "Schedule",
  "students": "Students",
  "generalInfo": "General Information",
  "contactInfo": "Contact Information",
  "fullName": "Full Name",
  "email": "Email",
  "phone": "Phone",
  "fin": "FIN Code",
  "idCard": "ID Card Number",
  "joinDate": "Registration Date",
  "specialty": "Specialty / Subject",
  "room": "Room",
  "program": "Program",
  "teacher": "Teacher",
  "capacity": "Capacity",
  "totalPaid": "Total Paid",
  "totalDebt": "Remaining Debt",
  "attendanceRate": "Attendance Rate",
  "enrolledGroups": "Enrolled Groups",
  "activeGroups": "Active Groups",
  "totalStudents": "Total Students",
  "weeklyHours": "Weekly Hours",
  "capacityUsage": "Capacity Usage",
  "avgAttendance": "Average Attendance",
  "noGroups": "No groups assigned",
  "noPayments": "No payment records found",
  "noAttendance": "No attendance records found",
  "noStudents": "No students enrolled",
  "noSchedule": "No schedule set",
  "editProfile": "Edit",
  "deleteProfile": "Delete",
  "addPayment": "Add Payment",
  "addStudent": "Add Student",
  "printContract": "Print Contract / Invoice",
  "present": "Present",
  "absent": "Absent",
  "late": "Late"
}
```

---

## 7. Build Verification & TypeScript Compliance Plan

1. **TypeScript (`npx tsc --noEmit`)**:
   - All async params in Next.js 15 page components typed as `params: Promise<{ locale: string; id: string }>`.
   - Explicit types for API responses (`StudentProfileData`, `TeacherProfileData`, `GroupProfileData`).
2. **Next.js Production Build (`npm run build`)**:
   - All API routes marked with `export const dynamic = "force-dynamic";`.
   - Localization wrapper compatible with `generateStaticParams` for `[locale]`.
