import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function run() {
  const p = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'programs'`;
  console.log("programs columns:", p.map(c => c.column_name));
  process.exit(0);
}

run();
