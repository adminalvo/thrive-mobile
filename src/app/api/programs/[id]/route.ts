export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, parent_id } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [updatedProgram] = await sql`
      UPDATE programs SET name = ${name}, parent_id = ${parent_id || null} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Programs Update API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Soft delete
    await sql`
      UPDATE programs SET deleted_at = NOW() WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Programs Delete API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
