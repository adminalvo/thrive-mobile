import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Giriş qadağandır (Forbidden)" }, { status: 403 });
    }
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
