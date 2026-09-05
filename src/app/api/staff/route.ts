export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const rawStaff = await sql`
      SELECT 
        u.id as user_id, 
        u.email, 
        r.role,
        p.first_name, 
        p.last_name,
        p.phone,
        r.is_active,
        COALESCE(s.base_amount, 0)::float as base_salary
      FROM auth.users u
      JOIN user_roles r ON u.id = r.user_id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN staff_salaries s ON u.id = s.user_id
      WHERE r.role IN ('super_admin', 'admin', 'staff', 'sales', 'teacher')
        AND r.is_active = true
        AND p.first_name IS NOT NULL
      ORDER BY 
        CASE 
          WHEN r.role = 'super_admin' THEN 1
          WHEN r.role = 'admin' THEN 2
          WHEN r.role = 'staff' THEN 3
          WHEN r.role = 'sales' THEN 4
          ELSE 5
        END ASC;
    `;

    const peopleMap = new Map();

    for (const s of rawStaff) {
      const rawName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
      const fn = (s.first_name || "").toLowerCase().trim();
      const ln = (s.last_name || "").toLowerCase().trim();
      const cleanKey = (fn + "_" + (ln.charAt(0) || "")).replace(/ə/g, "e");

      if (!peopleMap.has(cleanKey)) {
        peopleMap.set(cleanKey, {
          id: s.user_id,
          allUserIds: [s.user_id],
          name: rawName,
          email: s.email,
          role: s.role,
          phone: s.phone || "",
          baseSalary: s.base_salary || 0,
          isActive: true
        });
      } else {
        const existing = peopleMap.get(cleanKey);
        if (!existing.allUserIds.includes(s.user_id)) {
          existing.allUserIds.push(s.user_id);
        }
      }
    }

    const uniqueStaff = Array.from(peopleMap.values());
    return NextResponse.json(uniqueStaff);
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, phone, role, permissions, baseSalary } = await req.json();

    if (!email || !password || !firstName || !role) {
      return NextResponse.json({ error: "Bütün vacib xanaları doldurun" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName || "",
        phone: phone || ""
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO user_profiles (user_id, first_name, last_name, email, phone)
        VALUES (${userId}, ${firstName}, ${lastName}, ${email}, ${phone || null})
      `;

      await tx`
        INSERT INTO user_roles (user_id, role, is_active)
        VALUES (${userId}, ${role}, true)
      `;

      if (baseSalary !== undefined && baseSalary !== null && Number(baseSalary) > 0) {
        await tx`
          INSERT INTO staff_salaries (user_id, salary_type, base_amount)
          VALUES (${userId}, 'MONTHLY_FIXED', ${Number(baseSalary)})
          ON CONFLICT (user_id) DO NOTHING
        `;
      }

      if (permissions && typeof permissions === 'object') {
        const modules = Object.keys(permissions);
        for (const mod of modules) {
          const p = permissions[mod];
          await tx`
            INSERT INTO user_permissions (
              user_id, module_name, can_view, can_create, can_edit, can_delete, can_export
            ) VALUES (
              ${userId}, ${mod}, 
              ${p.view || false}, 
              ${p.create || false}, 
              ${p.edit || false}, 
              ${p.delete || false}, 
              ${p.export || false}
            )
          `;
        }
      }
    });

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error: any) {
    console.error("Staff create error:", error);
    return NextResponse.json({ error: error.message || "Xəta baş verdi" }, { status: 500 });
  }
}
