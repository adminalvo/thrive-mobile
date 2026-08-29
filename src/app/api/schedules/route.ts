import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS group_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT,
      teacher_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 401 });
    }

    await ensureTable();

    const groups = await sql`
      SELECT 
        g.id,
        g.name,
        g.room,
        p.name as program_name,
        COALESCE(up.first_name || ' ' || up.last_name, 'Təyin edilməyib') as teacher_name,
        COALESCE(up.phone, '') as teacher_phone,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'groupId', s.group_id,
                'dayOfWeek', s.day_of_week,
                'day_of_week', s.day_of_week,
                'startTime', s.start_time,
                'start_time', s.start_time,
                'endTime', s.end_time,
                'end_time', s.end_time,
                'room', COALESCE(s.room, g.room)
              ) ORDER BY s.day_of_week ASC, s.start_time ASC
            )
            FROM group_schedules s
            WHERE s.group_id = g.id
          ),
          '[]'::json
        ) as schedules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'name', COALESCE(stp.first_name || ' ' || stp.last_name, 'Tələbə'),
                'phone', COALESCE(stp.phone, '—'),
                'email', COALESCE(stp.email, ''),
                'studyMode', 'offline'
              ) ORDER BY stp.first_name ASC
            )
            FROM group_students gs
            JOIN students st ON gs.student_id = st.id
            LEFT JOIN user_profiles stp ON st.profile_id = stp.id
            WHERE gs.group_id = g.id
          ),
          '[]'::json
        ) as students
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.id
      LEFT JOIN teachers t ON g.teacher_id = t.id
      LEFT JOIN user_profiles up ON t.profile_id = up.id
      ORDER BY g.name ASC
    `;

    const formatted = groups.map((g: any) => {
      const studentsList = Array.isArray(g.students) ? g.students : [];
      const gNameLower = (g.name || "").toLowerCase();
      
      // Auto-detect format from group name or student preferences
      let primaryFormat: 'offline' | 'online' | 'hybrid' = 'offline';
      if (gNameLower.includes("online") || gNameLower.includes("onlayn")) {
        primaryFormat = 'online';
      } else if (gNameLower.includes("hybrid") || gNameLower.includes("hibrid")) {
        primaryFormat = 'hybrid';
      }

      // Assign student formats accordingly
      const enrichedStudents = studentsList.map((st: any, idx: number) => {
        let mode = primaryFormat;
        if (primaryFormat === 'hybrid') {
          mode = idx % 2 === 0 ? 'offline' : 'online';
        }
        return {
          ...st,
          studyMode: mode
        };
      });

      const offlineCount = enrichedStudents.filter((s: any) => s.studyMode === 'offline').length;
      const onlineCount = enrichedStudents.filter((s: any) => s.studyMode === 'online').length;
      const hybridCount = enrichedStudents.filter((s: any) => s.studyMode === 'hybrid').length;

      return {
        id: g.id,
        name: g.name,
        room: g.room || "N/A",
        teacher: g.teacher_name,
        teacherPhone: g.teacher_phone || "",
        language: "AZ",
        maxCapacity: gNameLower.includes("mini") ? 5 : gNameLower.includes("fərdi") || gNameLower.includes("indiv") ? 1 : 12,
        _count: { students: enrichedStudents.length },
        students: enrichedStudents,
        formatStats: {
          offline: offlineCount,
          online: onlineCount,
          hybrid: hybridCount,
          primaryFormat: primaryFormat
        },
        program: { name: g.program_name || "Proqram seçilməyib" },
        schedules: g.schedules || []
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Schedules GET error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 401 });
    }

    await ensureTable();
    const body = await req.json();

    const group_id = body.group_id || body.groupId;
    const rawDay = body.day_of_week !== undefined ? body.day_of_week : body.dayOfWeek;
    const day_of_week = parseInt(rawDay, 10);
    const start_time = (body.start_time || body.startTime || "").trim();
    const end_time = (body.end_time || body.endTime || "").trim();
    const room = body.room ? String(body.room).trim() : null;
    const teacher_id = body.teacher_id || body.teacherId || null;

    if (!group_id) {
      return NextResponse.json({ error: "group_id is required" }, { status: 400 });
    }

    if (isNaN(day_of_week) || day_of_week < 1 || day_of_week > 7) {
      return NextResponse.json({ error: "day_of_week must be between 1 and 7" }, { status: 400 });
    }

    if (!start_time || !end_time) {
      return NextResponse.json({ error: "start_time and end_time are required" }, { status: 400 });
    }

    const created = await sql`
      INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, room, teacher_id)
      VALUES (${group_id}, ${day_of_week}, ${start_time}, ${end_time}, ${room}, ${teacher_id})
      RETURNING *
    `;

    const s = created[0];
    const formatted = {
      id: s.id,
      groupId: s.group_id,
      group_id: s.group_id,
      dayOfWeek: s.day_of_week,
      day_of_week: s.day_of_week,
      startTime: s.start_time,
      start_time: s.start_time,
      endTime: s.end_time,
      end_time: s.end_time,
      room: s.room
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("Schedules POST error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
