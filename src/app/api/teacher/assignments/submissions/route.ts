export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Get submissions for a specific assignment or all pending
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    
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

    let submissions;
    if (assignmentId) {
      submissions = await sql`
        SELECT s.*, up.first_name, up.last_name, a.title as assignment_title, a.max_score
        FROM assignment_submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN students st ON s.student_id = st.id
        JOIN user_profiles up ON st.profile_id = up.id
        WHERE a.teacher_id = ${teacherId} AND s.assignment_id = ${assignmentId}
        ORDER BY s.submitted_at DESC
      `;
    } else {
      // Get all pending (SUBMITTED but not GRADED)
      submissions = await sql`
        SELECT s.*, up.first_name, up.last_name, a.title as assignment_title, a.max_score, g.name as group_name
        FROM assignment_submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN groups g ON a.group_id = g.id
        JOIN students st ON s.student_id = st.id
        JOIN user_profiles up ON st.profile_id = up.id
        WHERE a.teacher_id = ${teacherId} AND s.status = 'SUBMITTED'
        ORDER BY s.submitted_at ASC
      `;
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("GET Submissions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
