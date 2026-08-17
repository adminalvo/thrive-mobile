import 'dotenv/config';
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL as string, {ssl: 'require', prepare: false});
async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS student_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Migration done");
  process.exit(0);
}
run();
