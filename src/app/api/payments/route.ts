export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId || body.invoice_id;
    const studentId = body.studentId || body.student_id;
    const amount = Number(body.amount);
    const paymentMethod = body.paymentMethod || body.payment_method || "Nağd";

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than 0" }, { status: 400 });
    }

    if (!invoiceId && !studentId) {
      return NextResponse.json({ error: "invoiceId or student_id is required" }, { status: 400 });
    }

    let p: any;
    
    await sql.begin(async (tx: any) => {
      let targetUserId = studentId;

      if (invoiceId) {
        const existingRes = await tx`SELECT * FROM invoices WHERE id = ${invoiceId}`;
        if (existingRes.length === 0) {
          throw new Error("Invoice not found");
        }

        const current = existingRes[0];
        targetUserId = current.student_id;
        const totalAmount = Number(current.amount) || 0;
        
        const paidSoFarRes = await tx`SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ${invoiceId}`;
        const currentPaid = Number(paidSoFarRes[0].total_paid) || 0;
        
        const newPaidAmount = currentPaid + amount;

        let newStatus = "PARTIAL";
        if (newPaidAmount >= totalAmount && totalAmount > 0) {
          newStatus = "PAID";
        }

        await tx`
          UPDATE invoices
          SET status = ${newStatus}, updated_at = NOW()
          WHERE id = ${invoiceId}
        `;

        const inserted = await tx`
          INSERT INTO payments (invoice_id, student_id, amount, payment_method, payment_date, created_at)
          VALUES (${invoiceId}, ${targetUserId}, ${amount}, ${paymentMethod}, NOW(), NOW())
          RETURNING *
        `;
        p = inserted[0];
      } else {
        throw new Error("Direct payments without an invoice are not supported in the new schema.");
      }
    });

    return NextResponse.json({ success: true, payment: p }, { status: 201 });
  } catch (error: any) {
    console.error("Payment process error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 });
  }
}
