export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const programs = await sql`
      SELECT id, name, parent_id FROM programs WHERE deleted_at IS NULL ORDER BY name ASC
    `;

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Programs API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, parent_id } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newProgram] = await sql`
      INSERT INTO programs (name, parent_id)
      VALUES (${name}, ${parent_id || null})
      RETURNING *
    `;

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Programs API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
