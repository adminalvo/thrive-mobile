export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const groups = await sql`
      SELECT g.id, g.name, g.room, g.created_at, p.name as program, u.email as teacher
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.id
      LEFT JOIN auth.users u ON g.teacher_id = u.id
      ORDER BY g.created_at DESC
    `;

    const formatted = groups.map(g => ({
      id: g.id,
      name: g.name,
      program: g.program || "N/A",
      teacher: g.teacher || "N/A", 
      room: g.room || "N/A"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Groups API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, program_id, teacher_id, room } = body;

    if (!name || !program_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const group = await sql`
      INSERT INTO groups (name, program_id, teacher_id, room)
      VALUES (${name}, ${program_id}, ${teacher_id || null}, ${room || null})
      RETURNING *
    `;

    return NextResponse.json(group[0]);
  } catch (error) {
    console.error("Groups Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
