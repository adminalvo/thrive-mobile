const { default: sql } = require('./src/lib/db');
sql`SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'groups'`
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit());
