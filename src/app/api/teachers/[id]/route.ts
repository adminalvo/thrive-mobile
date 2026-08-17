export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // 1. Fetch teacher & user profile
    const teacherRows = await sql`
      SELECT 
        t.id,
        t.specialization,
        t.created_at,
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.user_id
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE t.id = ${id} OR p.user_id = ${id}
    `;

    if (teacherRows.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const t = teacherRows[0];
    const fullName = `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir";

    // 2. Fetch groups assigned to this teacher
    let groups: any[] = [];
    try {
      const groupRows = await sql`
        SELECT 
          g.id,
          g.name,
          g.room,
          g.created_at,
          pr.name as program
        FROM groups g
        LEFT JOIN programs pr ON g.program_id = pr.id
        WHERE g.teacher_id = ${t.user_id || ""} 
           OR g.teacher_id = ${id}
           OR g.teacher_id = ${t.profile_id || ""}
        ORDER BY g.created_at DESC
      `;

      if (groupRows.length > 0) {
        groups = groupRows.map((g: any) => ({
          id: g.id,
          name: g.name,
          program: g.program || t.specialization || "Proqram seçilməyib",
          room: g.room || "Room",
          studentCount: 0, // Should be fetched from enrollments ideally
          maxCapacity: 15
        }));
      }
    } catch (e) {
      console.error("Fetch teacher groups error:", e);
    }

    // 3. Fetch students
    let students: any[] = [];
    try {
      const studentRows = await sql`
        SELECT 
          s.id,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          s.created_at
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 10
      `;
      students = studentRows.map((s: any, idx: number) => ({
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Tələbə",
        email: s.email || "",
        phone: s.phone || "",
        groupName: groups[idx % groups.length]?.name || "Əsas Qrup"
      }));
    } catch (e) {
      console.error("Fetch teacher students error:", e);
    }

    // 4. Schedules
    let schedules: any[] = [];
    try {
      const scheduleRows = await sql`
        SELECT s.id, s.day_of_week, s.start_time, s.end_time, g.name as group_name, g.room
        FROM schedules s
        JOIN groups g ON s.group_id = g.id
        WHERE g.teacher_id = ${t.user_id || ""} 
           OR g.teacher_id = ${id}
           OR g.teacher_id = ${t.profile_id || ""}
      `;
      const days = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
      schedules = scheduleRows.map((sch: any) => ({
        id: sch.id,
        dayOfWeek: sch.day_of_week,
        dayName: days[sch.day_of_week] || "Məlum deyil",
        startTime: sch.start_time?.substring(0, 5) || "",
        endTime: sch.end_time?.substring(0, 5) || "",
        room: sch.room || "Room",
        groupName: sch.group_name || "Qrup"
      }));
    } catch (e) {
      console.error("Fetch teacher schedules error:", e);
    }

    // 5. Stats
    const totalStudentsCount = students.length;
    const stats = {
      activeGroupsCount: groups.length,
      totalStudentsCount,
      weeklyHours: schedules.length * 2
    };

    const response = {
      teacher: {
        id: t.id,
        name: fullName,
        firstName: t.first_name || "",
        lastName: t.last_name || "",
        email: t.email || "",
        phone: t.phone || "",
        specialty: t.specialization || "Təyin edilməyib",
        status: "ACTIVE",
        joinDate: t.created_at || new Date().toISOString()
      },
      groups,
      students,
      schedules,
      stats
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Get Teacher Profile Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch teacher profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // The frontend might pass user_id or teacher_table_id.
    // We should find the associated teacher and user_id.
    const teacherRows = await sql`
      SELECT t.id as teacher_id, p.user_id, p.id as profile_id
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE t.id = ${id} OR p.user_id = ${id}
    `;

    if (teacherRows.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const { teacher_id, user_id, profile_id } = teacherRows[0];

    await sql.begin(async (tx: any) => {
      // 1. Delete from teachers table
      await tx`DELETE FROM teachers WHERE id = ${teacher_id}`;
      
      // 2. We can also remove their groups assignment
      await tx`UPDATE groups SET teacher_id = NULL WHERE teacher_id = ${user_id} OR teacher_id = ${teacher_id}`;

      // 3. Delete from user_roles
      if (user_id) {
        await tx`DELETE FROM user_roles WHERE user_id = ${user_id} AND role = 'teacher'`;
        
        // 4. Optionally delete the user entirely if they are only a teacher
        // (Assuming if they have no other roles, we can safely delete them from auth.users)
        const roles = await tx`SELECT role FROM user_roles WHERE user_id = ${user_id}`;
        if (roles.length === 0) {
          await tx`DELETE FROM user_profiles WHERE id = ${profile_id}`;
          await tx`DELETE FROM auth.users WHERE id = ${user_id}`;
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    const data = await req.json();

    const teacherRows = await sql`SELECT profile_id FROM teachers WHERE id = ${id}`;
    if (teacherRows.length > 0 && teacherRows[0].profile_id) {
      const profileId = teacherRows[0].profile_id;
      if (data.name || data.phone || data.email) {
        const nameParts = (data.name || "").trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        await sql`
          UPDATE user_profiles
          SET 
            first_name = COALESCE(${firstName || null}, first_name),
            last_name = COALESCE(${lastName || null}, last_name),
            phone = COALESCE(${data.phone || null}, phone),
            email = COALESCE(${data.email || null}, email)
          WHERE id = ${profileId}
        `;
      }
    }

    if (data.specialty) {
      await sql`
        UPDATE teachers
        SET specialization = ${data.specialty}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Teacher Error:", error);
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}
