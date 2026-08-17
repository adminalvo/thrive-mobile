import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

async function migrate() {
  console.log("Running migrations...");

  // Assignments
  await sql`
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

  // Assignment Submissions
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'PENDING',
      content TEXT,
      score INT,
      feedback TEXT,
      submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(assignment_id, student_id)
    )
  `;

  // Private notes
  try {
    await sql`ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE`;
  } catch (e) {
    console.log("Could not add is_private to student_notes:", e);
  }

  console.log("Migrations done");
  process.exit(0);
}

migrate();
