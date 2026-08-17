export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: "Submission ID and score are required" }, { status: 400 });
    }

    // Find teacher ID
    const teacherRes = await sql`
      SELECT t.id 
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE p.user_id = ${session.user.id}
    `;
    const teacherId = teacherRes.length > 0 ? teacherRes[0].id : null;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    // Verify this submission belongs to an assignment created by this teacher
    const checkRes = await sql`
      SELECT s.id 
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.id = ${submissionId} AND a.teacher_id = ${teacherId}
    `;

    if (checkRes.length === 0) {
      return NextResponse.json({ error: "Submission not found or unauthorized" }, { status: 404 });
    }

    // Update submission
    const updated = await sql`
      UPDATE assignment_submissions
      SET score = ${score}, feedback = ${feedback || ""}, status = 'GRADED'
      WHERE id = ${submissionId}
      RETURNING *
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("POST Grade Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
