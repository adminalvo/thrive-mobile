export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId || body.invoice_id;
    const studentId = body.studentId || body.student_id;
    const amount = Number(body.amount);
    const paymentMethod = body.paymentMethod || body.payment_method || "CASH";

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than 0" }, { status: 400 });
    }

    if (!invoiceId && !studentId) {
      return NextResponse.json({ error: "invoiceId or student_id is required" }, { status: 400 });
    }

    let p: any;
    let resolvedStudent: any = null;

    if (invoiceId) {
      const existingRes = await sql`SELECT * FROM payments WHERE id = ${invoiceId}`;
      if (existingRes.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const current = existingRes[0];
      const totalAmount = Number(current.amount) || 0;
      const currentPaid = Number(current.paid_amount) || 0;
      const newPaidAmount = currentPaid + amount;

      let newStatus = body.status || "PARTIAL";
      if (newPaidAmount >= totalAmount && totalAmount > 0) {
        newStatus = "PAID";
      }

      const updated = await sql`
        UPDATE payments
        SET 
          paid_amount = ${newPaidAmount},
          status = ${newStatus},
          payment_method = ${paymentMethod}
        WHERE id = ${invoiceId}
        RETURNING *
      `;
      p = updated[0];
    } else {
      // Resolve student foreign key reference (payments.student_id references auth.users(id))
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
        WHERE s.id = ${studentId} OR p.id = ${studentId} OR p.user_id = ${studentId}
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
          WHERE u.id = ${studentId} OR p.id = ${studentId}
          LIMIT 1
        `;
        if (userCheck.length === 0) {
          return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        resolvedStudent = userCheck[0];
      }

      const targetUserId = resolvedStudent.user_id;
      const status = body.status || "PAID";

      const inserted = await sql`
        INSERT INTO payments (student_id, amount, paid_amount, status, due_date, payment_method, created_at)
        VALUES (${targetUserId}, ${amount}, ${amount}, ${status}, NOW(), ${paymentMethod}, NOW())
        RETURNING *
      `;
      p = inserted[0];
    }

    // Fetch student info for returned payload if not already resolved
    if (!resolvedStudent) {
      const studentInfo = await sql`
        SELECT 
          s.id AS student_id,
          pr.first_name, 
          pr.last_name, 
          pr.phone, 
          pr.email
        FROM auth.users u
        LEFT JOIN user_profiles pr ON pr.user_id = u.id
        LEFT JOIN students s ON s.profile_id = pr.id
        WHERE u.id = ${p.student_id} OR pr.id = ${p.student_id} OR s.id = ${p.student_id}
        LIMIT 1
      `;
      resolvedStudent = studentInfo[0] || {};
    }

    const studentName = resolvedStudent.first_name 
      ? `${resolvedStudent.first_name} ${resolvedStudent.last_name || ""}`.trim() 
      : "Tələbə";
    const studentDbId = resolvedStudent.student_id || studentId;

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
        phone: resolvedStudent.phone || "Qeyd edilməyib",
        email: resolvedStudent.email || "",
        user: {
          name: studentName
        }
      }
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("Payment process error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
