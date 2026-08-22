# SUPABASE SECURITY & ROW LEVEL SECURITY (RLS) POLICIES SPECIFICATION

## Overview
This document specifies the official security architecture, database access model, and **Row Level Security (RLS)** policy definitions for **Thrive Mobile** connected to the **Thrive CRM Supabase Backend**.

---

## 1. Authentication & Security Boundary Architecture

```text
auth.users (Supabase Auth UID)
      │
      ▼
public.user_profiles (WHERE user_id = auth.uid())
      │
      ▼
public.user_roles (WHERE user_id = auth.uid() -> role IN ('student', 'parent', 'teacher', 'admin', 'staff'))
      │
 ┌────┼───────────────────────────┐
 ▼    ▼                           ▼
Student                         Parent                          Teacher
students.profile_id = profile.id parents.profile_id = profile.id teachers.profile_id = profile.id
```

---

## 2. Table-by-Table RLS Policy Audit & Recommended Policies

### A. Core Profiles & Roles

#### 1. `user_profiles`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: Users can view their own profile (`user_id = auth.uid()`), plus staff/teachers can view assigned students' profiles.
  ```sql
  CREATE POLICY "Users can view own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (user_id = auth.uid());
  ```

#### 2. `user_roles`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: Authenticated users can query their own assigned role.
  ```sql
  CREATE POLICY "Users can read own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());
  ```

---

### B. Student, Parent & Teacher Entities

#### 3. `students`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: 
    - Students can view their own record (`profile_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())`).
    - Parents can view students linked via `student_parents` or `parent_students`.
    - Teachers can view students enrolled in their assigned groups.

#### 4. `parents`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: Parents can view their own profile.

#### 5. `teachers`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: Authenticated users can view active teacher names and specializations.

---

### C. Academic & Class Management

#### 6. `groups` & `group_schedules`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`:
    - Students can view groups they are enrolled in (`id IN (SELECT group_id FROM group_students WHERE student_id = ...)`).
    - Teachers can view groups assigned to them (`teacher_id = ...`).
    - Parents can view groups of their enrolled children.

#### 7. `attendance`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: 
    - Students can only view their own attendance (`student_id = ...`).
    - Parents can view attendance of their linked children.
    - Teachers can view attendance for groups they teach.
  - `INSERT / UPDATE`: 
    - Teachers can insert/update attendance for groups where `groups.teacher_id = teacher.id`.

---

### D. Assignments & Exams

#### 8. `assignments`
- **Current Status**: RLS Recommended (Currently Disabled in some staging environments)
- **Policy Definition**:
  ```sql
  ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Students and Parents can view group assignments"
  ON public.assignments
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_students 
      WHERE student_id IN (
        SELECT id FROM students WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
        UNION
        SELECT student_id FROM student_parents WHERE parent_id IN (SELECT id FROM parents WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
      )
    )
    OR
    group_id IN (
      SELECT id FROM groups WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
    )
  );

  CREATE POLICY "Teachers can create assignments for their groups"
  ON public.assignments
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
    )
  );
  ```

#### 9. `assignment_submissions`
- **Current Status**: RLS Recommended
- **Policy Definition**:
  ```sql
  ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

  -- Students can view and submit their own homework
  CREATE POLICY "Students can view and submit own submissions"
  ON public.assignment_submissions
  FOR ALL
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
  );

  -- Teachers can view and grade submissions for their assignments
  CREATE POLICY "Teachers can view and grade submissions"
  ON public.assignment_submissions
  FOR ALL
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a 
      JOIN groups g ON a.group_id = g.id 
      JOIN teachers t ON g.teacher_id = t.id 
      JOIN user_profiles up ON t.profile_id = up.id 
      WHERE up.user_id = auth.uid()
    )
  );
  ```

#### 10. `exams` & `exam_results`
- **Current Status**: RLS Recommended
- **Policy Definition**:
  ```sql
  ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

  -- Students can view their own exam results
  CREATE POLICY "Students can view own exam results"
  ON public.exam_results
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
  );

  -- Parents can view their children's exam results
  CREATE POLICY "Parents can view children exam results"
  ON public.exam_results
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM student_parents 
      WHERE parent_id IN (SELECT id FROM parents WHERE profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()))
    )
  );
  ```

---

### E. Financial Records

#### 11. `invoices` & `payments`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  - `SELECT`: Students and their linked parents can only view invoices/payments where `student_id` matches their own account or child account.
  - `INSERT / UPDATE / DELETE`: Strictly restricted to Staff / Admin roles (service role or staff permissions).

---

### F. Notifications

#### 12. `notifications`
- **Current Status**: RLS Enabled
- **Policy Requirements**:
  ```sql
  CREATE POLICY "Users can access own notifications"
  ON public.notifications
  FOR ALL
  USING (user_id = auth.uid());
  ```

---

## 3. Production Deployment Precautions

1. **Do not disable RLS on production**; apply security policies progressively.
2. **Never expose the Supabase `service_role` key** in the mobile client or frontend bundle.
3. Mobile application requests use the standard Supabase public `anon` key, relying on JWT tokens from `auth.users` for authorization.
