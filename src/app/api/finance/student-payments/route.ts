export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const { searchParams } = new URL(req.url);
    const periodCode = searchParams.get("periodCode") || "2026-09";

    const enrollments = await sql`
      SELECT 
        id, 
        student_id,
        student_name, 
        subject, 
        type, 
        teacher_name, 
        payment_day, 
        amount::float as amount, 
        lesson_count, 
        status, 
        payment_method, 
        student_phone, 
        parent_name, 
        parent_phone, 
        period_code, 
        created_at
      FROM student_course_enrollments
      WHERE period_code = ${periodCode}
      ORDER BY payment_day ASC, student_name ASC
    `;

    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error("Student payments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const action = body.action || "COLLECT_PAYMENT";

    // 1. MARK ASKED (Single or Batch)
    if (action === "MARK_ASKED") {
      const { id, ids } = body;
      const targetIds = ids && Array.isArray(ids) ? ids : [id];

      await sql`
        UPDATE student_course_enrollments
        SET status = 'Asked'
        WHERE id = ANY(${targetIds})
      `;

      await logAction("MARK_PAYMENT_ASKED", { targetIds }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: "Status 'Asked' təyin edildi" });
    }

    // 2. COLLECT PAYMENT
    if (action === "COLLECT_PAYMENT") {
      const { id, paymentMethod, accountId, amount, note, periodCode = "2026-09" } = body;
      const numAmount = Number(amount);

      const [updatedEnrollment] = await sql`
        UPDATE student_course_enrollments
        SET 
          status = 'Paid',
          payment_method = ${paymentMethod || 'Nəğd Kassa'}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (updatedEnrollment) {
        let targetAccount = null;
        if (accountId) {
          const accs = await sql`SELECT id, name FROM bank_accounts WHERE id::text = ${accountId} OR code = ${accountId}`;
          targetAccount = accs[0];
        } else {
          const methodLower = (paymentMethod || '').toLowerCase();
          const accs = await sql`
            SELECT id, name FROM bank_accounts 
            WHERE is_active = true 
              AND (
                (LOWER(name) LIKE '%kassa%' AND ${methodLower.includes('cash') || methodLower.includes('nəğd')})
                OR (LOWER(name) LIKE '%abb%' AND ${methodLower.includes('abb')})
                OR (LOWER(name) LIKE '%şirkət%' AND ${methodLower.includes('şirkət') || methodLower.includes('bank')})
              )
            LIMIT 1
          `;
          targetAccount = accs[0];
        }

        if (targetAccount) {
          const payAmt = numAmount || Number(updatedEnrollment.amount) || 0;
          await sql`
            INSERT INTO account_transactions (account_id, period_code, date, type, amount, comment, category)
            VALUES (
              ${targetAccount.id}, 
              ${periodCode}, 
              CURRENT_DATE, 
              'INCOME', 
              ${payAmt}, 
              ${note || `${updatedEnrollment.student_name} - ${updatedEnrollment.subject} təhsil haqqı`}, 
              'Tələbə Ödənişi'
            );
          `;
          await sql`
            UPDATE bank_accounts 
            SET initial_balance = initial_balance + ${payAmt}, updated_at = NOW()
            WHERE id = ${targetAccount.id}
          `;
        }

        // CRM Integration: Sync payment to CRM payments table
        if (updatedEnrollment.student_id) {
          const payAmt = numAmount || Number(updatedEnrollment.amount) || 0;
          await sql`
            INSERT INTO payments (
              id, student_id, amount, paid_amount, status, payment_method, payment_date, created_at, enrollment_id
            )
            VALUES (
              gen_random_uuid(),
              ${updatedEnrollment.student_id},
              ${payAmt},
              ${payAmt},
              'PAID',
              ${paymentMethod || 'Nağd Kassa'},
              NOW(),
              NOW(),
              ${updatedEnrollment.id}
            )
          `;
        }
      }

      await logAction("COLLECT_STUDENT_PAYMENT", { id, amount: numAmount, paymentMethod }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, data: updatedEnrollment });
    }

    // 3. BATCH STATUS (Paid, Asked, Not asked)
    if (action === "BATCH_STATUS") {
      const { ids, status, paymentMethod } = body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "Heç bir tələbə seçilməyib" }, { status: 400 });
      }

      await sql`
        UPDATE student_course_enrollments
        SET 
          status = ${status},
          payment_method = COALESCE(${paymentMethod}, payment_method)
        WHERE id = ANY(${ids})
      `;

      // CRM Integration: Sync batch payments into CRM payments table
      if (status === 'Paid') {
        const paidRows = await sql`
          SELECT id, student_id, amount, payment_method FROM student_course_enrollments 
          WHERE id = ANY(${ids}) AND student_id IS NOT NULL
        `;
        for (const pr of paidRows) {
          await sql`
            INSERT INTO payments (
              id, student_id, amount, paid_amount, status, payment_method, payment_date, created_at, enrollment_id
            )
            VALUES (
              gen_random_uuid(),
              ${pr.student_id},
              ${pr.amount},
              ${pr.amount},
              'PAID',
              ${paymentMethod || pr.payment_method || 'Nağd Kassa'},
              NOW(),
              NOW(),
              ${pr.id}
            )
          `;
        }
      }

      await logAction("BATCH_STUDENT_STATUS", { count: ids.length, status }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, message: `${ids.length} tələbənin statusu '${status}' edildi` });
    }

    // 4. ADD STUDENT COURSE
    if (action === "ADD_COURSE") {
      const { 
        studentName, subject, type, teacherName, paymentDay, amount, lessonCount, 
        studentPhone, parentName, parentPhone, periodCode = "2026-09" 
      } = body;

      if (!studentName?.trim() || !subject?.trim()) {
        return NextResponse.json({ error: "Tələbə adı və fənn tələb olunur" }, { status: 400 });
      }

      const cleanStudentName = studentName.trim();

      // CRM Integration: Check if student exists in CRM database or create them
      let resolvedStudentId = null;
      const existingCRM = await sql`
        SELECT s.id 
        FROM students s
        JOIN user_profiles p ON s.profile_id = p.id
        WHERE LOWER(TRIM(CONCAT(p.first_name, ' ', p.last_name))) = LOWER(${cleanStudentName})
           OR LOWER(TRIM(p.first_name)) = LOWER(${cleanStudentName})
        LIMIT 1
      `;

      if (existingCRM.length > 0) {
        resolvedStudentId = existingCRM[0].id;
      } else {
        // Auto-create student in CRM
        const nameParts = cleanStudentName.split(' ');
        const firstName = nameParts[0] || cleanStudentName;
        const lastName = nameParts.slice(1).join(' ') || '';
        const newUserId = crypto.randomUUID();
        const newProfileId = crypto.randomUUID();
        resolvedStudentId = crypto.randomUUID();
        const studentEmail = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${newUserId.substring(0, 5)}@thrive.az`;

        await sql`
          INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
          VALUES (
            ${newUserId}, '00000000-0000-0000-0000-000000000000', ${studentEmail}, 'authenticated', 'authenticated',
            '$2b$10$wT8Kx6U5mO8P0Z9d4n1QO.e6l0X8Kx6U5mO8P0Z9d4n1QO.e6l0Xa',
            '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), NOW()
          )
        `;

        await sql`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${newProfileId}, ${newUserId}, ${firstName}, ${lastName}, ${studentEmail}, ${studentPhone || null})
        `;

        await sql`
          INSERT INTO students (id, profile_id, program, monthly_payment, duration_months, total_price, contract_details)
          VALUES (${resolvedStudentId}, ${newProfileId}, ${subject.trim()}, ${Number(amount) || 0}, 1, ${Number(amount) || 0}, '{}')
        `;

        await sql`
          INSERT INTO user_roles (user_id, role)
          VALUES (${newUserId}, 'student')
          ON CONFLICT DO NOTHING
        `;

        await sql`
          INSERT INTO student_programs (student_id, program_name, monthly_payment, status)
          VALUES (${resolvedStudentId}, ${subject.trim()}, ${Number(amount) || 0}, 'ACTIVE')
        `;

        if (parentName || parentPhone) {
          const pParts = (parentName || '').trim().split(' ');
          const pFirst = pParts[0] || 'Valideyn';
          const pLast = pParts.slice(1).join(' ') || '';
          const pUserId = crypto.randomUUID();
          const pProfileId = crypto.randomUUID();
          const pId = crypto.randomUUID();
          const parentEmail = `parent_${pUserId.substring(0, 6)}@thrive.az`;

          await sql`
            INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
            VALUES (
              ${pUserId}, '00000000-0000-0000-0000-000000000000', ${parentEmail}, 'authenticated', 'authenticated',
              '$2b$10$wT8Kx6U5mO8P0Z9d4n1QO.e6l0X8Kx6U5mO8P0Z9d4n1QO.e6l0Xa',
              '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), NOW()
            )
          `;

          await sql`
            INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
            VALUES (${pProfileId}, ${pUserId}, ${pFirst}, ${pLast}, ${parentEmail}, ${parentPhone || null})
          `;

          await sql`
            INSERT INTO parents (id, profile_id, full_name, phone)
            VALUES (${pId}, ${pProfileId}, ${parentName || pFirst}, ${parentPhone || null})
          `;

          await sql`
            INSERT INTO student_parents (student_id, parent_id, relation_type)
            VALUES (${resolvedStudentId}, ${pId}, 'Ata')
            ON CONFLICT DO NOTHING
          `;
        }
      }

      const [newRow] = await sql`
        INSERT INTO student_course_enrollments (
          student_id, student_name, subject, type, teacher_name, payment_day, amount, lesson_count, 
          status, student_phone, parent_name, parent_phone, period_code
        )
        VALUES (
          ${resolvedStudentId},
          ${cleanStudentName},
          ${subject.trim()},
          ${type || 'Group'},
          ${teacherName || 'Tamerlan'},
          ${Number(paymentDay) || 1},
          ${Number(amount) || 0},
          ${Number(lessonCount) || 8},
          'Not asked',
          ${studentPhone || ''},
          ${parentName || ''},
          ${parentPhone || ''},
          ${periodCode}
        )
        RETURNING *;
      `;

      await logAction("ADD_STUDENT_COURSE", { studentName: cleanStudentName, subject, amount }, (session?.user as any)?.id);
      return NextResponse.json({ success: true, data: newRow }, { status: 201 });
    }

    return NextResponse.json({ error: "Bilinməyən əməliyyat" }, { status: 400 });
  } catch (error: any) {
    console.error("Student payments POST error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const { id, student_name, subject, type, teacher_name, payment_day, amount, lesson_count, student_phone, parent_name, parent_phone, status, payment_method } = body;

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE student_course_enrollments
      SET 
        student_name = COALESCE(${student_name}, student_name),
        subject = COALESCE(${subject}, subject),
        type = COALESCE(${type}, type),
        teacher_name = COALESCE(${teacher_name}, teacher_name),
        payment_day = COALESCE(${Number(payment_day)}, payment_day),
        amount = COALESCE(${Number(amount)}, amount),
        lesson_count = COALESCE(${Number(lesson_count)}, lesson_count),
        student_phone = COALESCE(${student_phone}, student_phone),
        parent_name = COALESCE(${parent_name}, parent_name),
        parent_phone = COALESCE(${parent_phone}, parent_phone),
        status = COALESCE(${status}, status),
        payment_method = COALESCE(${payment_method}, payment_method)
      WHERE id = ${id}
      RETURNING *;
    `;

    await logAction("UPDATE_STUDENT_COURSE", { id, student_name, subject, amount }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Student payments PUT error:", error);
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

    await sql`DELETE FROM student_course_enrollments WHERE id = ${id}`;
    await logAction("DELETE_STUDENT_COURSE", { id }, (session?.user as any)?.id);

    return NextResponse.json({ success: true, message: "Fənn qeydiyyatı silindi" });
  } catch (error: any) {
    console.error("Student payments DELETE error:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
