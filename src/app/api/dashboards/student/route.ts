export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get student ID
    const studentRes = await sql`
      SELECT s.id, p.first_name, p.last_name 
      FROM students s
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE p.user_id = ${userId}
    `;

    if (studentRes.length === 0) {
      return NextResponse.json({ schedules: [], notes: [], attendance: [], error: "Student profile not found" });
    }

    const studentId = studentRes[0].id;

    // Get Student Groups
    const groupsRes = await sql`
      SELECT group_id FROM student_groups WHERE student_id = ${studentId}
    `;
    const groupIds = groupsRes.map((g: any) => g.group_id);

    // Get Schedules
    let schedules = [];
    if (groupIds.length > 0) {
      schedules = await sql`
        SELECT c.id, c.start_time, c.end_time, c.status, g.name as group_name, g.room, c.day_of_week
        FROM schedules c
        JOIN groups g ON c.group_id = g.id
        WHERE c.group_id IN ${sql(groupIds)}
        ORDER BY c.day_of_week ASC, c.start_time ASC
      `;
    }

    // Get Notes & Homework
    let notes = [];
    if (groupIds.length > 0) {
      notes = await sql`
        SELECT n.id, n.content, n.created_at, u.email as teacher_email, g.name as group_name
        FROM group_notes n
        LEFT JOIN auth.users u ON n.teacher_id = u.id
        LEFT JOIN groups g ON n.group_id = g.id
        WHERE n.student_id = ${studentId} OR n.group_id IN ${sql(groupIds)}
        ORDER BY n.created_at DESC
        LIMIT 10
      `;
    }

    // Get Attendance
    const attendance = await sql`
      SELECT a.id, a.status, a.date, a.notes, g.name as group_name
      FROM attendance a
      JOIN groups g ON a.group_id = g.id
      WHERE a.student_id = ${studentId}
      ORDER BY a.date DESC
      LIMIT 10
    `;

    // Get exam results
    const exams = await sql`
      SELECT e.title, e.date, e.max_score, r.score, r.feedback, g.name as group_name
      FROM exam_results r
      JOIN exams e ON r.exam_id = e.id
      JOIN groups g ON e.group_id = g.id
      WHERE r.student_id = ${studentId}
      ORDER BY e.date DESC
    `;

    return NextResponse.json({
      schedules: schedules.map((s: any) => ({
        id: s.id,
        dayOfWeek: s.day_of_week,
        time: `${s.start_time ? s.start_time.substring(0,5) : ""} - ${s.end_time ? s.end_time.substring(0,5) : ""}`,
        group: s.group_name || "",
        room: s.room || "N/A",
        status: s.status
      })),
      notes: notes.map((n: any) => ({
        id: n.id,
        content: n.content,
        date: n.created_at,
        teacher: n.teacher_email || "Müəllim",
        group: n.group_name || "Ümumi"
      })),
      attendance: attendance.map((a: any) => ({
        id: a.id,
        date: a.date,
        status: a.status, // "PRESENT", "ABSENT", "LATE"
        group: a.group_name,
        notes: a.notes || ""
      })),
      exams: exams.map((e: any) => ({
        title: e.title,
        date: e.date,
        score: e.score,
        maxScore: e.max_score,
        feedback: e.feedback,
        groupName: e.group_name
      }))
    });

  } catch (error) {
    console.error("Student Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
