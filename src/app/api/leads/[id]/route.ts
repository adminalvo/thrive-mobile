export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const programsJson = body.programs !== undefined 
      ? (Array.isArray(body.programs) ? JSON.stringify(body.programs) : '[]')
      : null;

    const updated = await sql`
      UPDATE leads
      SET 
        name = COALESCE(${body.name || null}, name),
        phone = COALESCE(${body.phone || null}, phone),
        email = COALESCE(${body.email || null}, email),
        source = COALESCE(${body.source || null}, source),
        status = COALESCE(${body.status || null}, status),
        parent_name = COALESCE(${body.parent_name !== undefined ? body.parent_name : null}, parent_name),
        parent_phone = COALESCE(${body.parent_phone !== undefined ? body.parent_phone : null}, parent_phone),
        programs = CASE WHEN ${programsJson}::text IS NOT NULL THEN ${programsJson}::jsonb ELSE programs END,
        lesson_type = COALESCE(${body.lesson_type || null}, lesson_type),
        notes = COALESCE(${body.notes !== undefined ? body.notes : null}, notes)
      WHERE id = ${id}
      RETURNING *
    `;

    const cleanLead = {
      ...updated[0],
      programs: Array.isArray(updated[0].programs) 
        ? updated[0].programs 
        : (typeof updated[0].programs === 'string' ? JSON.parse(updated[0].programs || '[]') : [])
    };

    return NextResponse.json(cleanLead);
  } catch (error) {
    console.error("Leads PUT error:", error);
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
    console.error("Leads DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
