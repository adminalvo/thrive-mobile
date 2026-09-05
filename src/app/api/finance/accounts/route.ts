export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const accounts = await sql`
      SELECT 
        id, 
        name, 
        code, 
        bank_name, 
        account_number, 
        initial_balance::float as initial_balance, 
        currency, 
        is_active, 
        created_at, 
        updated_at
      FROM bank_accounts
      WHERE is_active = true
      ORDER BY created_at ASC
    `;

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const action = body.action || "CREATE_ACCOUNT";

    // 1. INTERNAL TRANSFER BETWEEN ACCOUNTS
    if (action === "TRANSFER") {
      const { sourceAccountId, destinationAccountId, amount, note, date, periodCode = "2026-09" } = body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return NextResponse.json({ error: "Düzgün köçürmə məbləği daxil edin" }, { status: 400 });
      }
      if (sourceAccountId === destinationAccountId) {
        return NextResponse.json({ error: "Mənbə və hədəf hesab eyni ola bilməz" }, { status: 400 });
      }

      const [src] = await sql`SELECT id, name FROM bank_accounts WHERE id::text = ${sourceAccountId} OR code = ${sourceAccountId}`;
      const [dst] = await sql`SELECT id, name FROM bank_accounts WHERE id::text = ${destinationAccountId} OR code = ${destinationAccountId}`;

      if (!src || !dst) {
        return NextResponse.json({ error: "Hesablar tapılmadı" }, { status: 404 });
      }

      const txDate = date || new Date().toISOString().split("T")[0];

      await sql.begin(async sql => {
        await sql`
          UPDATE bank_accounts 
          SET initial_balance = initial_balance - ${numAmount}, updated_at = NOW()
          WHERE id = ${src.id}
        `;
        await sql`
          UPDATE bank_accounts 
          SET initial_balance = initial_balance + ${numAmount}, updated_at = NOW()
          WHERE id = ${dst.id}
        `;

        await sql`
          INSERT INTO account_transactions (account_id, period_code, date, type, amount, comment, category)
          VALUES 
            (${src.id}, ${periodCode}, ${txDate}, 'EXPENSE', ${numAmount}, ${note || `Daxili Köçürmə ➡️ ${dst.name}`}, 'Daxili Transfer'),
            (${dst.id}, ${periodCode}, ${txDate}, 'INCOME', ${numAmount}, ${note || `Daxili Köçürmə ⬅️ ${src.name}`}, 'Daxili Transfer')
        `;
      });

      await logAction("INTERNAL_ACCOUNT_TRANSFER", { source: src.name, destination: dst.name, amount: numAmount, note }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: "Daxili transfer uğurla tamamlandı" });
    }

    // 2. ADD TRANSACTION
    if (action === "ADD_TRANSACTION") {
      const { accountId, type, amount, category, description, date, periodCode = "2026-09" } = body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return NextResponse.json({ error: "Düzgün məbləğ daxil edin" }, { status: 400 });
      }

      const txDate = date || new Date().toISOString().split("T")[0];
      const isIncome = type === "INCOME";

      const [targetAcc] = await sql`SELECT id, name FROM bank_accounts WHERE id::text = ${accountId} OR code = ${accountId}`;
      if (!targetAcc) return NextResponse.json({ error: "Hesab tapılmadı" }, { status: 404 });

      await sql.begin(async sql => {
        if (isIncome) {
          await sql`
            UPDATE bank_accounts 
            SET initial_balance = initial_balance + ${numAmount}, updated_at = NOW()
            WHERE id = ${targetAcc.id}
          `;
        } else {
          await sql`
            UPDATE bank_accounts 
            SET initial_balance = initial_balance - ${numAmount}, updated_at = NOW()
            WHERE id = ${targetAcc.id}
          `;
        }

        await sql`
          INSERT INTO account_transactions (account_id, period_code, date, type, amount, comment, category)
          VALUES (${targetAcc.id}, ${periodCode}, ${txDate}, ${type}, ${numAmount}, ${description || 'Kassa əməliyyatı'}, ${category || 'Kassa'})
        `;
      });

      await logAction("ADD_ACCOUNT_TRANSACTION", { account: targetAcc.name, type, amount: numAmount, description }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: "Əməliyyat hesaba yazıldı" });
    }

    // 3. CREATE ACCOUNT
    const { name, bank_name, account_number, initial_balance, currency = "AZN" } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Hesab adı tələb olunur" }, { status: 400 });
    }

    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20) + "_" + Date.now().toString().slice(-4);
    const [account] = await sql`
      INSERT INTO bank_accounts (name, code, bank_name, account_number, initial_balance, currency, is_active)
      VALUES (
        ${name.trim()}, 
        ${code}, 
        ${bank_name?.trim() || "Standart Bank"}, 
        ${account_number?.trim() || null}, 
        ${Number(initial_balance) || 0}, 
        ${currency}, 
        true
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error: any) {
    console.error("Accounts POST error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const { target, id, name, bank_name, account_number, initial_balance, amount, comment, category, date, type } = body;

    // A. Edit Daily Transaction
    if (target === "TRANSACTION") {
      if (!id) return NextResponse.json({ error: "Tranzaksiya ID tələb olunur" }, { status: 400 });

      const [updatedTx] = await sql`
        UPDATE account_transactions
        SET 
          amount = COALESCE(${amount ? Number(amount) : undefined}, amount),
          comment = COALESCE(${comment}, comment),
          category = COALESCE(${category}, category),
          date = COALESCE(${date}::date, date),
          type = COALESCE(${type}, type)
        WHERE id = ${id}
        RETURNING *;
      `;
      return NextResponse.json({ success: true, data: updatedTx });
    }

    // B. Edit Bank Account
    if (!id) return NextResponse.json({ error: "Hesab ID tələb olunur" }, { status: 400 });

    const finalName = name !== undefined ? (name || "").trim() : (body.name !== undefined ? (body.name || "").trim() : undefined);
    const finalBankName = bank_name !== undefined ? (bank_name || "").trim() : (body.bankName !== undefined ? (body.bankName || "").trim() : undefined);
    const finalAccountNumber = account_number !== undefined ? (account_number || "").trim() : (body.accountNumber !== undefined ? (body.accountNumber || "").trim() : undefined);
    const rawBalance = initial_balance !== undefined ? initial_balance : body.initialBalance;
    const finalInitialBalance = rawBalance !== undefined && rawBalance !== null && rawBalance !== "" ? Number(rawBalance) : undefined;

    const [updatedAcc] = await sql`
      UPDATE bank_accounts
      SET 
        name = COALESCE(${finalName}, name),
        bank_name = COALESCE(${finalBankName}, bank_name),
        account_number = COALESCE(${finalAccountNumber}, account_number),
        initial_balance = COALESCE(${finalInitialBalance}, initial_balance),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    await logAction("UPDATE_BANK_ACCOUNT", { id, name: finalName }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: updatedAcc });
  } catch (error: any) {
    console.error("Accounts PUT error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const target = searchParams.get("target") || "ACCOUNT";

    if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

    if (target === "TRANSACTION") {
      await sql`DELETE FROM account_transactions WHERE id = ${id}`;
      await logAction("DELETE_ACCOUNT_TRANSACTION", { id }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: "Əməliyyat silindi" });
    }

    // Account delete / deactivation
    await sql`UPDATE bank_accounts SET is_active = false WHERE id = ${id}`;
    await logAction("DEACTIVATE_BANK_ACCOUNT", { id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Hesab deaktiv edildi" });
  } catch (error: any) {
    console.error("Accounts DELETE error:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
