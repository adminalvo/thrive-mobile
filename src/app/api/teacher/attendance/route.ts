export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { studentId, groupId, status, date } = body;

    if (!studentId || !groupId || !status || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the teacher owns this group
    const groupCheck = await sql`
      SELECT id FROM groups WHERE id = ${groupId} AND teacher_id = ${userId}
    `;

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: "Unauthorized group access" }, { status: 403 });
    }

    // Check if attendance already exists for this student on this date for this group
    const existing = await sql`
      SELECT id FROM attendance 
      WHERE student_id = ${studentId} AND group_id = ${groupId} AND date = ${date}
    `;

    if (existing.length > 0) {
      // Update
      await sql`
        UPDATE attendance 
        SET status = ${status}
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Insert
      await sql`
        INSERT INTO attendance (student_id, group_id, date, status)
        VALUES (${studentId}, ${groupId}, ${date}, ${status})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
