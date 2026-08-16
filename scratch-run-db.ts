import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DIRECT_URL;
if (!connectionUrl) throw new Error("No DB URL");

const sql = postgres(connectionUrl, { ssl: "require", prepare: false });

async function main() {
    await sql.begin(async (tx) => {
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
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
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
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
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
    });
    console.log("Database synchronized successfully");
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
