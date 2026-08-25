export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
      JOIN user_roles r ON u.id = r.user_id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE r.role IN ('super_admin', 'admin', 'staff', 'teacher', 'sales')
      ORDER BY p.first_name ASC, p.last_name ASC
    `;

    const formatted = staff.map((s: any) => {
      const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
      return {
        id: s.id,
        name: fullName || s.email?.split("@")[0] || "İşçi",
        email: s.email || "",
        phone: s.phone || "",
        role: s.role || "staff",
        isActive: s.is_active !== false
      };
    });

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
