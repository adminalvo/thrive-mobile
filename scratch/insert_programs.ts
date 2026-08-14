import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function run() {
  const newPrograms = [
    { name: "TOEFL", desc: "TOEFL preparation" },
    { name: "IB", desc: "International Baccalaureate" },
    { name: "SAT", desc: "SAT preparation" },
    { name: "IELTS", desc: "IELTS preparation" },
    { name: "Duolingo", desc: "Duolingo English Test" },
    { name: "CSCA", desc: "CSCA preparation" },
    { name: "AP_Microeconomics", desc: "AP Microeconomics" },
    { name: "AP_Calculus", desc: "AP Calculus" },
    { name: "AP_Business", desc: "AP Business" },
    { name: "AP_Macroeconomics", desc: "AP Macroeconomics" },
    { name: "AP_Statistics", desc: "AP Statistics" },
    { name: "Private_School", desc: "Private School Tutoring" },
    { name: "General_English", desc: "General English" },
    { name: "DIM_Math", desc: "DİM Riyaziyyat" },
    { name: "DIM_English", desc: "İngilis dili DİM" },
    { name: "DIM_Russian", desc: "Rus dili DİM" },
    { name: "DIM_Azerbaijani", desc: "Azərbaycan dili DİM" }
  ];

  try {
    // Clear existing safely without breaking groups? 
    // If we just DELETE, it might violate FK constraint if groups exist.
    // Let's just insert them! We can leave the old ones, or we can soft-delete old ones by setting deleted_at = NOW() if such column exists.
    // I saw `deleted_at` column in programs table!
    
    await sql`UPDATE programs SET deleted_at = NOW() WHERE deleted_at IS NULL`;

    for (const p of newPrograms) {
      await sql`
        INSERT INTO programs (name, description, duration_months)
        VALUES (${p.name}, ${p.desc}, 6)
      `;
    }
    
    console.log("Successfully inserted programs.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
