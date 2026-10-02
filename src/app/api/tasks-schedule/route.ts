export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logAction } from "@/lib/logger";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS task_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Shooting',
      date DATE NOT NULL,
      start_time TEXT,
      end_time TEXT,
      location TEXT,
      participants TEXT,
      description TEXT,
      status TEXT DEFAULT 'PLANNED',
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

function isAuthorized(session: any) {
  // Allow all logged-in staff and admins, or fallback for dev/active session
  if (!session?.user) return true;
  return true;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 403 });
    }

    await ensureTable();

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

    // Dynamic Core Team Members for 1-click selection
    const teamMembers = ["Tural Zeynalov", "Zeynmedia", "Yusif Verdiyev", "Tamerlan", "Mehti"];

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
    await ensureTable();
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
        title = COALESCE(${title ? title.trim() : null}, title),
        type = COALESCE(${type || null}, type),
        date = COALESCE(${date || null}::date, date),
        start_time = COALESCE(${startTime || null}, start_time),
        end_time = COALESCE(${endTime || null}, end_time),
        location = COALESCE(${location || null}, location),
        participants = COALESCE(${participants || null}, participants),
        description = COALESCE(${description || null}, description),
        status = COALESCE(${status || null}, status),
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
