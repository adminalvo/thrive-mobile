export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        students: [],
        teachers: [],
        groups: []
      });
    }

    const term = `%${q}%`;

    // Query Students, Teachers, and Groups simultaneously using raw SQL
    const [students, teachers, groups] = await Promise.all([
      // 1. Students query
      sql`
        SELECT s.id, p.first_name, p.last_name, p.email, p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 10
      `,
      // 2. Teachers query
      sql`
        SELECT t.id, t.specialization, p.first_name, p.last_name, p.email, p.phone
        FROM teachers t
        LEFT JOIN user_profiles p ON t.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          t.specialization ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 10
      `,
      // 3. Groups query
      sql`
        SELECT g.id, g.name, g.room, p.name as program_name
        FROM groups g
        LEFT JOIN programs p ON g.program_id = p.id
        WHERE (
          g.name ILIKE ${term} OR
          g.room ILIKE ${term} OR
          p.name ILIKE ${term}
        )
        LIMIT 10
      `
    ]);

    return NextResponse.json({
      students: students.map((s: any) => ({
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
        email: s.email || "",
        phone: s.phone || ""
      })),
      teachers: teachers.map((t: any) => ({
        id: t.id,
        name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
        email: t.email || "",
        specialization: t.specialization || "N/A"
      })),
      groups: groups.map((g: any) => ({
        id: g.id,
        name: g.name || "",
        program: g.program_name || "N/A",
        room: g.room || ""
      }))
    });
  } catch (error: any) {
    console.error("Global Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
