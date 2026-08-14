import "./bootstrap";
import sql from "../../src/lib/db";
import bcrypt from "bcrypt";

async function debugAuth() {
  const credentials = {
    email: "tamerlan@thrive.az",
    password: "Tamerlan2026@",
  };
  const emailLower = credentials.email.toLowerCase();
  console.log("emailLower:", emailLower);

  const users = await sql`
    SELECT u.*, p.first_name, p.last_name 
    FROM auth.users u
    LEFT JOIN public.user_profiles p ON u.id = p.user_id
    WHERE u.email = ${emailLower}
    LIMIT 1
  `;
  console.log("users query length:", users.length);
  const user = users[0];
  console.log("user:", user);

  const isPasswordValid = user.encrypted_password 
    ? await bcrypt.compare(credentials.password, user.encrypted_password)
    : false;
  console.log("isPasswordValid:", isPasswordValid);

  const validPasswords: Record<string, string> = {
    "tamerlan@thrive.az": "Tamerlan2026@",
    "michelle@thrive.az": "Michelle2026@",
    "ayan@thrive.az": "Ayan2026@",
    "cavid@thrive.az": "Cavid 2026@",
    "naiba@thrive.az": "Naiba2026@",
    "zeynmedia@thrive.az": "Zeyn2026@"
  };

  console.log("credentials.password === validPasswords[emailLower]:", credentials.password === validPasswords[emailLower]);

  const returnedUser = {
    id: user.id,
    email: user.email,
    name: user.first_name ? `${user.first_name} ${user.last_name}` : "Admin",
    role: user.role || "admin"
  };
  console.log("returnedUser:", returnedUser);
  process.exit(0);
}

debugAuth().catch(console.error);
