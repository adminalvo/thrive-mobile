export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";
import { checkApiPermission } from "@/lib/auth-utils";


export async function GET() {
  try {
    const authCheck = await checkApiPermission('finance', 'read');
    if (!authCheck.authorized) return authCheck.error;

    const invoices = await sql`
      SELECT 
        i.id,
        i.student_id,
        i.amount,
        i.due_date,
        i.status,
        i.created_at,
        COALESCE(s.id, i.student_id) AS crm_student_id,
        pr.first_name,
        pr.last_name,
        pr.phone,
        pr.email,
        pa.full_name as parent_name,
        pa.address as parent_address,
        pa.fin_code as parent_fin,
        pa.id_card_number as parent_id_card,
        s.contract_details,
        s.dob as student_dob,
        s.address as student_address,
        s.fin_code as student_fin,
        s.id_card_number as student_id_card,
        COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS paid_amount
      FROM invoices i
      LEFT JOIN auth.users u ON i.student_id = u.id
      LEFT JOIN user_profiles pr ON pr.user_id = u.id OR i.student_id = pr.id
      LEFT JOIN students s ON s.profile_id = pr.id OR i.student_id = s.id
      LEFT JOIN parent_students ps ON ps.student_id = s.id
      LEFT JOIN parents pa ON pa.id = ps.parent_id OR pa.profile_id = s.profile_id
      ORDER BY i.created_at DESC
    `;

    const formatted = invoices.map((i: any) => {
      const studentName = i.first_name ? `${i.first_name} ${i.last_name || ""}`.trim() : "Tələbə";
      const amount = Number(i.amount) || 0;
      const paidAmount = Number(i.paid_amount) || 0;
      const dueDate = i.due_date ? new Date(i.due_date).toISOString() : new Date().toISOString();
      const createdAt = i.created_at ? new Date(i.created_at).toISOString() : new Date().toISOString();
      let status = i.status;
      if (paidAmount >= amount && amount > 0) status = "PAID";
      else if (paidAmount > 0) status = "PARTIAL";
      const resolvedStudentId = i.crm_student_id || i.student_id;

      return {
        id: i.id,
        studentId: resolvedStudentId,
        studentName,
        parentName: i.parent_name || "Qeyd edilməyib",
        amount,
        paidAmount,
        status,
        dueDate,
        createdAt,
        date: i.created_at,
        student: {
          id: resolvedStudentId,
          name: studentName,
          phone: i.phone || "Qeyd edilməyib",
          email: i.email || "",
          dob: i.student_dob || "",
          address: i.student_address || "",
          fin: i.student_fin || "",
          idCard: i.student_id_card || "",
          parentName: i.parent_name || "Qeyd edilməyib",
          parentAddress: i.parent_address || "",
          parentFin: i.parent_fin || "",
          parentIdCard: i.parent_id_card || "",
          contractDetails: typeof i.contract_details === 'string' ? JSON.parse(i.contract_details || '{}') : (i.contract_details || {})
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
    const authCheck = await checkApiPermission('finance', 'create');
    if (!authCheck.authorized) return authCheck.error;

    const body = await req.json();
    const rawStudentId = body.student_id || body.studentId;
    const amount = Number(body.amount) || 0;
    const paid_amount = Number(body.paid_amount !== undefined ? body.paid_amount : (body.paidAmount !== undefined ? body.paidAmount : 0));
    const rawDueDate = body.due_date || body.dueDate;
    const due_date = rawDueDate ? new Date(rawDueDate) : new Date();

    if (!rawStudentId) {
      return NextResponse.json({ error: "student_id is required" }, { status: 400 });
    }

    let resolvedStudent: any = null;
    const studentCheck = await sql`
      SELECT s.id AS student_id, p.id AS profile_id, p.user_id AS user_id, p.first_name, p.last_name, p.phone, p.email
      FROM students s
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE s.id = ${rawStudentId} OR p.id = ${rawStudentId} OR p.user_id = ${rawStudentId}
      LIMIT 1
    `;

    if (studentCheck.length > 0) resolvedStudent = studentCheck[0];

    const targetUserId = resolvedStudent ? (resolvedStudent.student_id || resolvedStudent.user_id || rawStudentId) : rawStudentId;
    let status = 'UNPAID';
    if (paid_amount >= amount && amount > 0) status = 'PAID';
    else if (paid_amount > 0) status = 'PARTIAL';

    let invoiceId: string = "";
    await sql.begin(async (tx: any) => {
      const invoice = await tx`
        INSERT INTO invoices (student_id, amount, due_date, status, created_at)
        VALUES (${targetUserId}, ${amount}, ${due_date}, ${status}, NOW())
        RETURNING *
      `;
      invoiceId = invoice[0].id;

      if (paid_amount > 0) {
        await tx`
          INSERT INTO payments (invoice_id, student_id, amount, payment_method, payment_date, created_at)
          VALUES (${invoiceId}, ${targetUserId}, ${paid_amount}, 'Nağd', NOW(), NOW())
        `;
      }
    });

    await logAction("CREATE_INVOICE", { invoiceId, studentId: targetUserId, amount, paid_amount });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Finance POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
