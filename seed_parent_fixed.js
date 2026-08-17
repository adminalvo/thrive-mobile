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
  const { data: profileObj, error: profileErr } = await supabase.from('user_profiles').upsert({ user_id: cavid.id, first_name: "Cavid", last_name: "Valideyn" }).select().single();
  if (profileErr) { console.log(profileErr); return; }

  // Create parent record
  let parentId;
  const { data: existParent } = await supabase.from('parents').select('id').eq('profile_id', profileObj.id).single();
  if(existParent) {
    parentId = existParent.id;
  } else {
    const { data: newP } = await supabase.from('parents').insert({ profile_id: profileObj.id }).select().single();
    parentId = newP.id;
  }
  
  // Create 2 fake students
  const st1 = await supabase.from('user_profiles').insert({ first_name: "Elvin", last_name: "Məmmədov", user_id: cavid.id + "1" }).select().single();
  const st2 = await supabase.from('user_profiles').insert({ first_name: "Fatimə", last_name: "Həsənova", user_id: cavid.id + "2" }).select().single();
  
  const student1 = await supabase.from('students').insert({ profile_id: st1.id, program: "Riyaziyyat", monthly_payment: 150 }).select().single();
  const student2 = await supabase.from('students').insert({ profile_id: st2.id, program: "İngilis dili", monthly_payment: 120 }).select().single();
  
  // Link to parent
  await supabase.from('student_parents').insert([
    { student_id: student1.id, parent_id: parentId },
    { student_id: student2.id, parent_id: parentId }
  ]);
  
  console.log("Adding fake groups for these students...");
  const gr1 = await supabase.from('groups').insert({ name: "Riyaziyyat 101", program_id: null, teacher_id: null }).select().single();
  const gr2 = await supabase.from('groups').insert({ name: "İngilis A2", program_id: null, teacher_id: null }).select().single();
  
  await supabase.from('student_groups').insert([
    { student_id: student1.id, group_id: gr1.id },
    { student_id: student2.id, group_id: gr2.id }
  ]);

  await supabase.from('group_schedules').insert([
    { group_id: gr1.id, day_of_week: 1, start_time: "10:00", end_time: "11:30", room: "101" },
    { group_id: gr2.id, day_of_week: 3, start_time: "14:00", end_time: "15:30", room: "201" }
  ]);

  // Add some fake payments
  await supabase.from('payments').insert([
    { student_id: student1.id, amount: 150, status: "PENDING", date: "2026-04-10" },
    { student_id: student2.id, amount: 120, status: "PAID", date: "2026-04-05" }
  ]);
  
  // Add some fake attendance
  await supabase.from('attendance').insert([
    { student_id: student1.id, status: "PRESENT", date: "2026-04-15", schedule_id: null },
    { student_id: student1.id, status: "ABSENT", date: "2026-04-18", schedule_id: null },
    { student_id: student2.id, status: "PRESENT", date: "2026-04-16", schedule_id: null }
  ]);
  
  console.log("Seeding complete! Cavid now has students and data.");
}

seedData();
