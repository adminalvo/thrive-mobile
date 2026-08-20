const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');

async function list() {
  const r = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log(r.map(x => x.table_name));
  process.exit(0);
}
list();
