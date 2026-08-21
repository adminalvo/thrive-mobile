import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, programId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["super_admin", "admin", "staff", "sales"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, programId } = await params;
    const body = await req.json();
    
    const res = await sql`
      UPDATE student_programs 
      SET program_name = ${body.name}, 
          monthly_payment = ${body.price}, 
          status = ${body.status}
      WHERE id = ${programId} AND student_id = ${id}
      RETURNING *
    `;

    if(res.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const p = res[0];
    return NextResponse.json({
      id: p.id,
      name: p.program_name,
      price: p.monthly_payment,
      date: p.joined_date,
      status: p.status
    });
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, programId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["super_admin", "admin", "staff", "sales"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, programId } = await params;
    
    await sql`
      DELETE FROM student_programs 
      WHERE id = ${programId} AND student_id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
