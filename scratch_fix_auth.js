const postgres = require('postgres');
const sql = postgres('postgres://postgres.bhiqieseyeamiqfgjssh:QTWROImWA95vcJDw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');

async function migrate() {
  console.log('Fixing existing passwords and confirming emails...');
  await sql`
    UPDATE auth.users 
    SET 
      encrypted_password = REPLACE(encrypted_password, '$2b$', '$2a$'),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE encrypted_password LIKE '$2b$%' OR email_confirmed_at IS NULL;
  `;

  console.log('Creating trigger function...');
  await sql`
    CREATE OR REPLACE FUNCTION public.fix_auth_users_for_mobile()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Convert Node.js $2b$ to Supabase GoTrue $2a$
      IF NEW.encrypted_password LIKE '$2b$%' THEN
        NEW.encrypted_password := REPLACE(NEW.encrypted_password, '$2b$', '$2a$');
      END IF;
      
      -- Auto-confirm email so mobile login works without verification
      IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  console.log('Applying trigger to auth.users...');
  await sql`
    DROP TRIGGER IF EXISTS auth_users_mobile_fix ON auth.users;
  `;
  
  await sql`
    CREATE TRIGGER auth_users_mobile_fix
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.fix_auth_users_for_mobile();
  `;

  console.log('Done!');
  process.exit(0);
}

migrate();
