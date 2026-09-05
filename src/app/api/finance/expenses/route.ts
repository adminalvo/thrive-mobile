export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const expenses = await sql`
      SELECT 
        id, 
        category, 
        amount::float as amount, 
        COALESCE(contract_amount, amount, 0)::float as contract_amount, 
        COALESCE(paid_amount, amount, 0)::float as paid_amount, 
        COALESCE(remaining_amount, 0)::float as remaining_amount, 
        COALESCE(expense_date, created_at)::text AS date, 
        description, 
        created_at 
      FROM expenses
      ORDER BY expense_date DESC NULLS LAST, created_at DESC
    `;

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const action = body.action || "CREATE_EXPENSE";

    // 1. PAY ON EXISTING EXPENSE
    if (action === "PAY_ON_DEBT") {
      const { id, payAmount, accountId, note } = body;
      const payment = Number(payAmount);
      if (!id || !payment || payment <= 0) {
        return NextResponse.json({ error: "Düzgün ödəniş məbləği daxil edin" }, { status: 400 });
      }

      const [exp] = await sql`SELECT * FROM expenses WHERE id = ${id}`;
      if (!exp) return NextResponse.json({ error: "Xərc tapılmadı" }, { status: 404 });

      const newPaid = Number(exp.paid_amount || exp.amount || 0) + payment;
      const newRem = Math.max(0, Number(exp.remaining_amount || 0) - payment);

      await sql.begin(async sql => {
        await sql`
          UPDATE expenses
          SET 
            paid_amount = ${newPaid},
            amount = ${newPaid},
            remaining_amount = ${newRem}
          WHERE id = ${id}
        `;

        if (accountId) {
          await sql`
            UPDATE bank_accounts
            SET initial_balance = initial_balance - ${payment}, updated_at = NOW()
            WHERE id::text = ${accountId} OR code = ${accountId}
          `;
          await sql`
            INSERT INTO account_transactions (account_id, period_code, date, type, amount, comment, category)
            VALUES (${accountId}, '2026-09', CURRENT_DATE, 'EXPENSE', ${payment}, ${note || `${exp.category} üzrə borc ödənişi`}, ${exp.category})
          `;
        }
      });

      await logAction("PAY_EXPENSE_DEBT", { id, payment, newRem }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: "Ödəniş qeydə alındı, qalıq borc yeniləndi" });
    }

    // 2. CREATE NEW EXPENSE
    const { category, amount, contractAmount, remainingAmount, date, description, branchName, accountId } = body;

    if (!category || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Kateqoriya və düzgün məbləğ tələb olunur" }, { status: 400 });
    }

    const expDate = date || new Date().toISOString().split("T")[0];
    const finalDesc = branchName 
      ? `[${branchName}] ${description || 'Filial xərci'}` 
      : (description || "Mərkəz əməliyyat xərci");

    const cAmount = contractAmount ? Number(contractAmount) : Number(amount);
    const pAmount = Number(amount);
    const rAmount = remainingAmount !== undefined ? Number(remainingAmount) : Math.max(0, cAmount - pAmount);

    let expense: any = null;
    await sql.begin(async sql => {
      const [inserted] = await sql`
        INSERT INTO expenses (category, amount, contract_amount, paid_amount, remaining_amount, expense_date, description)
        VALUES (
          ${category}, 
          ${pAmount}, 
          ${cAmount},
          ${pAmount},
          ${rAmount},
          ${expDate}, 
          ${finalDesc}
        )
        RETURNING id, category, amount::float as amount, contract_amount::float as contract_amount, paid_amount::float as paid_amount, remaining_amount::float as remaining_amount, expense_date::text as date, description, created_at
      `;
      expense = inserted;

      if (accountId) {
        await sql`
          UPDATE bank_accounts
          SET initial_balance = initial_balance - ${pAmount}, updated_at = NOW()
          WHERE id::text = ${accountId} OR code = ${accountId}
        `;
        await sql`
          INSERT INTO account_transactions (account_id, period_code, date, type, amount, comment, category)
          VALUES (${accountId}, '2026-09', ${expDate}, 'EXPENSE', ${pAmount}, ${finalDesc}, ${category})
        `;
      }
    });

    await logAction("CREATE_EXPENSE", { category, amount: pAmount, remaining: rAmount }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create expense" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const { id, category, contract_amount, paid_amount, remaining_amount, date, description } = body;

    if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

    const cAmt = contract_amount !== undefined ? Number(contract_amount) : undefined;
    const pAmt = paid_amount !== undefined ? Number(paid_amount) : undefined;
    const rAmt = remaining_amount !== undefined ? Number(remaining_amount) : (cAmt !== undefined && pAmt !== undefined ? Math.max(0, cAmt - pAmt) : undefined);

    const [updated] = await sql`
      UPDATE expenses
      SET 
        category = COALESCE(${category}, category),
        contract_amount = COALESCE(${cAmt}, contract_amount),
        paid_amount = COALESCE(${pAmt}, paid_amount),
        amount = COALESCE(${pAmt}, amount),
        remaining_amount = COALESCE(${rAmt}, remaining_amount),
        expense_date = COALESCE(${date}::date, expense_date),
        description = COALESCE(${description}, description)
      WHERE id = ${id}
      RETURNING id, category, amount::float as amount, contract_amount::float as contract_amount, paid_amount::float as paid_amount, remaining_amount::float as remaining_amount, expense_date::text as date, description
    `;

    await logAction("UPDATE_EXPENSE", { id, category, contract_amount: cAmt, paid_amount: pAmt }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Expenses PUT error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

    await sql`DELETE FROM expenses WHERE id = ${id}`;
    await logAction("DELETE_EXPENSE", { id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Xərc maddəsi silindi" });
  } catch (error: any) {
    console.error("Expenses DELETE error:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
