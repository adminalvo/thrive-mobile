import "../tests/e2e/bootstrap";
import { authOptions } from "../src/lib/authOptions";
import sql from "../src/lib/db";

async function test() {
  const cp = authOptions.providers.find((p: any) => p.id === "credentials") as any;
  const authFn = cp.options?.authorize || cp.authorize;

  console.log("Testing ADV2.3:");
  try {
    await authFn(undefined);
  } catch (e: any) {
    console.log("ADV2.3 caught:", e.message);
  }

  console.log("Testing ADV2.4:");
  try {
    await authFn({ email: "nonexistent@thrive.az", password: "abc" });
  } catch (e: any) {
    console.log("ADV2.4 caught:", e.message);
  }

  console.log("Testing ADV2.5:");
  const user = await authFn({ email: "tamerlan@thrive.az", password: "Tamerlan2026@" });
  console.log("ADV2.5 authenticated user:", user);

  const dbUsers = await sql`SELECT id FROM auth.users WHERE email = 'tamerlan@thrive.az'`;
  console.log("User id matches db:", user.id === dbUsers[0].id);

  process.exit(0);
}

test().catch(console.error);
