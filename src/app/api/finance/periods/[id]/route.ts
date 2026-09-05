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

    const { id } = await params;
    const body = await req.json();
    const name = body.name !== undefined ? body.name : null;
    const startDate = (body.startDate !== undefined && body.startDate !== "") ? body.startDate : (body.start_date || null);
    const endDate = (body.endDate !== undefined && body.endDate !== "") ? body.endDate : (body.end_date || null);
    
    const obRaw = body.openingBalance !== undefined ? body.openingBalance : body.opening_balance;
    const openingBalance = (obRaw !== undefined && obRaw !== "" && obRaw !== null) ? Number(obRaw) : null;
    
    const notes = body.notes !== undefined ? body.notes : null;
    const status = body.status !== undefined ? body.status : null;

    const updated = await sql`
      UPDATE financial_periods
      SET 
        name = COALESCE(${name}, name),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date),
        opening_balance = COALESCE(${openingBalance}, opening_balance),
        notes = COALESCE(${notes}, notes),
        status = COALESCE(${status}, status)
      WHERE id = ${id} OR code = ${id}
      RETURNING id, code, name, start_date::text as "startDate", end_date::text as "endDate", status, opening_balance::float as "openingBalance", notes
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Dövr tapılmadı" }, { status: 404 });
    }

    // Audit Log
    await logAction("UPDATE_FINANCIAL_PERIOD", { periodId: id, name, status }, (session?.user as any)?.id);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Update period error:", error);
    return NextResponse.json({ error: error.message || "Failed to update period" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

    const { id } = await params;

    await sql`
      DELETE FROM financial_periods 
      WHERE id = ${id} OR code = ${id}
    `;

    // Audit Log
    await logAction("DELETE_FINANCIAL_PERIOD", { periodId: id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Dövr silindi" });
  } catch (error: any) {
    console.error("Delete period error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete period" }, { status: 500 });
  }
}
