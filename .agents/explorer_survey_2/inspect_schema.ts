import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function run() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log("=== PUBLIC TABLES ===");
  console.log(tables.map(t => t.table_name));

  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = ${t.table_name} AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    console.log(`\n--- TABLE: ${t.table_name} ---`);
    console.table(cols);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
