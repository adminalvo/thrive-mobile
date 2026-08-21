export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

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
    await ensureTable();

    const groups = await sql`
      SELECT 
        g.id,
        g.name,
        g.room,
        p.name as program_name,
        COALESCE(up.first_name || ' ' || up.last_name, 'Təyin edilməyib') as teacher_name,
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
        ) as schedules
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.id
      LEFT JOIN teachers t ON g.teacher_id = t.id
      LEFT JOIN user_profiles up ON t.profile_id = up.id
      ORDER BY g.name ASC
    `;

    const formatted = groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      room: g.room || "N/A",
      teacher: g.teacher_name,
      language: "AZ",
      maxCapacity: 15,
      _count: { students: 0 },
      program: { name: g.program_name || "Proqram seçilməyib" },
      schedules: g.schedules || []
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Schedules GET error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
