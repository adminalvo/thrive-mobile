import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Səlahiyyətiniz çatmır" }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID göstərilməyib" }, { status: 400 });
    }

    // 1. Delete from Supabase Auth (This usually cascades or we manually delete from our tables)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error("Supabase Auth Delete Error:", authError);
      // Even if auth fails (maybe user doesn't exist in auth anymore), we proceed to clean our tables
    }

    // 2. Delete from custom tables
    await sql.begin(async (tx) => {
      await tx`DELETE FROM user_roles WHERE user_id = ${id}`;
      await tx`DELETE FROM user_profiles WHERE user_id = ${id}`;
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Delete staff error:", error);
    return NextResponse.json({ error: error.message || "Xəta baş verdi" }, { status: 500 });
  }
}
