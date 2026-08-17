export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Group ID is required" }, { status: 400 });

    const body = await req.json();
    const { student_id } = body;

    if (!student_id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    // Check if link already exists
    const existing = await sql`
      SELECT * FROM group_students 
      WHERE student_id = ${student_id} AND group_id = ${id}
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO group_students (student_id, group_id)
        VALUES (${student_id}, ${id})
      `;
      await logAction("ADD_STUDENT_TO_GROUP", { studentId: student_id, groupId: id });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Link Student to Group Error:", error);
    return NextResponse.json({ error: "Failed to add student to group", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Group ID is required" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get("student_id");

    if (!student_id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    await sql`
      DELETE FROM group_students 
      WHERE student_id = ${student_id} AND group_id = ${id}
    `;

    await logAction("REMOVE_STUDENT_FROM_GROUP", { studentId: student_id, groupId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlink Student Error:", error);
    return NextResponse.json({ error: "Failed to remove student from group" }, { status: 500 });
  }
}
