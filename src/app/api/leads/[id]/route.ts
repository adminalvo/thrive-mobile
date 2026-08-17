export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updated = await sql`
      UPDATE leads
      SET 
        name = COALESCE(${body.name || null}, name),
        phone = COALESCE(${body.phone || null}, phone),
        email = COALESCE(${body.email || null}, email),
        source = COALESCE(${body.source || null}, source),
        status = COALESCE(${body.status || null}, status)
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await sql`DELETE FROM leads WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
