export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await sql`DELETE FROM parents WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Parent Error:", error);
    return NextResponse.json({ error: "Failed to delete parent" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await req.json();

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await sql`
      UPDATE parents
      SET fin_code = ${data.fin_code}, id_card_number = ${data.id_card_number}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Update Parent Error:", error);
    return NextResponse.json({ error: "Failed to update parent" }, { status: 500 });
  }
}
