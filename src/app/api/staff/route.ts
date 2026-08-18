export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const staff = await sql`
      SELECT 
        u.id, 
        u.email, 
        r.role,
        p.first_name, 
        p.last_name,
        p.phone,
        r.is_active
      FROM auth.users u
      LEFT JOIN user_roles r ON u.id = r.user_id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE r.role IN ('super_admin', 'admin', 'staff', 'teacher', 'sales') OR r.role IS NULL
    `;

    const formatted = staff.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "İstifadəçi",
      email: s.email || "",
      phone: s.phone || "",
      role: s.role || "Təyin edilməyib",
      isActive: s.is_active !== false
    }));

    // Deduplicate by id in case of multiple roles/profiles
    const uniqueStaff = Array.from(new Map(formatted.map((s: any) => [s.id, s])).values());

    return NextResponse.json(uniqueStaff);
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, phone, role, permissions } = await req.json();

    if (!email || !password || !firstName || !role) {
      return NextResponse.json({ error: "Eksik məlumatlar" }, { status: 400 });
    }

    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    await sql.begin(async (tx) => {
      const profile = await tx`
        INSERT INTO user_profiles (user_id, first_name, last_name, email, phone)
        VALUES (${userId}, ${firstName}, ${lastName}, ${email}, ${phone || null})
        RETURNING id
      `;

      await tx`
        INSERT INTO user_roles (user_id, role, is_active)
        VALUES (${userId}, ${role}, true)
      `;

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
