export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, pending, completed
    
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

    // Get groups
    const groupsRes = await sql`
      SELECT group_id FROM student_groups WHERE student_id = ${studentId}
    `;
    const groupIds = groupsRes.map((g: any) => g.group_id);

    if (groupIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get assignments and their submission status
    const assignments = await sql`
      SELECT a.id, a.title, a.description, a.due_date, a.max_score, a.created_at,
             g.name as group_name, u.first_name as teacher_name, u.last_name as teacher_surname,
             s.id as submission_id, s.status, s.score, s.feedback
      FROM assignments a
      JOIN groups g ON a.group_id = g.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN user_profiles u ON t.profile_id = u.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ${studentId}
      WHERE a.group_id IN ${sql(groupIds)}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("GET Student Assignments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
