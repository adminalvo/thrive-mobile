import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function init() {
  await sql.begin(async tx => {
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
  });
  console.log("Exams tables created!");
  process.exit(0);
}
init();
