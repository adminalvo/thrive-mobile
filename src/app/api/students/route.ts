import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcrypt";
import { logAction } from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 401 });
    }

    const [students, studentProgramsList, groupStudentsList] = await Promise.all([
      sql`
        SELECT 
          s.id, 
          s.created_at, 
          s.program,
          s.fin_code,
          p.first_name, 
          p.last_name, 
          p.email, 
          p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        ORDER BY s.created_at DESC
      `,
      sql`
        SELECT student_id, program_name, status 
        FROM student_programs
      `,
      sql`
        SELECT gs.student_id, g.id as group_id, g.name as group_name
        FROM group_students gs
        JOIN groups g ON gs.group_id = g.id
      `
    ]);

    const programsMap = new Map();
    studentProgramsList.forEach((sp: any) => {
      if (!programsMap.has(sp.student_id)) {
        programsMap.set(sp.student_id, []);
      }
      programsMap.get(sp.student_id).push(sp.program_name);
    });

    const groupsMap = new Map();
    groupStudentsList.forEach((gs: any) => {
      if (!groupsMap.has(gs.student_id)) {
        groupsMap.set(gs.student_id, []);
      }
      groupsMap.get(gs.student_id).push({ id: gs.group_id, name: gs.group_name });
    });

    const formatted = students.map((s: any) => {
      const dbPrograms = programsMap.get(s.id) || [];
      const mainProgram = s.program ? s.program.split(",").map((p: string) => p.trim()).filter(Boolean) : [];
      const allUniquePrograms = Array.from(new Set([...mainProgram, ...dbPrograms]));

      return {
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
        email: s.email || "",
        phone: s.phone || "",
        fin: s.fin_code || "",
        program: s.program || "—",
        programs: allUniquePrograms.length > 0 ? allUniquePrograms : (s.program ? [s.program] : []),
        groups: groupsMap.get(s.id) || [],
        group: (groupsMap.get(s.id)?.[0]?.name) || "Əsas Qrup",
        joinDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
        status: "ACTIVE"
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      name, email, phone, programs, password,
      parentName, parentPhone, parentEmail, parentPassword
    } = data;
    
    // Convert array of programs to comma-separated string for DB storage
    const programStr = Array.isArray(programs) ? programs.join(", ") : (data.program || "");
    
    const parsedPayment = 0;
    const parsedDuration = 1;
    const totalPrice = 0;
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("123456", 10);
    const hashedParentPassword = parentPassword ? await bcrypt.hash(parentPassword, 10) : await bcrypt.hash("123456", 10);
    
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "Tələbə";
    const lastName = nameParts.slice(1).join(" ") || "";

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    // Raw SQL Transaction
    await sql.begin(async (tx: any) => {
      // 1. Create auth user using ON CONFLICT DO NOTHING to avoid duplicate email crash
      // Supabase users table uses email as a unique constraint. If it exists, we skip creating the auth user 
      // but we STILL create the CRM profile using the existing user ID, OR we let it fail gracefully.
      // Wait, if it exists, we need its ID. Let's try inserting or returning the ID.
      
      const emailToUse = email || `${userId.substring(0,8)}@example.com`;
      
      const existingUser = await tx`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
      let finalUserId = userId;

      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        await tx`
          INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
          VALUES (
            ${userId}, 
            '00000000-0000-0000-0000-000000000000', 
            ${emailToUse}, 
            'authenticated', 
            'authenticated', 
            ${hashedPassword},
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            NOW()
          )
        `;
      }

      // 2. Create user profile
      const existingProfile = await tx`SELECT id FROM user_profiles WHERE user_id = ${finalUserId}`;
      let finalProfileId = profileId;

      if (existingProfile.length > 0) {
        finalProfileId = existingProfile[0].id;
      } else {
        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${profileId}, ${finalUserId}, ${firstName}, ${lastName}, ${email || null}, ${phone || null})
        `;
      }

      // 3. Create student record
      await tx`
        INSERT INTO students (
          id, profile_id, program, monthly_payment, duration_months, total_price, 
          fin_code, id_card_number, dob, address, contract_details
        )
        VALUES (
          ${studentId}, ${finalProfileId}, ${programStr || null}, ${parsedPayment}, 
          ${parsedDuration}, ${totalPrice}, null, null,
          null, null, '{}'
        )
      `;
      
      // 4. Optionally create user_roles record
      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${finalUserId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;

      // 5. Parent Auto-Creation & Pairing
      if (parentName || parentEmail || parentPhone) {
        const pEmail = parentEmail || `${studentId.substring(0,8)}@parent.thrive.az`;
        const pUserId = crypto.randomUUID();
        const pProfileId = crypto.randomUUID();
        const pId = crypto.randomUUID();

        // 5a. Parent auth user
        const existingParentUser = await tx`SELECT id FROM auth.users WHERE email = ${pEmail}`;
        let finalParentUserId = pUserId;

        if (existingParentUser.length > 0) {
          finalParentUserId = existingParentUser[0].id;
        } else {
          await tx`
            INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
            VALUES (
              ${pUserId}, 
              '00000000-0000-0000-0000-000000000000', 
              ${pEmail}, 
              'authenticated', 
              'authenticated', 
              ${hashedParentPassword},
              '{"provider":"email","providers":["email"]}',
              '{}',
              NOW(),
              NOW(),
              NOW()
            )
          `;
        }

        // 5b. Parent user profile
        const pNameParts = (parentName || "").trim().split(" ");
        const pFirstName = pNameParts[0] || "Valideyn";
        const pLastName = pNameParts.slice(1).join(" ") || "";

        const existingParentProfile = await tx`SELECT id FROM user_profiles WHERE user_id = ${finalParentUserId}`;
        let finalParentProfileId = pProfileId;

        if (existingParentProfile.length > 0) {
          finalParentProfileId = existingParentProfile[0].id;
        } else {
          await tx`
            INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
            VALUES (${pProfileId}, ${finalParentUserId}, ${pFirstName}, ${pLastName}, ${pEmail}, ${parentPhone || null})
          `;
        }

        // 5c. Parents record
        const existingParentRecord = await tx`SELECT id FROM parents WHERE profile_id = ${finalParentProfileId}`;
        let finalParentId = pId;

        if (existingParentRecord.length > 0) {
          finalParentId = existingParentRecord[0].id;
        } else {
          await tx`
            INSERT INTO parents (id, profile_id, fin_code, id_card_number, address)
            VALUES (${pId}, ${finalParentProfileId}, null, null, null)
          `;
        }

        // 5d. Link Parent to Student
        await tx`
          INSERT INTO student_parents (student_id, parent_id, relation_type)
          VALUES (${studentId}, ${finalParentId}, 'Ata')
          ON CONFLICT DO NOTHING
        `;
        
        // 5e. Role
        await tx`
          INSERT INTO user_roles (user_id, role)
          VALUES (${finalParentUserId}, 'parent')
          ON CONFLICT (user_id) DO NOTHING
        `;
      }
    });

    await logAction("CREATE_STUDENT", { studentId, name: `${firstName} ${lastName}`.trim(), email });
    return NextResponse.json({ success: true, id: studentId });

  } catch (error: any) {
    console.error("Student Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
