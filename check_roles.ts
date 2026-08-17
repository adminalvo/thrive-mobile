import 'dotenv/config';
import sql from './src/lib/db';
async function test() {
  const res = await sql`SELECT u.email, r.role FROM auth.users u LEFT JOIN public.user_roles r ON u.id = r.user_id`;
  console.log(res);
  process.exit();
}
test();
