const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncStaff() {
  const staffMembers = [
    { email: "tamerlan@thrive.az", firstName: "Tamerlan", lastName: "Məmmədov", role: "super_admin" },
    { email: "michelle@thrive.az", firstName: "Michelle", lastName: "", role: "staff" },
    { email: "ayan@thrive.az", firstName: "Ayan", lastName: "", role: "staff" },
    { email: "cavid@thrive.az", firstName: "Cavid", lastName: "", role: "staff" },
    { email: "naiba@thrive.az", firstName: "Naiba", lastName: "", role: "staff" },
    { email: "zeynmedia@thrive.az", firstName: "Zeyn", lastName: "Media", role: "staff" }
  ];

  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("List users failed. Cannot sync without service_role key with admin rights.", error);
    return;
  }

  for (const s of staffMembers) {
    let user = users.find(u => u.email === s.email);
    if (!user) {
      console.log(`Creating user ${s.email}...`);
      const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
        email: s.email,
        password: "password123!",
        email_confirm: true
      });
      if (createError) {
        console.error("Failed to create", s.email, createError);
        continue;
      }
      user = createdUser.user;
    } else {
      console.log(`User ${s.email} already exists.`);
    }

    // Upsert role
    await supabase.from('user_roles').upsert({ user_id: user.id, role: s.role });
    // Upsert profile
    await supabase.from('user_profiles').upsert({ user_id: user.id, first_name: s.firstName, last_name: s.lastName });
    
    console.log(`Synced ${s.email}`);
  }
  
  console.log("Sync complete!");
}

syncStaff();
