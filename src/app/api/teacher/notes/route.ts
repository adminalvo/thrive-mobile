export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, content } = await req.json();

    if (!studentId || !content) {
      return NextResponse.json({ error: "studentId and content are required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Find teacher ID
    const teacherRes = await sql`
      SELECT t.id 
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE p.user_id = ${userId}
    `;

    if (teacherRes.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    const teacherId = teacherRes[0].id;

    await sql`
      INSERT INTO student_notes (teacher_id, student_id, content)
      VALUES (${teacherId}, ${studentId}, ${content})
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Teacher Notes API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
