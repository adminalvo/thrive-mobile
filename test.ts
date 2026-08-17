import sql from './src/lib/db.js';

async function test() {
  try {
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'schedules' OR table_name = 'group_schedules'
    `;
    console.log(res);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
test();
