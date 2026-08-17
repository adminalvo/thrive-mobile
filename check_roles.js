const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRoles() {
  const emails = [
    "tamerlan@thrive.az",
    "michelle@thrive.az",
    "ayan@thrive.az",
    "cavid@thrive.az",
    "naiba@thrive.az",
    "zeynmedia@thrive.az"
  ];
  
  for (const email of emails) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
       console.log("Admin listUsers failed, trying direct query if we have permissions...");
       // Try direct SQL query on user_roles via rpc if possible or just rely on manual knowledge
       break;
    }
    const user = users.find(u => u.email === email);
    if (user) {
      const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      console.log(`${email} -> ${role?.role}`);
    }
  }
}

checkRoles();
