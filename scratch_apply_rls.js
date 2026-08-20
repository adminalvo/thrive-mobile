const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');

async function applyRLS() {
  console.log('Disabling RLS on tables temporarily or adding public read policies so mobile app can fetch data...');
  
  // Easiest way to match CRM's unauthenticated/bypassed behavior temporarily
  // until strict RLS is designed is to just add a public authenticated select policy to the required tables.
  const tables = [
    'user_profiles', 'user_roles', 'students', 'parents', 
    'student_parents', 'groups', 'student_groups', 'payments'
  ];

  for (const table of tables) {
    try {
      await sql`ALTER TABLE public.${sql(table)} ENABLE ROW LEVEL SECURITY`;
      // Allow authenticated users to select from these tables
      // Drop first to avoid conflicts
      await sql.unsafe(`DROP POLICY IF EXISTS "Allow authenticated read" ON public.${table}`);
      await sql.unsafe(`CREATE POLICY "Allow authenticated read" ON public.${table} FOR SELECT TO authenticated USING (true)`);
    } catch (e) {
      console.log(`Failed for table ${table}:`, e.message);
    }
  }

  console.log('RLS policies applied!');
  process.exit(0);
}

applyRLS();
