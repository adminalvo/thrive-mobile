export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM group_schedules
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Schedule DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const rawDay = body.day_of_week !== undefined ? body.day_of_week : body.dayOfWeek;
    const day_of_week = rawDay !== undefined ? parseInt(rawDay, 10) : undefined;
    const start_time = body.start_time !== undefined ? body.start_time : body.startTime;
    const end_time = body.end_time !== undefined ? body.end_time : body.endTime;
    const room = body.room !== undefined ? body.room : undefined;

    const updated = await sql`
      UPDATE group_schedules
      SET
        day_of_week = CASE WHEN ${day_of_week !== undefined} THEN ${day_of_week ?? null} ELSE day_of_week END,
        start_time = CASE WHEN ${start_time !== undefined} THEN ${start_time ?? null} ELSE start_time END,
        end_time = CASE WHEN ${end_time !== undefined} THEN ${end_time ?? null} ELSE end_time END,
        room = CASE WHEN ${room !== undefined} THEN ${room ?? null} ELSE room END
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Schedule PUT error:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

export const PATCH = PUT;
