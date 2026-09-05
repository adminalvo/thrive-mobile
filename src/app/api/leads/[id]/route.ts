export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

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

    if (updated.length === 0) {
      return NextResponse.json({ error: "Lead tapılmadı" }, { status: 404 });
    }

    const cleanLead = {
      ...updated[0],
      programs: Array.isArray(updated[0].programs) 
        ? updated[0].programs 
        : (typeof updated[0].programs === 'string' ? JSON.parse(updated[0].programs || '[]') : [])
    };

    await logAction("UPDATE_LEAD", { leadId: id, name: body.name, status: body.status }, (session?.user as any)?.id);

    return NextResponse.json(cleanLead);
  } catch (error) {
    console.error("Leads PUT error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await sql`DELETE FROM leads WHERE id = ${id}`;

    await logAction("DELETE_LEAD", { leadId: id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
