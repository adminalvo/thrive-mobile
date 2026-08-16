
import sql from "../src/lib/db";

async function main() {
  console.log("Starting database migration...");

  try {
    // Enable uuid-ossp extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // 1. user_profiles
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        fin_code TEXT,
        id_card_number TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created user_profiles");

    // 2. user_roles
    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        role TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created user_roles");

    // 3. students
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created students");

    // 4. teachers
    await sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        specialization TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created teachers");

    // 5. parents
    await sql`
      CREATE TABLE IF NOT EXISTS parents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        fin_code TEXT,
        id_card_number TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created parents");

    // 6. programs
    await sql`
      CREATE TABLE IF NOT EXISTS programs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `;
    console.log("Created programs");

    // 7. groups
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
        teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        room TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created groups");

    // 8. group_schedules
    await sql`
      CREATE TABLE IF NOT EXISTS group_schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        day_of_week INT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        room TEXT,
        teacher_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created group_schedules");

    // 9. group_students
    await sql`
      CREATE TABLE IF NOT EXISTS group_students (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created group_students");

    // 10. payments
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID,
        amount DECIMAL,
        paid_amount DECIMAL DEFAULT 0,
        status TEXT,
        due_date TIMESTAMPTZ,
        payment_method TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created payments");

    // 11. leads
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        phone TEXT,
        email TEXT,
        source TEXT,
        status TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created leads");

    // 12. kanban_tasks
    await sql`
      CREATE TABLE IF NOT EXISTS kanban_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT,
        description TEXT,
        status TEXT,
        priority TEXT,
        due_date TIMESTAMPTZ,
        assignee TEXT,
        order_index INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created kanban_tasks");

    // 13. notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT,
        message TEXT,
        type TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Created notifications");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    process.exit(0);
  }
}

main();
