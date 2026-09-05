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

    const [periods, paymentsList, expensesList, staffTxs] = await Promise.all([
      sql`
        SELECT 
          id, 
          code, 
          name, 
          start_date::text as "startDate", 
          end_date::text as "endDate", 
          status, 
          opening_balance::float as "openingBalance", 
          notes, 
          created_at
        FROM financial_periods
        ORDER BY code DESC
      `,
      sql`
        SELECT student_id, COALESCE(paid_amount, amount, 0)::float as amount, status, COALESCE(payment_date, created_at)::text as payment_date
        FROM payments
      `.catch(() => []),
      sql`
        SELECT category, amount::float as amount, COALESCE(expense_date, created_at)::text as date
        FROM expenses
      `.catch(() => []),
      sql`
        SELECT period_code, amount::float as amount
        FROM staff_payroll_transactions
      `.catch(() => [])
    ]);

    const enriched = periods.map(p => {
      const pCode = p.code;
      const periodRev = paymentsList
        .filter((pm: any) => {
          const isPaid = pm.status === 'PAID' || pm.status === 'COMPLETED' || pm.status === 'Qəbul edildi';
          if (!isPaid) return false;
          const dt = (pm.payment_date || '').toString();
          return dt.startsWith(pCode);
        })
        .reduce((sum: number, pm: any) => sum + Number(pm.amount || 0), 0);

      const periodExp = expensesList
        .filter((exp: any) => (exp.date || '').toString().startsWith(pCode))
        .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);

      const periodStaffPayroll = staffTxs
        .filter((tx: any) => tx.period_code === pCode)
        .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

      const totalExpense = periodExp + periodStaffPayroll;
      const netProfit = periodRev - totalExpense;
      const profitMargin = periodRev > 0 ? ((netProfit / periodRev) * 100).toFixed(1) + '%' : '0.0%';

      return {
        ...p,
        totalRevenue: periodRev,
        totalExpenses: totalExpense,
        totalExpense: totalExpense,
        netProfit,
        profitMargin
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("Fetch periods error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch periods" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) {
      return errorResponse;
    }

    const body = await req.json();
    const code = (body.code || "").trim();
    const name = (body.name || "").trim();
    const startDate = body.startDate || body.start_date;
    const endDate = body.endDate || body.end_date;
    const notes = body.notes || "";
    const status = body.status || "ACTIVE";
    const cloneFromPeriod = body.cloneFromPeriod || "2026-09";

    if (!code || !name || !startDate || !endDate) {
      return NextResponse.json({ error: "Kod, ad, başlanğıc və bitmə tarixləri tələb olunur" }, { status: 400 });
    }

    // Compute opening balance from current active bank accounts
    const accBalances = await sql`
      SELECT COALESCE(SUM(initial_balance), 0)::float as total
      FROM bank_accounts
      WHERE is_active = true
    `;
    const computedOpeningBalance = accBalances[0]?.total || 0;

    const periodId = `fp-${code}`;

    let newPeriod: any = null;

    await sql.begin(async sql => {
      // 1. Insert Period
      const [inserted] = await sql`
        INSERT INTO financial_periods (id, code, name, start_date, end_date, opening_balance, notes, status)
        VALUES (
          ${periodId}, 
          ${code}, 
          ${name}, 
          ${startDate}, 
          ${endDate}, 
          ${computedOpeningBalance}, 
          ${notes}, 
          ${status}
        )
        ON CONFLICT (code) DO UPDATE
        SET 
          name = EXCLUDED.name,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          opening_balance = EXCLUDED.opening_balance,
          notes = EXCLUDED.notes,
          status = EXCLUDED.status
        RETURNING id, code, name, start_date::text as "startDate", end_date::text as "endDate", status, opening_balance::float as "openingBalance", notes
      `;
      newPeriod = inserted;

      // 2. Rollover Student Enrollments (Full Roster)
      // Checks if new period already has enrollments, if not, clone from cloneFromPeriod!
      const existingEnrollments = await sql`SELECT id FROM student_course_enrollments WHERE period_code = ${code} LIMIT 1`;
      if (existingEnrollments.length === 0) {
        // First try to clone from selected cloneFromPeriod
        const sourceEnrollments = await sql`SELECT id FROM student_course_enrollments WHERE period_code = ${cloneFromPeriod} LIMIT 1`;
        const effectiveSourcePeriod = sourceEnrollments.length > 0 
          ? cloneFromPeriod 
          : (await sql`SELECT period_code FROM student_course_enrollments ORDER BY created_at DESC LIMIT 1`)[0]?.period_code || cloneFromPeriod;

        await sql`
          INSERT INTO student_course_enrollments (
            student_id, student_name, subject, type, teacher_name, payment_day, amount, lesson_count, 
            status, payment_method, student_phone, parent_name, parent_phone, period_code
          )
          SELECT 
            student_id, student_name, subject, type, teacher_name, payment_day, amount, lesson_count,
            'Not asked', NULL, student_phone, parent_name, parent_phone, ${code}
          FROM student_course_enrollments
          WHERE period_code = ${effectiveSourcePeriod};
        `;
      }

      // 3. Rollover Recurring Expenses (Arenda, Kommunal, Internet, Marketinq, Vergilər, Heyət Maaşları)
      const existingExpenses = await sql`
        SELECT id FROM expenses 
        WHERE (expense_date >= ${startDate} AND expense_date <= ${endDate})
           OR created_at::text LIKE ${code + '%'}
        LIMIT 1
      `;
      if (existingExpenses.length === 0) {
        // Fetch unique latest recurring expenses from previous period or overall standard expenses
        const fromDate = cloneFromPeriod ? `${cloneFromPeriod}-01` : '2026-09-01';
        const toDate = cloneFromPeriod ? `${cloneFromPeriod}-31` : '2026-09-31';

        const sourceExpenses = await sql`
          SELECT id FROM expenses 
          WHERE (expense_date >= ${fromDate} AND expense_date <= ${toDate})
             OR created_at::text LIKE ${cloneFromPeriod + '%'}
          LIMIT 1
        `;

        if (sourceExpenses.length > 0) {
          await sql`
            INSERT INTO expenses (category, amount, contract_amount, paid_amount, remaining_amount, expense_date, description)
            SELECT DISTINCT ON (category)
              category, 
              0, 
              COALESCE(contract_amount, amount, 0), 
              0, 
              COALESCE(contract_amount, amount, 0), 
              ${startDate}::date, 
              description
            FROM expenses
            WHERE (expense_date >= ${fromDate} AND expense_date <= ${toDate})
               OR created_at::text LIKE ${cloneFromPeriod + '%'}
            ORDER BY category, created_at DESC
          `;
        } else {
          // Fallback to distinct existing standard categories from the entire expenses table
          await sql`
            INSERT INTO expenses (category, amount, contract_amount, paid_amount, remaining_amount, expense_date, description)
            SELECT DISTINCT ON (category)
              category, 
              0, 
              COALESCE(contract_amount, amount, 0), 
              0, 
              COALESCE(contract_amount, amount, 0), 
              ${startDate}::date, 
              description
            FROM expenses
            ORDER BY category, created_at DESC
          `;
        }
      }
    });

    // Audit Log
    await logAction("CREATE_FINANCIAL_PERIOD_WITH_ROLLOVER", { code, name, startDate, endDate, cloneFrom: cloneFromPeriod }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, data: newPeriod });
  } catch (error: any) {
    console.error("Create period error:", error);
    return NextResponse.json({ error: error.message || "Failed to create period" }, { status: 500 });
  }
}
