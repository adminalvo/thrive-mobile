const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getEmails() {
  const { data: users } = await supabase.from('users').select('email, role');
  if(!users) {
    const { data: profiles } = await supabase.from('user_roles').select('user_id, role');
    const userIds = profiles.map(p => p.user_id);
    const { data: allUsers } = await supabase.from('auth.users').select('id, email');
    console.log(allUsers);
  }
}

getEmails();
