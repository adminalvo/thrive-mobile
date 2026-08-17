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
        p.phone
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
      role: s.role || "Təyin edilməyib"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}
