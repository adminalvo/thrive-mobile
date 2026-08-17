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
      creatorName: l.first_name ? `${l.first_name} ${l.last_name || ''}`.trim() : null
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const body = await req.json();
    const { name, phone, email, source, status } = body;

    const validStatus = ["NEW", "CONTACTED", "TRIAL", "REGISTERED", "LOST"].includes(status) ? status : "NEW";

    const lead = await sql`
      INSERT INTO leads (name, phone, email, source, status, created_by)
      VALUES (${name}, ${phone}, ${email || null}, ${source || 'Digər'}, ${validStatus}, ${userId})
      RETURNING *
    `;

    return NextResponse.json(lead[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
