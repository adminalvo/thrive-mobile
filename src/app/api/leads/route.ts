export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
    return NextResponse.json(leads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, source, status } = body;

    const lead = await sql`
      INSERT INTO leads (name, phone, email, source, status)
      VALUES (${name}, ${phone}, ${email}, ${source}, ${status})
      RETURNING *
    `;

    return NextResponse.json(lead[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
