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
    const address = body.address !== undefined ? body.address : null;
    const manager_name = body.manager_name !== undefined ? body.manager_name : (body.managerName !== undefined ? body.managerName : null);
    
    const rentRaw = body.monthly_rent !== undefined ? body.monthly_rent : body.monthlyRent;
    const monthly_rent = (rentRaw !== undefined && rentRaw !== "" && rentRaw !== null) ? Number(rentRaw) : null;

    const utilRaw = body.utility_budget !== undefined ? body.utility_budget : body.utilityBudget;
    const utility_budget = (utilRaw !== undefined && utilRaw !== "" && utilRaw !== null) ? Number(utilRaw) : null;

    const capacity = body.capacity !== undefined ? body.capacity : null;
    const phone = body.phone !== undefined ? body.phone : null;
    const notes = body.notes !== undefined ? body.notes : null;

    const updated = await sql`
      UPDATE branches
      SET 
        name = COALESCE(${name}, name),
        address = COALESCE(${address}, address),
        manager_name = COALESCE(${manager_name}, manager_name),
        monthly_rent = COALESCE(${monthly_rent}, monthly_rent),
        utility_budget = COALESCE(${utility_budget}, utility_budget),
        capacity = COALESCE(${capacity}, capacity),
        phone = COALESCE(${phone}, phone),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING id, name, address, manager_name, monthly_rent::float as monthly_rent, utility_budget::float as utility_budget, capacity, phone, notes, is_active
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Filial tapılmadı" }, { status: 404 });
    }

    // Audit Log
    await logAction("UPDATE_BRANCH", { branchId: id, name }, (session?.user as any)?.id);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Update branch error:", error);
    return NextResponse.json({ error: error.message || "Failed to update branch" }, { status: 500 });
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
      DELETE FROM branches WHERE id = ${id}
    `;

    // Audit Log
    await logAction("DELETE_BRANCH", { branchId: id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Filial silindi" });
  } catch (error: any) {
    console.error("Delete branch error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete branch" }, { status: 500 });
  }
}
