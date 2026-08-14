export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL DEFAULT 0,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING',
        due_date TIMESTAMPTZ,
        payment_method TEXT DEFAULT 'CASH',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.error("CREATE TABLE payments error:", e);
  }

  try {
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_amount NUMERIC NOT NULL DEFAULT 0`;
  } catch (e) {
    console.error("ALTER TABLE payments paid_amount error:", e);
  }

  try {
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ`;
  } catch (e) {
    console.error("ALTER TABLE payments due_date error:", e);
  }

  try {
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH'`;
  } catch (e) {
    console.error("ALTER TABLE payments payment_method error:", e);
  }
}

export async function GET() {
  try {
    await ensureTable();
    const payments = await sql`
      SELECT 
        p.id,
        p.student_id,
        p.amount,
        p.paid_amount,
        p.status,
        p.due_date,
        p.payment_method,
        p.created_at,
        COALESCE(s.id, p.student_id) AS crm_student_id,
        pr.first_name,
        pr.last_name,
        pr.phone,
        pr.email
      FROM payments p
      LEFT JOIN auth.users u ON p.student_id = u.id
      LEFT JOIN user_profiles pr ON pr.user_id = u.id OR p.student_id = pr.id
      LEFT JOIN students s ON s.profile_id = pr.id OR p.student_id = s.id
      ORDER BY p.created_at DESC
    `;

    const formatted = payments.map(p => {
      const studentName = p.first_name ? `${p.first_name} ${p.last_name || ""}`.trim() : "Tələbə";
      const amount = Number(p.amount) || 0;
      const paidAmount = Number(p.paid_amount) || 0;
      const dueDate = p.due_date ? new Date(p.due_date).toISOString() : (p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString());
      const createdAt = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
      const status = p.status || (paidAmount >= amount && amount > 0 ? "PAID" : "PENDING");
      const resolvedStudentId = p.crm_student_id || p.student_id;

      return {
        id: p.id,
        studentId: resolvedStudentId,
        studentName,
        amount,
        paidAmount,
        status,
        dueDate,
        createdAt,
        date: p.created_at,
        paymentMethod: p.payment_method || "CASH",
        student: {
          id: resolvedStudentId,
          name: studentName,
          phone: p.phone || "Qeyd edilməyib",
          email: p.email || "",
          user: {
            name: studentName
          }
        }
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Finance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch finance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const rawStudentId = body.student_id || body.studentId;
    const amount = Number(body.amount) || 0;
    const paid_amount = Number(body.paid_amount !== undefined ? body.paid_amount : (body.paidAmount !== undefined ? body.paidAmount : 0));
    const rawDueDate = body.due_date || body.dueDate;
    const due_date = rawDueDate ? new Date(rawDueDate) : new Date();
    const payment_method = body.payment_method || body.paymentMethod || "CASH";

    let status = body.status;
    if (!status) {
      if (paid_amount >= amount && amount > 0) {
        status = "PAID";
      } else if (paid_amount > 0) {
        status = "PARTIAL";
      } else {
        status = "PENDING";
      }
    }

    if (!rawStudentId) {
      return NextResponse.json({ error: "student_id is required" }, { status: 400 });
    }

    let resolvedStudent: any = null;
    const studentCheck = await sql`
      SELECT 
        s.id AS student_id,
        p.id AS profile_id,
        p.user_id AS user_id,
        p.first_name,
        p.last_name,
        p.phone,
        p.email
      FROM students s
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE s.id = ${rawStudentId} OR p.id = ${rawStudentId} OR p.user_id = ${rawStudentId}
      LIMIT 1
    `;

    if (studentCheck.length > 0) {
      resolvedStudent = studentCheck[0];
    } else {
      const userCheck = await sql`
        SELECT 
          s.id AS student_id,
          p.id AS profile_id,
          COALESCE(p.user_id, u.id) AS user_id,
          p.first_name,
          p.last_name,
          p.phone,
          p.email
        FROM auth.users u
        LEFT JOIN user_profiles p ON p.user_id = u.id
        LEFT JOIN students s ON s.profile_id = p.id
        WHERE u.id = ${rawStudentId} OR p.id = ${rawStudentId}
        LIMIT 1
      `;
      if (userCheck.length > 0) {
        resolvedStudent = userCheck[0];
      }
    }

    const targetUserId = resolvedStudent ? resolvedStudent.user_id : rawStudentId;

    const payment = await sql`
      INSERT INTO payments (student_id, amount, paid_amount, status, due_date, payment_method, created_at)
      VALUES (${targetUserId}, ${amount}, ${paid_amount}, ${status}, ${due_date}, ${payment_method}, NOW())
      RETURNING *
    `;

    const p = payment[0];
    const studentDbId = resolvedStudent?.student_id || rawStudentId;
    const studentName = resolvedStudent?.first_name ? `${resolvedStudent.first_name} ${resolvedStudent.last_name || ""}`.trim() : "Tələbə";

    const formatted = {
      id: p.id,
      studentId: studentDbId,
      studentName,
      amount: Number(p.amount),
      paidAmount: Number(p.paid_amount),
      status: p.status,
      dueDate: p.due_date ? new Date(p.due_date).toISOString() : new Date().toISOString(),
      createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      date: p.created_at,
      paymentMethod: p.payment_method || "CASH",
      student: {
        id: studentDbId,
        name: studentName,
        phone: resolvedStudent?.phone || "Qeyd edilməyib",
        email: resolvedStudent?.email || "",
        user: {
          name: studentName
        }
      }
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("Finance POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
