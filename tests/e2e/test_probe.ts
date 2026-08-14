import "./bootstrap";
import sql from "../../src/lib/db";
import { authOptions } from "../../src/lib/authOptions";

async function run() {
  console.log("=== CHECKING AUTH ===");
  const users = await sql`SELECT * FROM auth.users WHERE email = 'tamerlan@thrive.az'`;
  console.log("Users found in auth.users:", users);
  const provider = authOptions.providers.find(
    (p: any) => p.id === "credentials" || p.name === "Credentials"
  ) as any;

  try {
    const res = await provider.authorize({
      email: "tamerlan@thrive.az",
      password: "Tamerlan2026@",
    });
    console.log("authorize result:", res);
  } catch (e) {
    console.error("authorize error:", e);
  }

  console.log("\n=== CHECKING PAYMENTS SCHEMA ===");
  const constraints = await sql`
    SELECT
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.table_name = 'payments';
  `;
  console.log("Payments constraints:", constraints);

  const sampleStudent = await sql`SELECT * FROM students LIMIT 2`;
  console.log("Sample student:", sampleStudent);

  const sampleUserProfiles = await sql`SELECT * FROM user_profiles LIMIT 2`;
  console.log("Sample user_profiles:", sampleUserProfiles);

  const sampleUsers = await sql`SELECT id, email FROM auth.users LIMIT 2`;
  console.log("Sample auth.users:", sampleUsers);

  try {
    const samplePublicUsers = await sql`SELECT * FROM users LIMIT 2`;
    console.log("Sample public.users:", samplePublicUsers);
  } catch (e) {
    console.log("No public.users table or error:", e);
  }

  process.exit(0);
}

run().catch(console.error);
