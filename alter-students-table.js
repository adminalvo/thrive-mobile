const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.POSTGRES_URL, {ssl: 'require', prepare: false});
async function run() {
  try {
    await sql`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS program VARCHAR(255),
      ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS duration_months INT,
      ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2);
    `;
    console.log("students table altered successfully!");
  } catch(e) { console.error(e); }
  process.exit();
}
run();
