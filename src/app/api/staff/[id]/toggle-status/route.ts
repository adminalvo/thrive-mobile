export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Only super_admin can toggle staff status" }, { status: 403 });
    }

    const { isActive } = await req.json();

    // Check if role row exists
    const roleRow = await sql`SELECT user_id FROM user_roles WHERE user_id = ${id}`;
    
    if (roleRow.length > 0) {
      await sql`
        UPDATE user_roles
        SET is_active = ${isActive}
        WHERE user_id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO user_roles (user_id, role, is_active)
        VALUES (${id}, 'staff', ${isActive})
      `;
    }

    return NextResponse.json({ success: true, isActive });
  } catch (error: any) {
    console.error("Toggle status error:", error);
    return NextResponse.json({ error: error.message || "Failed to toggle status" }, { status: 500 });
  }
}
