export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, content } = body;

    if (!assignmentId || !content) {
      return NextResponse.json({ error: "Assignment ID and content are required" }, { status: 400 });
    }

    // Find student ID
    const studentRes = await sql`
      SELECT s.id 
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      WHERE p.user_id = ${session.user.id}
    `;
    const studentId = studentRes.length > 0 ? studentRes[0].id : null;

    if (!studentId) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Check if assignment exists and student is in the group
    const assignmentRes = await sql`
      SELECT a.id 
      FROM assignments a
      JOIN student_groups sg ON a.group_id = sg.group_id
      WHERE a.id = ${assignmentId} AND sg.student_id = ${studentId}
    `;

    if (assignmentRes.length === 0) {
      return NextResponse.json({ error: "Assignment not found or unauthorized" }, { status: 404 });
    }

    // Check if already submitted
    const existing = await sql`
      SELECT id FROM assignment_submissions 
      WHERE assignment_id = ${assignmentId} AND student_id = ${studentId}
    `;

    if (existing.length > 0) {
      // Update existing submission if it hasn't been graded
      const existingStatusRes = await sql`
        SELECT status FROM assignment_submissions WHERE id = ${existing[0].id}
      `;
      if (existingStatusRes[0].status === 'GRADED') {
         return NextResponse.json({ error: "Already graded, cannot update" }, { status: 400 });
      }

      const updated = await sql`
        UPDATE assignment_submissions
        SET content = ${content}, status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return NextResponse.json(updated[0]);
    }

    // Create new submission
    const newSubmission = await sql`
      INSERT INTO assignment_submissions (assignment_id, student_id, content, status)
      VALUES (${assignmentId}, ${studentId}, ${content}, 'SUBMITTED')
      RETURNING *
    `;

    return NextResponse.json(newSubmission[0]);
  } catch (error) {
    console.error("POST Submit Assignment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
