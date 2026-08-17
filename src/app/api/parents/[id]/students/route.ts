export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const students = await sql`
      SELECT s.id, p.first_name, p.last_name 
      FROM parent_students ps
      JOIN students s ON ps.student_id = s.id
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE ps.parent_id = ${id}
    `;

    const formatted = students.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Tələbə"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch linked students" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { student_id } = await req.json();

    if (!student_id) return NextResponse.json({ error: "student_id is required" }, { status: 400 });

    await sql`
      INSERT INTO parent_students (parent_id, student_id)
      VALUES (${id}, ${student_id})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to link student" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) return NextResponse.json({ error: "student_id is required" }, { status: 400 });

    await sql`
      DELETE FROM parent_students
      WHERE parent_id = ${id} AND student_id = ${student_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to unlink student" }, { status: 500 });
  }
}
