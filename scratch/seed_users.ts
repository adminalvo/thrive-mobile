import postgres from "postgres";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionUrl) {
  console.error("DIRECT_URL or DATABASE_URL not set.");
  process.exit(1);
}

const sql = postgres(connectionUrl, { ssl: "require" });

const accounts = [
  { email: "tamerlan@thrive.az", password: "Tamerlan2026@", name: "Tamerlan", role: "admin" },
  { email: "michelle@thrive.az", password: "Michelle2026@", name: "Michelle", role: "admin" },
  { email: "ayan@thrive.az", password: "Ayan2026@", name: "Ayan", role: "admin" },
  { email: "cavid@thrive.az", password: "Cavid 2026@", name: "Cavid", role: "admin" },
  { email: "naiba@thrive.az", password: "Naiba2026@", name: "Naiba", role: "admin" },
  { email: "zeynmedia@thrive.az", password: "Zeyn2026@", name: "Zeyn", role: "admin" },
];

async function seed() {
  // Ensure user_profiles table exists
  await sql`
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      first_name TEXT,
      last_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `.catch(e => console.log("Profiles table check:", e.message));

  for (const account of accounts) {
    const existing = await sql`SELECT id FROM auth.users WHERE email = ${account.email}`;
    
    if (existing.length === 0) {
      const encryptedPassword = await bcrypt.hash(account.password, 10);
      const newId = crypto.randomUUID();
      
      try {
        await sql`
          INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at, 
            role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, recovery_token, email_change_token_new, email_change
          )
          VALUES (
            ${newId},
            '00000000-0000-0000-0000-000000000000',
            ${account.email},
            ${encryptedPassword},
            now(),
            ${account.role},
            'authenticated',
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
          )
        `;
        
        // Insert into user_profiles if exists
        try {
           await sql`
            INSERT INTO public.user_profiles (user_id, first_name, last_name)
            VALUES (${newId}, ${account.name}, '')
          `;
        } catch(e: any) {
           console.log("Could not insert into user_profiles:", e.message);
        }
        
        console.log(`Created user: ${account.email}`);
      } catch (err: any) {
        console.error(`Error inserting ${account.email}:`, err.message);
      }
    } else {
      console.log(`User already exists: ${account.email}`);
      
      const encryptedPassword = await bcrypt.hash(account.password, 10);
      await sql`UPDATE auth.users SET encrypted_password = ${encryptedPassword}, role = ${account.role} WHERE id = ${existing[0].id}`;
      console.log(`Updated password and role for: ${account.email}`);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch(console.error);
