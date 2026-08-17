import 'dotenv/config';
import sql from "./src/lib/db";
async function check() {
  try {
    const examsCheck = await sql`SELECT to_regclass('public.exams') as exams`;
    const assignmentsCheck = await sql`SELECT to_regclass('public.assignments') as assignments`;
    console.log("exams table:", examsCheck);
    console.log("assignments table:", assignmentsCheck);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
