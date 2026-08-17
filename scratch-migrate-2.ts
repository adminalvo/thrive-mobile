import 'dotenv/config';
import sql from './src/lib/db';

async function migrate() {
  try {
    console.log("Adding full_name and phone to parents...");
    await sql`
      ALTER TABLE parents
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT
    `;
    console.log("Success.");

    console.log("Adding lesson_time to invoices...");
    await sql`
      ALTER TABLE invoices
      ADD COLUMN IF NOT EXISTS lesson_time TEXT
    `;
    console.log("Success.");

  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    process.exit(0);
  }
}

migrate();
