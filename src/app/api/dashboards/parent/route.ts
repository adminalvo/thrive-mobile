export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find parent ID
    const parentRes = await sql`
      SELECT p.id 
      FROM parents p
      LEFT JOIN user_profiles up ON p.profile_id = up.id
      WHERE up.user_id = ${userId}
    `;

    const parentId = parentRes.length > 0 ? parentRes[0].id : null;
    
    let children = [];
    let classes = [];
    let payments = [];

    if (parentId) {
      // Get children
      children = await sql`
        SELECT s.id, up.first_name, up.last_name, s.program, s.monthly_payment
        FROM students s
        JOIN student_parents sp ON s.id = sp.student_id
        LEFT JOIN user_profiles up ON s.profile_id = up.id
        WHERE sp.parent_id = ${parentId}
      `;

      if (children.length > 0) {
        const studentIds = children.map((c: any) => c.id);
        
        // Get upcoming classes for these children
        classes = await sql`
          SELECT c.id, c.date, c.start_time, c.end_time, c.status, g.name as group_name, 
                 pr.name as program_name, up.first_name as student_name
          FROM schedules c
          LEFT JOIN groups g ON c.group_id = g.id
          LEFT JOIN programs pr ON g.program_id = pr.id
          LEFT JOIN student_groups sg ON g.id = sg.group_id
          LEFT JOIN students s ON sg.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE s.id IN ${sql(studentIds)}
            AND DATE(c.date) >= CURRENT_DATE
          ORDER BY c.date ASC, c.start_time ASC
          LIMIT 10
        `;

        // Get payments for these children
        payments = await sql`
          SELECT p.id, p.amount, p.status, p.created_at, up.first_name as student_name
          FROM payments p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE p.student_id IN ${sql(studentIds)}
          ORDER BY p.created_at DESC
          LIMIT 10
        `;
      }
    }

    return NextResponse.json({
      children: children.map((c: any) => ({
        id: c.id,
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Tələbə",
        program: c.program || "Bilinmir"
      })),
      upcomingClasses: classes.map((c: any) => ({
        id: c.id,
        date: new Date(c.date).toLocaleDateString(),
        time: `${c.start_time ? c.start_time.substring(0,5) : ""} - ${c.end_time ? c.end_time.substring(0,5) : ""}`,
        group: c.group_name || "Bilinmir",
        program: c.program_name || "Proqram",
        studentName: c.student_name || "Tələbə",
        status: c.status || "SCHEDULED"
      })),
      payments: payments.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        date: new Date(p.created_at).toLocaleDateString(),
        studentName: p.student_name || "Tələbə"
      }))
    });
  } catch (error) {
    console.error("Parent Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
