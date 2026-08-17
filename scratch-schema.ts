import sql from "./src/lib/db";

async function run() {
  const t = await sql`SELECT * FROM teachers LIMIT 1;`;
  console.log("Teachers:", Object.keys(t[0] || {}));
  
  const g = await sql`SELECT * FROM groups LIMIT 1;`;
  console.log("Groups:", Object.keys(g[0] || {}));
  
  const sg = await sql`SELECT * FROM student_groups LIMIT 1;`;
  console.log("Student Groups:", Object.keys(sg[0] || {}));

  process.exit(0);
}
run();
