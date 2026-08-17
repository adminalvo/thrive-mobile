export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    const body = await req.json();
    const { parent_id } = body;

    if (!parent_id) return NextResponse.json({ error: "Parent ID is required" }, { status: 400 });

    // Check if link already exists
    const existing = await sql`
      SELECT * FROM student_parents 
      WHERE student_id = ${id} AND parent_id = ${parent_id}
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO student_parents (student_id, parent_id, relation_type)
        VALUES (${id}, ${parent_id}, 'Ata')
      `;
      await logAction("LINK_PARENT", { studentId: id, parentId: parent_id });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Link Parent Error:", error);
    return NextResponse.json({ error: "Failed to link parent", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

    const body = await req.json();
    const { parent_id } = body;

    if (!parent_id) return NextResponse.json({ error: "Parent ID is required" }, { status: 400 });

    await sql`
      DELETE FROM student_parents 
      WHERE student_id = ${id} AND parent_id = ${parent_id}
    `;

    await logAction("UNLINK_PARENT", { studentId: id, parentId: parent_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlink Parent Error:", error);
    return NextResponse.json({ error: "Failed to unlink parent" }, { status: 500 });
  }
}
