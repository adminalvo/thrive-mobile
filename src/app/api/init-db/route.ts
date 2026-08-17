export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    await sql.begin(async (tx: any) => {
      // 1. user_profiles
      await tx`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY,
          user_id UUID,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          phone TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 2. user_roles
      await tx`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id UUID PRIMARY KEY,
          role TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 3. students
      await tx`
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY,
          profile_id UUID,
          program VARCHAR(255),
          monthly_payment NUMERIC(10,2),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // Safely alter existing table to add columns if they don't exist
      await tx`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='program') THEN
                ALTER TABLE students ADD COLUMN program VARCHAR(255);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='monthly_payment') THEN
                ALTER TABLE students ADD COLUMN monthly_payment NUMERIC(10,2);
            END IF;
        END $$;
      `;

      // 4. teachers
      await tx`
        CREATE TABLE IF NOT EXISTS teachers (
          id UUID PRIMARY KEY,
          profile_id UUID,
          specialization TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 5. parents
      await tx`
        CREATE TABLE IF NOT EXISTS parents (
          id UUID PRIMARY KEY,
          profile_id UUID,
          fin_code TEXT,
          id_card_number TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 5.5 parent_students mapping
      await tx`
        CREATE TABLE IF NOT EXISTS parent_students (
          parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (parent_id, student_id)
        )
      `;

      // 6. programs
      await tx`
        CREATE TABLE IF NOT EXISTS programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          deleted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 7. groups
      await tx`
        CREATE TABLE IF NOT EXISTS groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          program_id UUID,
          teacher_id UUID,
          room TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 8. group_schedules
      await tx`
        CREATE TABLE IF NOT EXISTS group_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID,
          day_of_week INT,
          start_time TIME,
          end_time TIME,
          room TEXT,
          teacher_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 9. leads
      await tx`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          source TEXT,
          status TEXT NOT NULL DEFAULT 'NEW',
          notes TEXT,
          next_follow_up TIMESTAMPTZ,
          created_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await tx`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='created_by') THEN
                ALTER TABLE leads ADD COLUMN created_by UUID;
            END IF;
        END $$;
      `;

      // 10. attendance
      await tx`
        CREATE TABLE IF NOT EXISTS attendance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          schedule_id UUID,
          student_id UUID,
          status TEXT NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE'
          date DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 11. group_notes
      await tx`
        CREATE TABLE IF NOT EXISTS group_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID,
          group_id UUID,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 12. activity_logs
      await tx`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          action TEXT NOT NULL,
          details_az TEXT,
          details_en TEXT,
          details_ru TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 10. kanban_tasks
      await tx`
        CREATE TABLE IF NOT EXISTS kanban_tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'TODO',
          priority TEXT NOT NULL DEFAULT 'MEDIUM',
          due_date TIMESTAMPTZ,
          assignee TEXT,
          order_index INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 11. payments (Finance invoices and transactions)
      await tx`
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'PENDING',
          due_date TIMESTAMPTZ,
          payment_method TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 12. notifications
      await tx`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          title TEXT NOT NULL,
          message TEXT,
          type TEXT,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      // 13. student_notes
      await tx`
        CREATE TABLE IF NOT EXISTS student_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 14. exams
      await tx`
        CREATE TABLE IF NOT EXISTS exams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
          teacher_id UUID REFERENCES auth.users(id),
          date DATE NOT NULL,
          max_score INT NOT NULL DEFAULT 100,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 15. exam_results
      await tx`
        CREATE TABLE IF NOT EXISTS exam_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          score DECIMAL(5,2) NOT NULL,
          feedback TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(exam_id, student_id)
        )
      `;

      // 16. assignments
      await tx`
        CREATE TABLE IF NOT EXISTS assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
          teacher_id UUID REFERENCES auth.users(id),
          due_date TIMESTAMPTZ,
          max_score INT DEFAULT 100,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // 17. assignment_submissions
      await tx`
        CREATE TABLE IF NOT EXISTS assignment_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SUBMITTED, GRADED, LATE
          content TEXT,
          score INT,
          feedback TEXT,
          submitted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(assignment_id, student_id)
        )
      `;

      // Add missing column safely if table already existed without it
      try {
        await tx`ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE`;
      } catch (e) {
        console.log("Could not add is_private to student_notes:", e);
      }
    });

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    console.error("Database init error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
