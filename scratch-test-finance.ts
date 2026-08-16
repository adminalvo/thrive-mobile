import sql from './src/lib/db';
async function test() {
  try {
    const res = await sql`SELECT * FROM invoices LIMIT 1`;
    console.log('invoices exists', res);
  } catch (e: any) {
    console.error('invoices error', e.message);
  }
  try {
    const res = await sql`SELECT * FROM auth.users LIMIT 1`;
    console.log('auth.users exists', res);
  } catch (e: any) {
    console.error('auth.users error', e.message);
  }
  process.exit();
}
test();
