export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const { id } = await params;
    const body = await req.json();
    const { name, bank_name, initial_balance, account_number, currency, code } = body;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const safeName = name !== undefined ? name : null;
    const safeBankName = bank_name !== undefined ? bank_name : null;
    const safeAccountNumber = account_number !== undefined ? account_number : null;
    const safeInitialBalance = (initial_balance !== undefined && initial_balance !== "") ? Number(initial_balance) : null;
    const safeCurrency = currency !== undefined ? currency : null;

    let updated;
    if (isUuid) {
      updated = await sql`
        UPDATE bank_accounts
        SET 
          name = COALESCE(${safeName}, name),
          bank_name = COALESCE(${safeBankName}, bank_name),
          account_number = COALESCE(${safeAccountNumber}, account_number),
          initial_balance = COALESCE(${safeInitialBalance}, initial_balance),
          currency = COALESCE(${safeCurrency}, currency),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, code, bank_name, account_number, initial_balance::float as initial_balance, currency, is_active
      `;
    } else {
      const targetCode = code || (id.startsWith('acc-') ? (
        id === 'acc-1' ? 'digihesab' :
        id === 'acc-2' ? 'leobank' :
        id === 'acc-3' ? 'nagd' :
        id === 'acc-4' ? 'tamerlan' :
        id === 'acc-5' ? 'ubank' :
        id === 'acc-6' ? 'pos' : id
      ) : id);

      updated = await sql`
        UPDATE bank_accounts
        SET 
          name = COALESCE(${safeName}, name),
          bank_name = COALESCE(${safeBankName}, bank_name),
          account_number = COALESCE(${safeAccountNumber}, account_number),
          initial_balance = COALESCE(${safeInitialBalance}, initial_balance),
          currency = COALESCE(${safeCurrency}, currency),
          updated_at = NOW()
        WHERE code = ${targetCode}
        RETURNING id, name, code, bank_name, account_number, initial_balance::float as initial_balance, currency, is_active
      `;

      if (updated.length === 0) {
        updated = await sql`
          INSERT INTO bank_accounts (
            name, code, bank_name, account_number, initial_balance, currency, is_active
          )
          VALUES (
            ${safeName || targetCode},
            ${targetCode},
            ${safeBankName || safeName || targetCode},
            ${safeAccountNumber},
            ${safeInitialBalance || 0},
            ${safeCurrency || 'AZN'},
            true
          )
          RETURNING id, name, code, bank_name, account_number, initial_balance::float as initial_balance, currency, is_active
        `;
      }
    }

    if (updated.length === 0) {
      return NextResponse.json({ error: "Hesab tapılmadı" }, { status: 404 });
    }

    // Audit Log
    await logAction("UPDATE_BANK_ACCOUNT", { accountId: id, name, initial_balance }, (session?.user as any)?.id);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: error.message || "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      await sql`DELETE FROM bank_accounts WHERE id = ${id}`;
    } else {
      const targetCode = (id.startsWith('acc-') ? (
        id === 'acc-1' ? 'digihesab' :
        id === 'acc-2' ? 'leobank' :
        id === 'acc-3' ? 'nagd' :
        id === 'acc-4' ? 'tamerlan' :
        id === 'acc-5' ? 'ubank' :
        id === 'acc-6' ? 'pos' : id
      ) : id);
      await sql`DELETE FROM bank_accounts WHERE code = ${targetCode}`;
    }

    // Audit Log
    await logAction("DELETE_BANK_ACCOUNT", { accountId: id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Hesab silindi" });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 500 });
  }
}
