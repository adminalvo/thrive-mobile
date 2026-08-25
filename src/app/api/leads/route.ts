export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

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

    const validStatus = ["NEW", "CONTACTED", "TRIAL", "REGISTERED", "LOST"].includes(status) ? status : "NEW";
    const programsJson = Array.isArray(programs) ? JSON.stringify(programs) : '[]';

    const lead = await sql`
      INSERT INTO leads (
        name, phone, email, source, status, created_by,
        parent_name, parent_phone, programs, lesson_type, notes
      )
      VALUES (
        ${name}, 
        ${phone}, 
        ${email || null}, 
        ${source || 'Instagram'}, 
        ${validStatus}, 
        ${userId},
        ${parent_name || null}, 
        ${parent_phone || null}, 
        ${programsJson}::jsonb, 
        ${lesson_type || 'group'}, 
        ${notes || null}
      )
      RETURNING *
    `;

    const cleanLead = {
      ...lead[0],
      programs: Array.isArray(lead[0].programs) 
        ? lead[0].programs 
        : (typeof lead[0].programs === 'string' ? JSON.parse(lead[0].programs || '[]') : [])
    };

    return NextResponse.json(cleanLead);
  } catch (error) {
    console.error("Leads POST error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
