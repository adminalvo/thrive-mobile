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

    // Find student ID
    const studentRes = await sql`
      SELECT s.id 
      FROM students s
      LEFT JOIN user_profiles up ON s.profile_id = up.id
      WHERE up.user_id = ${userId}
    `;

    const studentId = studentRes.length > 0 ? studentRes[0].id : null;
    
    let classes = [];
    let payments = [];

    if (studentId) {
      // Get upcoming classes for this student
      classes = await sql`
        SELECT c.id, c.date, c.start_time, c.end_time, c.status, g.name as group_name, 
               pr.name as program_name, t_up.first_name as teacher_name
        FROM schedules c
        LEFT JOIN groups g ON c.group_id = g.id
        LEFT JOIN programs pr ON g.program_id = pr.id
        LEFT JOIN teachers t ON g.teacher_id = t.id
        LEFT JOIN user_profiles t_up ON t.profile_id = t_up.id
        LEFT JOIN student_groups sg ON g.id = sg.group_id
        WHERE sg.student_id = ${studentId}
          AND DATE(c.date) >= CURRENT_DATE
        ORDER BY c.date ASC, c.start_time ASC
        LIMIT 10
      `;

      // Get payments for this student
      payments = await sql`
        SELECT p.id, p.amount, p.status, p.created_at
        FROM payments p
        WHERE p.student_id = ${studentId}
        ORDER BY p.created_at DESC
        LIMIT 10
      `;
    }

    return NextResponse.json({
      upcomingClasses: classes.map((c: any) => ({
        id: c.id,
        date: new Date(c.date).toLocaleDateString(),
        time: `${c.start_time ? c.start_time.substring(0,5) : ""} - ${c.end_time ? c.end_time.substring(0,5) : ""}`,
        group: c.group_name || "Bilinmir",
        program: c.program_name || "Proqram",
        teacherName: c.teacher_name || "Təyin edilməyib",
        status: c.status || "SCHEDULED"
      })),
      payments: payments.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        date: new Date(p.created_at).toLocaleDateString()
      }))
    });
  } catch (error) {
    console.error("Student Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
