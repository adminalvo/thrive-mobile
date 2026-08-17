const sql = require('./src/lib/db').default;

async function run() {
  const tRes = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'parents';
  `;
  console.log('parents:', tRes);
  process.exit(0);
}
run();
