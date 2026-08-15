export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const recentStudents = await sql`
      SELECT s.id, s.created_at as "enrolledAt", p.first_name, p.last_name, p.email, p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `;

    const formatted = recentStudents.map((s: any) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
      email: s.email || "",
      phone: s.phone || "",
      enrolledAt: s.enrolledAt,
      group: "Gözləmədə"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch recent students" }, { status: 500 });
  }
}
