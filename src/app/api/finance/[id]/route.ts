export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkApiPermission } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const authCheck = await checkApiPermission('finance', 'update');
    if (!authCheck.authorized) return authCheck.error;

    const existingRes = await sql`SELECT * FROM invoices WHERE id = ${id}`;
    if (existingRes.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const current = existingRes[0];
    const amount = body.amount !== undefined ? Number(body.amount) : Number(current.amount);
    const paid_amount = body.paid_amount !== undefined 
      ? Number(body.paid_amount) 
      : (body.paidAmount !== undefined ? Number(body.paidAmount) : Number(current.paid_amount));
    
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

    const rawDueDate = body.due_date || body.dueDate;
    const dueDate = rawDueDate ? new Date(rawDueDate) : (current.due_date ? new Date(current.due_date) : null);
    const paymentMethod = body.payment_method || body.paymentMethod || current.payment_method || "CASH";

    const updated = await sql`
      UPDATE invoices
      SET 
        amount = ${amount},
        status = ${status},
        due_date = ${dueDate}
      WHERE id = ${id}
      RETURNING *
    `;

    // Also update payments if paid_amount changed
    if (paid_amount > Number(current.paid_amount || 0)) {
      const diff = paid_amount - Number(current.paid_amount || 0);
      await sql`
        INSERT INTO payments (invoice_id, student_id, amount, payment_method, payment_date, created_at)
        VALUES (${id}, ${current.student_id}, ${diff}, ${paymentMethod}, NOW(), NOW())
      `;
    }

    const p = updated[0];

    // Fetch student info
    const studentInfo = await sql`
      SELECT pr.first_name, pr.last_name, pr.phone, pr.email
      FROM students s
      LEFT JOIN user_profiles pr ON s.profile_id = pr.id
      WHERE s.id = ${p.student_id}
    `;

    const s = studentInfo[0] || {};
    const studentName = s.first_name ? `${s.first_name} ${s.last_name || ""}`.trim() : "Tələbə";

    const formatted = {
      id: p.id,
      studentId: p.student_id,
      studentName,
      amount: Number(p.amount),
      paidAmount: Number(p.paid_amount),
      status: p.status,
      dueDate: p.due_date ? new Date(p.due_date).toISOString() : new Date().toISOString(),
      createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      date: p.created_at,
      paymentMethod: p.payment_method || "CASH",
      student: {
        id: p.student_id,
        name: studentName,
        phone: s.phone || "Qeyd edilməyib",
        email: s.email || "",
        user: {
          name: studentName
        }
      }
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Finance PUT error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCheck = await checkApiPermission('finance', 'delete');
    if (!authCheck.authorized) return authCheck.error;

    const { id } = await params;

    // Delete associated payments first (if no cascade)
    await sql`DELETE FROM payments WHERE invoice_id = ${id}`;

    const result = await sql`
      DELETE FROM invoices
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Finance DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
