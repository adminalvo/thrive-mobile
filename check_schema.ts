import 'dotenv/config';
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL as string, {ssl: 'require', prepare: false});
async function run() {
  const s = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`;
  const p = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'parents'`;
  console.log('students:', s.map(r=>r.column_name));
  console.log('parents:', p.map(r=>r.column_name));
  process.exit(0);
}
run();
