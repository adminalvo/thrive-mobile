const sql = require('./src/lib/db').default;

async function run() {
  try {
    const groups = await sql`SELECT id FROM groups LIMIT 1`;
    if (groups.length === 0) {
      console.log('No groups found');
      process.exit(0);
    }
    const id = groups[0].id;
    console.log('Testing GET /api/groups/' + id);

    const groupRes = await sql`
      SELECT 
        g.*, 
        p.name as program_name, p.description as program_description, p.duration_months,
        up.first_name as teacher_first, up.last_name as teacher_last, 
        up.email as teacher_email, up.phone as teacher_phone
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.id
      LEFT JOIN user_profiles up ON g.teacher_id = up.user_id OR g.teacher_id = up.id
      WHERE g.id = ${id}
    `;
    console.log(groupRes);

  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
