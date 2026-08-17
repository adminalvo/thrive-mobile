const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedData() {
  console.log("Seeding data for Parent Cavid...");
  
  // Find cavid user
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
  if(uErr) { console.log(uErr); return; }
  const cavid = users.users.find(u => u.email === "cavid@thrive.az");
  
  if(!cavid) { console.log("Cavid not found"); return; }
  
  // Make sure cavid has a profile
  await supabase.from('user_profiles').upsert({ user_id: cavid.id, first_name: "Cavid", last_name: "Valideyn" });
  await supabase.from('user_roles').upsert({ user_id: cavid.id, role: "parent" });
  
  // Find or create parent record
  const { data: up } = await supabase.from('user_profiles').select('id').eq('user_id', cavid.id).single();
  let parentId;
  const { data: existParent } = await supabase.from('parents').select('id').eq('profile_id', up.id).single();
  if(existParent) {
    parentId = existParent.id;
  } else {
    const { data: newP } = await supabase.from('parents').insert({ profile_id: up.id }).select().single();
    parentId = newP.id;
  }
  
  // Create 2 fake students
  const st1 = await supabase.from('user_profiles').insert({ first_name: "Elvin", last_name: "Məmmədov" }).select().single();
  const st2 = await supabase.from('user_profiles').insert({ first_name: "Fatimə", last_name: "Həsənova" }).select().single();
  
  const student1 = await supabase.from('students').insert({ profile_id: st1.data.id, program: "Riyaziyyat", monthly_payment: 150 }).select().single();
  const student2 = await supabase.from('students').insert({ profile_id: st2.data.id, program: "İngilis dili", monthly_payment: 120 }).select().single();
  
  // Link to parent
  await supabase.from('student_parents').insert([
    { student_id: student1.data.id, parent_id: parentId },
    { student_id: student2.data.id, parent_id: parentId }
  ]);
  
  // Add some fake payments
  await supabase.from('payments').insert([
    { student_id: student1.data.id, amount: 150, status: "PENDING", date: "2026-04-10" },
    { student_id: student2.data.id, amount: 120, status: "PAID", date: "2026-04-05" }
  ]);
  
  // Add some fake attendance
  await supabase.from('attendance').insert([
    { student_id: student1.data.id, status: "PRESENT", date: "2026-04-15" },
    { student_id: student1.data.id, status: "ABSENT", date: "2026-04-18" },
    { student_id: student2.data.id, status: "PRESENT", date: "2026-04-16" }
  ]);
  
  console.log("Seeding complete! Cavid now has students and data.");
}

seedData();
