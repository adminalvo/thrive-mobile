const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const conn = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = postgres(conn, { ssl: 'require' });

async function run() {
  const res = await sql`SELECT count(*) FROM students`;
  console.log('CRM Students:', res[0].count);
  process.exit(0);
}
run();
