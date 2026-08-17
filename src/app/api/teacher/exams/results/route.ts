export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    // Verify teacher owns the exam
    const examCheck = await sql`SELECT id FROM exams WHERE id = ${examId} AND teacher_id = ${session.user.id}`;
    if (examCheck.length === 0) {
      return NextResponse.json({ error: "Unauthorized access to this exam" }, { status: 403 });
    }

    const results = await sql`
      SELECT r.id, r.student_id, r.score, r.feedback, p.first_name, p.last_name
      FROM exam_results r
      JOIN students s ON r.student_id = s.id
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE r.exam_id = ${examId}
    `;

    return NextResponse.json(results.map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: `${r.first_name || ""} ${r.last_name || ""}`.trim() || "Tələbə",
      score: r.score,
      feedback: r.feedback
    })));
  } catch (error) {
    console.error("Exam Results API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { examId, studentId, score, feedback } = body;

    if (!examId || !studentId || score === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify teacher owns the exam
    const examCheck = await sql`SELECT id FROM exams WHERE id = ${examId} AND teacher_id = ${session.user.id}`;
    if (examCheck.length === 0) {
      return NextResponse.json({ error: "Unauthorized access to this exam" }, { status: 403 });
    }

    // Upsert the exam result
    const existing = await sql`
      SELECT id FROM exam_results WHERE exam_id = ${examId} AND student_id = ${studentId}
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE exam_results 
        SET score = ${score}, feedback = ${feedback}
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO exam_results (exam_id, student_id, score, feedback)
        VALUES (${examId}, ${studentId}, ${score}, ${feedback})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exam Results API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
