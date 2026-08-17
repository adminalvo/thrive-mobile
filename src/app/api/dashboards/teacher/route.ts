export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // First find teacher ID from auth.user_id
    const teacherRes = await sql`
      SELECT t.id 
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE p.user_id = ${userId}
    `;

    const teacherId = teacherRes.length > 0 ? teacherRes[0].id : null;
    
    // Get students assigned to this teacher's groups
    const students = await sql`
      SELECT DISTINCT s.id, p.first_name, p.last_name, p.email, p.phone, g.name as group_name, g.id as group_id
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      LEFT JOIN student_groups sg ON s.id = sg.student_id
      LEFT JOIN groups g ON sg.group_id = g.id
      WHERE g.teacher_id = ${userId}
    `;

    // Get today's classes
    const classes = await sql`
      SELECT c.id, c.start_time, c.end_time, c.status, g.name as group_name, g.room, 
             pr.name as program_name, g.id as group_id
      FROM schedules c
      LEFT JOIN groups g ON c.group_id = g.id
      LEFT JOIN programs pr ON g.program_id = pr.id
      WHERE g.teacher_id = ${userId}
        AND DATE(c.date) = CURRENT_DATE
      ORDER BY c.start_time ASC
    `;

    // Get pending assignments count
    const pendingAssignmentsRes = await sql`
      SELECT COUNT(*) as count
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.teacher_id = ${userId} AND s.status = 'SUBMITTED'
    `;
    const pendingAssignments = pendingAssignmentsRes[0].count || 0;

    // Get students with low attendance (e.g., < 80%)
    // Mocking this or calculating simply: we just count total 'ABSENT' > 3 for now as a quick risk indicator
    const lowAttendanceRes = await sql`
      SELECT s.id, up.first_name, up.last_name, COUNT(a.id) as absent_count
      FROM students s
      JOIN attendance a ON s.id = a.student_id
      LEFT JOIN user_profiles up ON s.profile_id = up.id
      JOIN student_groups sg ON s.id = sg.student_id
      JOIN groups g ON sg.group_id = g.id
      WHERE g.teacher_id = ${userId} AND a.status = 'ABSENT'
      GROUP BY s.id, up.first_name, up.last_name
      HAVING COUNT(a.id) >= 3
    `;

    return NextResponse.json({
      students: students.map((s: any) => ({
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Tələbə",
        email: s.email || "",
        phone: s.phone || "",
        group: s.group_name || "",
        groupId: s.group_id
      })),
      todayClasses: classes.map((c: any) => ({
        id: c.id,
        time: `${c.start_time ? c.start_time.substring(0,5) : ""} - ${c.end_time ? c.end_time.substring(0,5) : ""}`,
        group: c.group_name || "Bilinmir",
        program: c.program_name || "Proqram",
        room: c.room || "Otaq təyin edilməyib",
        status: c.status || "SCHEDULED"
      })),
      alerts: {
        pendingAssignments: Number(pendingAssignments),
        lowAttendanceStudents: lowAttendanceRes.map((s: any) => ({
          id: s.id,
          name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
          absentCount: s.absent_count
        }))
      }
    });
  } catch (error) {
    console.error("Teacher Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
