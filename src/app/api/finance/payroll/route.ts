export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const periodCode = searchParams.get("periodCode") || "2026-09";

    // Fetch all staff users (admin, staff, teacher, super_admin)
    const staffUsers = await sql`
      SELECT 
        ur.user_id, 
        ur.role, 
        up.first_name, 
        up.last_name, 
        up.email, 
        up.phone
      FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE ur.role IN ('staff', 'teacher', 'admin', 'super_admin')
      ORDER BY up.first_name ASC NULLS LAST
    `;

    // Fetch salary configurations
    const salaries = await sql`
      SELECT 
        user_id, 
        salary_type, 
        base_amount::float as base_amount, 
        bonus_amount::float as bonus_amount, 
        notes 
      FROM staff_salaries
    `;

    // Fetch payroll transactions for the requested period
    const transactions = await sql`
      SELECT 
        id, 
        user_id, 
        period_code, 
        payment_type, 
        amount::float as amount, 
        payment_date, 
        account_code, 
        note, 
        created_at
      FROM staff_payroll_transactions
      WHERE period_code = ${periodCode}
      ORDER BY created_at DESC
    `;

    // Grouping and Deduplication of Staff Members
    const salaryMap = new Map();
    salaries.forEach(s => salaryMap.set(s.user_id, s));

    const txMap = new Map();
    transactions.forEach(t => {
      if (!txMap.has(t.user_id)) {
        txMap.set(t.user_id, []);
      }
      txMap.get(t.user_id).push(t);
    });

    const uniqueStaffMap = new Map();

    staffUsers.forEach(u => {
      const fn = u.first_name || "";
      const ln = u.last_name || "";
      const fullName = `${fn} ${ln}`.trim() || (u.email ? u.email.split('@')[0] : "Əməkdaş");
      const normKey = fullName.toLowerCase();

      const sal = salaryMap.get(u.user_id);
      const userTxs = txMap.get(u.user_id) || [];

      if (!uniqueStaffMap.has(normKey)) {
        const defaultBase = u.role === 'teacher' ? 600 : (u.role === 'admin' || u.role === 'super_admin' ? 800 : 500);
        uniqueStaffMap.set(normKey, {
          userId: u.user_id,
          allUserIds: [u.user_id],
          name: fullName,
          email: u.email || "",
          phone: u.phone || "",
          role: u.role === 'teacher' ? 'Müəllim' : (u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'İnzibatçı' : 'Menecer')),
          salaryType: sal ? sal.salary_type : 'MONTHLY_FIXED',
          baseSalary: sal ? Number(sal.base_amount) : defaultBase,
          bonusAmount: sal ? Number(sal.bonus_amount) : 0,
          totalAdvance: 0,
          transactions: [],
          notes: sal ? sal.notes : ''
        });
      } else {
        const existing = uniqueStaffMap.get(normKey);
        existing.allUserIds.push(u.user_id);
        if (sal && !salaryMap.has(existing.userId)) {
          existing.baseSalary = Number(sal.base_amount);
          existing.salaryType = sal.salary_type;
          existing.bonusAmount = Number(sal.bonus_amount);
          existing.notes = sal.notes;
        }
      }

      const entry = uniqueStaffMap.get(normKey);
      entry.transactions.push(...userTxs);
    });

    // Compute netDue and statuses
    const result = Array.from(uniqueStaffMap.values()).map(staff => {
      const totalAdvance = staff.transactions.reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
      const totalDue = staff.baseSalary + staff.bonusAmount;
      const netDue = Math.max(0, totalDue - totalAdvance);

      let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
      if (totalAdvance >= totalDue && totalDue > 0) {
        status = 'PAID';
      } else if (totalAdvance > 0) {
        status = 'PARTIAL';
      }

      return {
        ...staff,
        totalAdvance,
        netDue,
        status
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Fetch payroll error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const body = await req.json();
    const { action, userId, baseAmount, salaryType, bonusAmount, notes, periodCode, amount, paymentType, accountCode, note } = body;

    // 1. SET / UPDATE SALARY
    if (action === "SET_SALARY") {
      if (!userId || baseAmount === undefined) {
        return NextResponse.json({ error: "İstifadəçi ID və maaş məbləği tələb olunur" }, { status: 400 });
      }

      const updated = await sql`
        INSERT INTO staff_salaries (user_id, salary_type, base_amount, bonus_amount, notes, updated_at)
        VALUES (
          ${userId}, 
          ${salaryType || 'MONTHLY_FIXED'}, 
          ${Number(baseAmount) || 0}, 
          ${Number(bonusAmount) || 0}, 
          ${notes || ''}, 
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE 
        SET 
          salary_type = EXCLUDED.salary_type,
          base_amount = EXCLUDED.base_amount,
          bonus_amount = EXCLUDED.bonus_amount,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING *
      `;

      // Audit Log
      await logAction("SET_STAFF_SALARY", { userId, baseAmount, salaryType }, (session?.user as any)?.id);

      return NextResponse.json({ success: true, salary: updated[0] });
    }

    // 2. ATOMIC PAYROLL ADVANCE / SETTLEMENT TRANSACTION
    if (action === "PAY_ADVANCE" || action === "PAY_SALARY") {
      if (!userId || !amount || Number(amount) <= 0) {
        return NextResponse.json({ error: "Düzgün məbləğ daxil edin" }, { status: 400 });
      }

      const pCode = periodCode || "2026-09";
      const payType = paymentType || (action === "PAY_SALARY" ? "FULL_SALARY" : "ADVANCE");
      const accCode = accountCode || "nagd";

      // Execute in an atomic database transaction
      const txResult = await sql.begin(async sql => {
        // Step 1: Insert payroll transaction
        const [tx] = await sql`
          INSERT INTO staff_payroll_transactions (user_id, period_code, payment_type, amount, account_code, note)
          VALUES (${userId}, ${pCode}, ${payType}, ${Number(amount)}, ${accCode}, ${note || ''})
          RETURNING *
        `;

        // Step 2: Get user name for expense description
        const [userProfile] = await sql`
          SELECT first_name, last_name FROM user_profiles WHERE user_id = ${userId}
        `;
        const staffName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Əməkdaş";
        const desc = `${staffName} - ${payType === 'ADVANCE' ? 'Avans Ödənişi' : 'Əməkhaqqı'} (${pCode})${note ? ': ' + note : ''}`;

        // Step 3: Insert linked expense
        await sql`
          INSERT INTO expenses (category, amount, description, date)
          VALUES ('Müəllim Maaşı', ${Number(amount)}, ${desc}, CURRENT_DATE)
        `;

        return tx;
      });

      // Audit Log
      await logAction("PAY_STAFF_SALARY_TRANSACTION", { userId, amount, payType, periodCode: pCode }, (session?.user as any)?.id);

      return NextResponse.json({ success: true, transaction: txResult });
    }

    return NextResponse.json({ error: "Yanlış əməliyyat növü" }, { status: 400 });
  } catch (error: any) {
    console.error("Payroll action error:", error);
    return NextResponse.json({ error: error.message || "Payroll operation failed" }, { status: 500 });
  }
}
