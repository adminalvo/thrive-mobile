import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function run() {
  const p = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'payments'`;
  console.log("payments columns:", p.map(c => c.column_name));

  const k = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'kanban_tasks'`;
  console.log("kanban_tasks columns:", k.map(c => c.column_name));

  process.exit(0);
}

run();
