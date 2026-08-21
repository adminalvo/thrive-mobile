import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["super_admin", "admin", "staff", "sales"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const res = await sql`
      INSERT INTO student_programs (student_id, program_name, monthly_payment, joined_date, status)
      VALUES (${id}, ${body.name}, ${body.price}, ${body.date || new Date().toISOString().split("T")[0]}, ${body.status || "ACTIVE"})
      RETURNING *
    `;

    const p = res[0];
    return NextResponse.json({
      id: p.id,
      name: p.program_name,
      price: p.monthly_payment,
      date: p.joined_date,
      status: p.status
    });
  } catch (error) {
    console.error("Add program error:", error);
    return NextResponse.json({ error: "Failed to add program" }, { status: 500 });
  }
}
