export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;

    // Axtarış üçün tələbələr, müəllimlər və qruplar:
    const students = await sql`
      SELECT id, first_name || ' ' || last_name as name, 'student' as type, '/dashboard/students/' || id as url
      FROM user_profiles p
      JOIN students s ON p.id = s.profile_id
      WHERE first_name ILIKE ${searchTerm} OR last_name ILIKE ${searchTerm} OR phone ILIKE ${searchTerm}
      LIMIT 5
    `;

    const teachers = await sql`
      SELECT id, first_name || ' ' || last_name as name, 'teacher' as type, '/dashboard/teachers/' || id as url
      FROM user_profiles p
      JOIN teachers t ON p.id = t.profile_id
      WHERE first_name ILIKE ${searchTerm} OR last_name ILIKE ${searchTerm} OR phone ILIKE ${searchTerm}
      LIMIT 5
    `;

    const groups = await sql`
      SELECT id, name, 'group' as type, '/dashboard/groups/' || id as url
      FROM groups
      WHERE name ILIKE ${searchTerm}
      LIMIT 5
    `;

    return NextResponse.json({ 
      students, 
      teachers, 
      groups 
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
