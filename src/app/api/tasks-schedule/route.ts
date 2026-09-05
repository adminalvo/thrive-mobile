export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logAction } from "@/lib/logger";

function isAuthorized(session: any) {
  if (!session?.user) return false;
  const role = (session.user.role || "").toLowerCase();
  if (role === "super_admin" || role === "admin") return true;

  const email = (session.user.email || "").toLowerCase();
  const name = (session.user.name || "").toLowerCase();

  return (
    email.includes("zeyn") ||
    email.includes("turalzeynalov") ||
    email.includes("yusifverdiyev") ||
    email.includes("tamerlan") ||
    email.includes("mehti") ||
    name.includes("tural") ||
    name.includes("zeynalov") ||
    name.includes("yusif") ||
    name.includes("zeyn") ||
    name.includes("tamerlan")
  );
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const dateFilter = searchParams.get("dateFilter");

    let schedules;
    if (type && type !== "all") {
      schedules = await sql`
        SELECT 
          id, 
          title, 
          type, 
          date::text as date, 
          start_time as "startTime", 
          end_time as "endTime", 
          location, 
          participants, 
          description, 
          status, 
          created_by as "createdBy", 
          created_at as "createdAt"
        FROM task_schedules
        WHERE type = ${type}
        ORDER BY date ASC, start_time ASC
      `;
    } else {
      schedules = await sql`
        SELECT 
          id, 
          title, 
          type, 
          date::text as date, 
          start_time as "startTime", 
          end_time as "endTime", 
          location, 
          participants, 
          description, 
          status, 
          created_by as "createdBy", 
          created_at as "createdAt"
        FROM task_schedules
        ORDER BY date ASC, start_time ASC
      `;
    }

    // Dynamic Team Members for 1-click selection
    const teamMembersRaw = await sql`
      SELECT DISTINCT 
        TRIM(CONCAT(p.first_name, ' ', COALESCE(p.last_name, ''))) as name
      FROM auth.users u
      JOIN public.user_profiles p ON u.id = p.user_id
      WHERE p.first_name IS NOT NULL AND TRIM(p.first_name) != ''
      ORDER BY name ASC
    `.catch(() => []);

    const standardNames = ["Tural Zeynalov", "Zeynmedia", "Tamerlan", "Yusif Verdiyev"];
    const allNamesSet = new Set(standardNames);
    teamMembersRaw.forEach((m: any) => {
      if (m.name && m.name.trim().length > 1) allNamesSet.add(m.name.trim());
    });
    const teamMembers = Array.from(allNamesSet);

    return NextResponse.json({
      schedules,
      teamMembers,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Task Schedule GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, date, startTime, endTime, location, participants, description, status } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Başlıq və tarix tələb olunur" }, { status: 400 });
    }

    const creatorName = session?.user?.name || session?.user?.email || "Admin";

    const [newSchedule] = await sql`
      INSERT INTO task_schedules (
        title, type, date, start_time, end_time, location, participants, description, status, created_by
      )
      VALUES (
        ${title.trim()},
        ${type || 'Shooting'},
        ${date},
        ${startTime || null},
        ${endTime || null},
        ${location || null},
        ${participants || null},
        ${description || null},
        ${status || 'PLANNED'},
        ${creatorName}
      )
      RETURNING 
        id, 
        title, 
        type, 
        date::text as date, 
        start_time as "startTime", 
        end_time as "endTime", 
        location, 
        participants, 
        description, 
        status, 
        created_by as "createdBy", 
        created_at as "createdAt"
    `;

    await logAction("CREATE_TASK_SCHEDULE", { title, date, type }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error: any) {
    console.error("Task Schedule POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create schedule" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, type, date, startTime, endTime, location, participants, description, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    const [updatedSchedule] = await sql`
      UPDATE task_schedules
      SET 
        title = COALESCE(${title ? title.trim() : undefined}, title),
        type = COALESCE(${type}, type),
        date = COALESCE(${date ? sql`${date}::date` : undefined}, date),
        start_time = COALESCE(${startTime}, start_time),
        end_time = COALESCE(${endTime}, end_time),
        location = COALESCE(${location}, location),
        participants = COALESCE(${participants}, participants),
        description = COALESCE(${description}, description),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id, 
        title, 
        type, 
        date::text as date, 
        start_time as "startTime", 
        end_time as "endTime", 
        location, 
        participants, 
        description, 
        status, 
        created_by as "createdBy", 
        created_at as "createdAt"
    `;

    await logAction("UPDATE_TASK_SCHEDULE", { id, title }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: updatedSchedule });
  } catch (error: any) {
    console.error("Task Schedule PUT Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update schedule" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    await sql`DELETE FROM task_schedules WHERE id = ${id}`;
    await logAction("DELETE_TASK_SCHEDULE", { id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Qrafik silindi" });
  } catch (error: any) {
    console.error("Task Schedule DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete schedule" }, { status: 500 });
  }
}
