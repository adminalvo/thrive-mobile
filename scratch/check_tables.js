const { default: sql } = require('../src/lib/db');
sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
  .then(r => console.log(r.map(x => x.table_name)))
  .catch(console.error)
  .finally(() => process.exit());
