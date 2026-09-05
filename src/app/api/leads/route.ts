export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff", "teacher"]);
    if (!authorized) {
      return errorResponse;
    }

    const leads = await sql`
      SELECT l.*, p.first_name, p.last_name 
      FROM leads l
      LEFT JOIN user_profiles p ON l.created_by = p.id
      ORDER BY l.created_at DESC
    `;
    
    const formattedLeads = leads.map(l => ({
      ...l,
      programs: Array.isArray(l.programs) 
        ? l.programs 
        : (typeof l.programs === 'string' ? JSON.parse(l.programs || '[]') : []),
      creatorName: l.first_name ? `${l.first_name} ${l.last_name || ''}`.trim() : null
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

    const userId = (session?.user as any)?.id || null;

    const body = await req.json();
    const { 
      name, 
      phone, 
      email, 
      source, 
      status, 
      parent_name, 
      parent_phone, 
      programs, 
      lesson_type, 
      notes 
    } = body;

    const result = await sql`
      INSERT INTO leads (
        name, phone, email, source, status, 
        parent_name, parent_phone, programs, 
        lesson_type, notes, created_by
      )
      VALUES (
        ${name}, 
        ${phone}, 
        ${email || null}, 
        ${source || 'other'}, 
        ${status || 'new'}, 
        ${parent_name || null}, 
        ${parent_phone || null}, 
        ${JSON.stringify(programs || [])}, 
        ${lesson_type || 'group'}, 
        ${notes || null}, 
        ${userId}
      )
      RETURNING *
    `;

    await logAction("CREATE_LEAD", { leadId: result[0].id, name, phone }, userId);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Leads POST error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
