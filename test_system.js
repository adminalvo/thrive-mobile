const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runTests() {
  console.log("=== SISTEM TESTI BASLAYIR ===");
  
  // 1. Rolların yoxlanması
  console.log("\n1. Istifadeci Rollarinin Yoxlanmasi...");
  
  const p = await supabase.from('parents').select('id').limit(1);
  const s = await supabase.from('students').select('id').limit(1);
  const t = await supabase.from('teachers').select('id').limit(1);
  const st = await supabase.from('staff').select('id').limit(1);
  
  if (!p.error && !s.error && !t.error && !st.error) {
    console.log("✅ Valideynlər, Tələbələr, Müəllimlər və İşçilər (Admin) cədvəlləri API-yə uğurla qoşuldu.");
  } else {
    console.log("⚠️ Bəzi cədvəllər tapılmadı.");
  }

  // 2. Cədvəllərin (Schedules) yoxlanması
  console.log("\n2. Cədvəllərin (Group Schedules) Yoxlanması...");
  const { data: schedules, error: schErr } = await supabase.from('group_schedules').select('*').limit(5);
  if (schErr) {
    console.log("Xəta (group_schedules):", schErr.message);
  } else {
    console.log(`Tapıldı: ${schedules.length} dərs günləri qeydi.`);
    if (schedules.length > 0) {
      console.log("✅ Cədvəl sistemi (Schedule) aktivdir və oxunur.");
    } else {
      console.log("⚠️ Cədvəl boşdur, test datası yoxdur.");
    }
  }

  // 3. Tapşırıqlar yoxlanması
  console.log("\n3. Tapşırıqların Yoxlanması...");
  const { data: assignments, error: assErr } = await supabase.from('assignments').select('*').limit(5);
  if (assErr) {
    console.log("Xəta (Assignments):", assErr.message);
  } else {
    console.log(`Tapıldı: ${assignments.length} tapşırıq.`);
    console.log("✅ Tapşırıqlar modulu API ilə əlaqədədir.");
  }

  console.log("\n=== TEST YEKUNLASDI ===");
}

runTests();
