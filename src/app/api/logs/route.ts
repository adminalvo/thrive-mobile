export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin"]);
    if (!authorized) {
      return errorResponse;
    }

    const logs = await sql`
      SELECT l.id, l.action, l.details, l.created_at, u.email as user_email
      FROM system_logs l
      LEFT JOIN auth.users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `.catch(async () => {
      return await sql`
        SELECT l.id, l.action, l.details_az, l.details_en, l.details_ru, l.created_at, u.email as user_email
        FROM activity_logs l
        LEFT JOIN auth.users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 100
      `.catch(() => []);
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Logs API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
