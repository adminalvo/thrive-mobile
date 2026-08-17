export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Get assignments created by the teacher
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    
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

    let assignments;
    if (groupId) {
      assignments = await sql`
        SELECT a.*, g.name as group_name 
        FROM assignments a
        LEFT JOIN groups g ON a.group_id = g.id
        WHERE a.teacher_id = ${teacherId} AND a.group_id = ${groupId}
        ORDER BY a.created_at DESC
      `;
    } else {
      assignments = await sql`
        SELECT a.*, g.name as group_name 
        FROM assignments a
        LEFT JOIN groups g ON a.group_id = g.id
        WHERE a.teacher_id = ${teacherId}
        ORDER BY a.created_at DESC
      `;
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("GET Assignments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, groupId, dueDate, maxScore } = body;

    if (!title || !groupId) {
      return NextResponse.json({ error: "Title and group ID are required" }, { status: 400 });
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

    const newAssignment = await sql`
      INSERT INTO assignments (teacher_id, group_id, title, description, due_date, max_score)
      VALUES (${teacherId}, ${groupId}, ${title}, ${description || ""}, ${dueDate || null}, ${maxScore || 100})
      RETURNING *
    `;

    return NextResponse.json(newAssignment[0]);
  } catch (error) {
    console.error("POST Assignment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
