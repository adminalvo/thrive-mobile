const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');

async function inspect() {
  const t1 = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payments'`;
  console.log('PAYMENTS:', t1);
  const t2 = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'group_students'`;
  console.log('GROUP_STUDENTS:', t2);
  const t3 = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'groups'`;
  console.log('GROUPS:', t3);
  process.exit(0);
}
inspect();
