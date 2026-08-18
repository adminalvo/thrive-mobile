export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // First fetch current status
    const student = await sql`SELECT status FROM students WHERE id = ${id}`;
    if (student.length === 0) {
      return NextResponse.json({ error: "Tələbə tapılmadı" }, { status: 404 });
    }

    const currentStatus = student[0].status || "";
    const newStatus = currentStatus.toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Update status
    await sql`
      UPDATE students 
      SET status = ${newStatus} 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Toggle student status error:", error);
    return NextResponse.json({ error: "Səhv baş verdi" }, { status: 500 });
  }
}
