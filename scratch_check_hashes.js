const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');
async function check() {
  const r = await sql`SELECT email, encrypted_password, email_confirmed_at FROM auth.users WHERE email IN ('teststudent@thrive.az', 'mextytagiyev@gmail.com')`;
  console.log(r);
  process.exit(0);
}
check();
