const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');

async function applyRLS() {
  const tables = [
    'group_students', 'programs'
  ];

  for (const table of tables) {
    try {
      await sql`ALTER TABLE public.${sql(table)} ENABLE ROW LEVEL SECURITY`;
      await sql.unsafe(`DROP POLICY IF EXISTS "Allow authenticated read" ON public.${table}`);
      await sql.unsafe(`CREATE POLICY "Allow authenticated read" ON public.${table} FOR SELECT TO authenticated USING (true)`);
    } catch (e) {
      console.log(`Failed for table ${table}:`, e.message);
    }
  }

  console.log('Done!');
  process.exit(0);
}

applyRLS();
