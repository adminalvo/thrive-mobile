export const revalidate = 300;
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    // JS getDay() returns 0 for Sunday, 1 for Monday
    // Our DB uses 1=Mon ... 7=Sun
    const jsDay = new Date().getDay();
    const dbDay = jsDay === 0 ? 7 : jsDay;

    // We will check if the group_schedules table exists just in case
    // to avoid crashing if it's completely empty or unmigrated
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'group_schedules'
      );
    `;

    if (!tableCheck[0].exists) {
      return NextResponse.json([]);
    }

    const todayClasses = await sql`
      SELECT 
        s.start_time as time,
        g.name as title,
        COALESCE(s.room, g.room, 'Təyin edilməyib') as room,
        pr.first_name,
        pr.last_name
      FROM group_schedules s
      JOIN groups g ON s.group_id = g.id
      LEFT JOIN auth.users u ON g.teacher_id = u.id
      LEFT JOIN user_profiles pr ON pr.user_id = u.id
      WHERE s.day_of_week = ${dbDay}
      ORDER BY s.start_time ASC
      LIMIT 10
    `;

    const formatted = todayClasses.map((c: any) => ({
      time: c.time,
      title: c.title,
      room: c.room,
      teacher: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Müəllim təyin edilməyib"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Dashboard Today Classes Error:", error);
    return NextResponse.json({ error: "Failed to fetch today's classes" }, { status: 500 });
  }
}
