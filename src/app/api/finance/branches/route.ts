export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

    const branches = await sql`
      SELECT 
        id, 
        name, 
        address, 
        manager_name, 
        monthly_rent::float as monthly_rent,
        utility_budget::float as utility_budget,
        capacity,
        phone,
        notes,
        is_active, 
        created_at
      FROM branches
      WHERE is_active = true
      ORDER BY created_at ASC
    `;

    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Fetch branches error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

    const body = await req.json();
    const name = body.name || "";
    const address = body.address || "";
    const manager_name = body.manager_name !== undefined ? body.manager_name : (body.managerName || "");
    const rentRaw = body.monthly_rent !== undefined ? body.monthly_rent : body.monthlyRent;
    const monthly_rent = (rentRaw !== undefined && rentRaw !== "" && rentRaw !== null) ? Number(rentRaw) : 0;
    const utilRaw = body.utility_budget !== undefined ? body.utility_budget : body.utilityBudget;
    const utility_budget = (utilRaw !== undefined && utilRaw !== "" && utilRaw !== null) ? Number(utilRaw) : 0;
    const capacity = body.capacity || "";
    const phone = body.phone || "";
    const notes = body.notes || "";

    const finalName = (name && name.trim()) ? name.trim() : "Yeni Filial";
    const branchId = finalName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);

    const inserted = await sql`
      INSERT INTO branches (
        id, name, address, manager_name, monthly_rent, utility_budget, capacity, phone, notes
      )
      VALUES (
        ${branchId}, 
        ${finalName}, 
        ${address}, 
        ${manager_name}, 
        ${monthly_rent}, 
        ${utility_budget}, 
        ${capacity}, 
        ${phone}, 
        ${notes}
      )
      RETURNING id, name, address, manager_name, monthly_rent::float as monthly_rent, utility_budget::float as utility_budget, capacity, phone, notes, is_active
    `;

    // Audit Log
    await logAction("CREATE_BRANCH", { branchId, name: finalName }, (session?.user as any)?.id);

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Create branch error:", error);
    return NextResponse.json({ error: error.message || "Failed to create branch" }, { status: 500 });
  }
}
