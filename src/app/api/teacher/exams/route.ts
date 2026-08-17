export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const userId = session.user.id;

    let exams = [];

    if (groupId) {
      exams = await sql`
        SELECT e.id, e.title, e.date, e.max_score, g.name as group_name
        FROM exams e
        JOIN groups g ON e.group_id = g.id
        WHERE e.group_id = ${groupId} AND g.teacher_id = ${userId}
        ORDER BY e.date DESC
      `;
    } else {
      exams = await sql`
        SELECT e.id, e.title, e.date, e.max_score, g.name as group_name, e.group_id
        FROM exams e
        JOIN groups g ON e.group_id = g.id
        WHERE g.teacher_id = ${userId}
        ORDER BY e.date DESC
      `;
    }

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Exams API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { title, groupId, date, maxScore } = body;

    if (!title || !groupId || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify teacher owns the group
    const groupCheck = await sql`SELECT id FROM groups WHERE id = ${groupId} AND teacher_id = ${userId}`;
    if (groupCheck.length === 0) {
      return NextResponse.json({ error: "Unauthorized group access" }, { status: 403 });
    }

    const [exam] = await sql`
      INSERT INTO exams (title, group_id, teacher_id, date, max_score)
      VALUES (${title}, ${groupId}, ${userId}, ${date}, ${maxScore || 100})
      RETURNING *
    `;

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Exams API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
