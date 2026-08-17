export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const parentRows = await sql`
      SELECT p.id, p.full_name as name, p.phone, p.email, p.fin_code as fin, p.id_card_number as idCard
      FROM parents p
      JOIN student_parents sp ON p.id = sp.parent_id
      LIMIT 1
    `;
    return NextResponse.json(parentRows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
