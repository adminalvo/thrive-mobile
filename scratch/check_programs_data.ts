import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function run() {
  const p = await sql`SELECT * FROM programs`;
  console.log("programs:", p);
  process.exit(0);
}

run();
