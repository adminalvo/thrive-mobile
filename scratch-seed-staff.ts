import { loadEnvConfig } from '@next/env';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

import postgres from "postgres";
import bcrypt from "bcrypt";
import crypto from "crypto";

const sql = postgres(process.env.DATABASE_URL as string, { ssl: "require" });

const users = [
  { email: "Tamerlan@thrive.az", pass: "Tamerlan2026@", name: "Tamerlan", role: "super_admin" },
  { email: "Cavid@thrive.az", pass: "Cavid2026@", name: "Cavid", role: "staff" },
  { email: "Michelle@thrive.az", pass: "Michelle2026@", name: "Michelle", role: "staff" },
  { email: "Ayan@thrive.az", pass: "Ayan2026@", name: "Ayan", role: "staff" },
  { email: "Naiba@thrive.az", pass: "Naiba2026@", name: "Naiba", role: "staff" },
  { email: "Nadir@thrive.az", pass: "Nadir2026@", name: "Nadir", role: "staff" },
  { email: "Zeynmedia@thrive.az", pass: "Zeynmedia2026@", name: "Zeynmedia", role: "staff" },
];

async function seed() {
  console.log("Seeding staff accounts...");
  for (const u of users) {
    try {
      const emailLower = u.email.toLowerCase();
      const existing = await sql`SELECT id FROM auth.users WHERE email = ${emailLower}`;
      if (existing.length > 0) {
        console.log(`User ${emailLower} already exists, skipping insert.`);
        // Ensure role is correct
        await sql`UPDATE auth.users SET role = ${u.role} WHERE email = ${emailLower}`;
        await sql`INSERT INTO user_roles (user_id, role) VALUES (${existing[0].id}, ${u.role}) ON CONFLICT (user_id) DO UPDATE SET role = ${u.role}`;
        continue;
      }

      const userId = crypto.randomUUID();
      const profileId = crypto.randomUUID();
      const hashedPass = await bcrypt.hash(u.pass, 10);

      await sql.begin(async (tx) => {
        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${userId}, ${emailLower}, ${u.role}, 'authenticated', ${hashedPass})
        `;

        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email)
          VALUES (${profileId}, ${userId}, ${u.name}, '', ${emailLower})
        `;

        await tx`
          INSERT INTO user_roles (user_id, role)
          VALUES (${userId}, ${u.role})
        `;
      });

      console.log(`Created user ${emailLower}`);
    } catch (error) {
      console.error(`Error creating user ${u.email}:`, error);
    }
  }

  console.log("Done seeding.");
  process.exit(0);
}

seed();
