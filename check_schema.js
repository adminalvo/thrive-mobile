const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  const res = await sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('schedules', 'group_schedules')
  `;
  console.log(res);
  process.exit(0);
}
run();
