import 'dotenv/config';
import sql from './src/lib/db';
async function run() {
  try {
    const sc = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`;
    console.log("Students:", sc.map(r => r.column_name));
    
    const pc = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'parents'`;
    console.log("Parents:", pc.map(r => r.column_name));
  } catch(e) {
    console.error("Error:", e.message);
  }
  process.exit();
}
run();
