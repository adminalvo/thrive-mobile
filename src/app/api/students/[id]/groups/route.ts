export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    const body = await req.json();
    const { group_id } = body;

    if (!group_id) return NextResponse.json({ error: "Group ID is required" }, { status: 400 });

    // Check if link already exists
    const existing = await sql`
      SELECT * FROM group_students 
      WHERE student_id = ${id} AND group_id = ${group_id}
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO group_students (student_id, group_id)
        VALUES (${id}, ${group_id})
      `;
      await logAction("ADD_TO_GROUP", { studentId: id, groupId: group_id });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add to Group Error:", error);
    return NextResponse.json({ error: "Failed to add to group", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const group_id = searchParams.get("group_id");

    if (!group_id) return NextResponse.json({ error: "Group ID is required" }, { status: 400 });

    await sql`
      DELETE FROM group_students 
      WHERE student_id = ${id} AND group_id = ${group_id}
    `;

    await logAction("REMOVE_FROM_GROUP", { studentId: id, groupId: group_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from Group Error:", error);
    return NextResponse.json({ error: "Failed to remove from group" }, { status: 500 });
  }
}
