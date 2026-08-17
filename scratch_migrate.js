import { sql } from "@vercel/postgres";

async function main() {
  console.log("Running migrations...");

  await sql`
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='created_by') THEN
            ALTER TABLE leads ADD COLUMN created_by UUID;
        END IF;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      schedule_id UUID,
      student_id UUID,
      status TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS group_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      teacher_id UUID,
      group_id UUID,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
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

  console.log("Migrations done");
}

main().catch(console.error);
