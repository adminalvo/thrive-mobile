export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // 1. Fetch student & user profile
    const studentRows = await sql`
      SELECT 
        s.id,
        s.created_at,
        s.program,
        s.monthly_payment,
        s.duration_months,
        s.total_price,
        s.signed_contract_url,
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        u.id as user_id,
        u.role
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      LEFT JOIN auth.users u ON p.user_id = u.id
      WHERE s.id = ${id}
    `;

    if (studentRows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const s = studentRows[0];
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir";

    // 2. Fetch linked parents from student_parents
    let parentsList: any[] = [];
    try {
      const parentRows = await sql`
        SELECT p.id, up.first_name || ' ' || up.last_name as name, up.phone, au.email, p.fin_code as fin, p.id_card_number as idCard
        FROM parents p
        JOIN student_parents sp ON p.id = sp.parent_id
        LEFT JOIN user_profiles up ON p.profile_id = up.id
        LEFT JOIN auth.users au ON up.user_id = au.id
        WHERE sp.student_id = ${id}
      `;
      parentsList = parentRows;
    } catch (e) {
      console.error("Fetch student parents error:", e);
    }

    // 3. Fetch student invoices/payments
    let payments: any[] = [];
    try {
      const paymentRows = await sql`
        SELECT 
          i.id,
          i.amount,
          i.status,
          i.created_at,
          COALESCE((SELECT SUM(amount) FROM payments p WHERE p.invoice_id = i.id), 0) as paid_amount
        FROM invoices i
        WHERE i.student_id = ${id} OR i.student_id = ${s.user_id} OR i.student_id = ${s.profile_id}
        ORDER BY i.created_at DESC
      `;
      payments = paymentRows.map((p: any) => {
        const amt = Number(p.amount) || 0;
        const paidAmt = Number(p.paid_amount) || 0;
        return {
          id: p.id,
          amount: amt,
          paidAmount: paidAmt,
          status: p.status || (paidAmt >= amt && amt > 0 ? "PAID" : "PENDING"),
          date: p.created_at || new Date().toISOString(),
          dueDate: p.created_at || new Date().toISOString()
        };
      });
    } catch (e) {
      console.error("Fetch student payments error:", e);
    }

    // 4. Fetch groups associated with student
    let groups: any[] = [];
    try {
      const groupRows = await sql`
        SELECT 
          g.id,
          g.name,
          g.room,
          g.created_at,
          pr.name as program,
          COALESCE(tp.first_name || ' ' || tp.last_name, u.email, 'Müəllim təyin edilməyib') as teacher
        FROM group_students gs
        JOIN groups g ON gs.group_id = g.id
        LEFT JOIN programs pr ON g.program_id = pr.id
        LEFT JOIN auth.users u ON g.teacher_id = u.id
        LEFT JOIN teachers t ON g.teacher_id = t.id
        LEFT JOIN user_profiles tp ON t.profile_id = tp.id
        WHERE gs.student_id = ${id} OR gs.student_id = ${s.user_id} OR gs.student_id = ${s.profile_id}
        ORDER BY g.created_at DESC
      `;
      groups = groupRows.map((g: any) => ({
        id: g.id,
        name: g.name,
        program: g.program || "Ümumi Proqram",
        teacher: g.teacher || "Təyin edilməyib",
        room: g.room || "Room 101",
        schedule: "B.e, Ç.a 10:00 - 12:00"
      }));
    } catch (e) {
      console.error("Fetch student groups error:", e);
    }

    // 5. Fetch actual attendance records
    let attendance: any[] = [];
    try {
      const attRows = await sql`
        SELECT 
          a.id,
          a.date,
          g.name as group_name,
          a.status,
          a.notes
        FROM attendance a
        LEFT JOIN groups g ON a.group_id = g.id
        WHERE a.student_id = ${id} OR a.student_id = ${s.user_id} OR a.student_id = ${s.profile_id}
        ORDER BY a.date DESC
      `;
      attendance = attRows.map((a: any) => ({
        id: a.id,
        date: a.date ? new Date(a.date).toISOString().split('T')[0] : "",
        groupName: a.group_name || "Bilinmir",
        status: (a.status || "").toUpperCase() === "PRESENT" ? "PRESENT" : ((a.status || "").toUpperCase() === "LATE" ? "LATE" : "ABSENT"),
        notes: a.notes || ""
      }));
    } catch (e) {
      console.error("Fetch attendance error:", e);
    }

    // 6. Stats calculation
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const totalDebt = payments.reduce((sum, p) => sum + Math.max(0, (Number(p.amount) || 0) - (Number(p.paidAmount) || 0)), 0);

    const totalDue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const presentCount = attendance.filter(a => a.status === "PRESENT").length;
    const totalAttendance = attendance.length;

    // 7. Combine all
    return NextResponse.json({
      student: {
        id: s.id,
        firstName: s.first_name || "",
        lastName: s.last_name || "",
        name: fullName,
        email: s.email || "",
        phone: s.phone || "",
        fin: s.fin_code || "",
        idCard: s.id_card_number || "",
        status: s.status || "Aktiv",
        joinDate: s.created_at || new Date().toISOString(),
        program: s.program || "",
        monthlyPayment: s.monthly_payment || 0,
        durationMonths: s.duration_months || 0,
        totalPrice: s.total_price || 0,
        signedContractUrl: s.signed_contract_url || null
      },
      parents: parentsList,
      groups,
      payments,
      attendance,
      stats: {
        totalPaid,
        totalDebt: Math.max(0, totalDue - totalPaid),
        attendanceRate: (totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100) + "%",
        enrolledGroupsCount: groups.length
      }
    });
  } catch (error: any) {
    console.error("Get Student Profile Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch student profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await sql`DELETE FROM students WHERE id = ${id}`;

    await logAction("DELETE_STUDENT", { studentId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Student Error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    const data = await req.json();

    const studentRows = await sql`SELECT profile_id FROM students WHERE id = ${id}`;
    if (studentRows.length > 0 && studentRows[0].profile_id) {
      const profileId = studentRows[0].profile_id;
      if (data.name || data.phone || data.email) {
        const nameParts = (data.name || "").trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        await sql`
          UPDATE user_profiles
          SET 
            first_name = COALESCE(${firstName || null}, first_name),
            last_name = COALESCE(${lastName || null}, last_name),
            phone = COALESCE(${data.phone || null}, phone),
            email = COALESCE(${data.email || null}, email)
          WHERE id = ${profileId}
        `;
      }
      
      const programStr = data.program !== undefined ? data.program : (Array.isArray(data.programs) ? data.programs.join(", ") : data.programs);
      
      await sql`
        UPDATE students
        SET 
          program = COALESCE(${programStr || null}, program),
          fin_code = COALESCE(${data.fin || null}, fin_code),
          id_card_number = COALESCE(${data.idCard || null}, id_card_number)
        WHERE id = ${id}
      `;
    }

    await logAction("UPDATE_STUDENT", { studentId: id, updates: data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Student Error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
