export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRoleGuard } from "@/lib/permissions";
import { logAction } from "@/lib/logger";

export async function GET() {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin", "staff"]);
    if (!authorized) return errorResponse;

    const standards = await sql`
      SELECT 
        id, 
        course_name, 
        group_price::float as group_price, 
        individual_price::float as individual_price, 
        schedule, 
        audience, 
        language, 
        duration, 
        max_students, 
        created_at
      FROM pricing_standards
      ORDER BY course_name ASC
    `;

    return NextResponse.json(standards);
  } catch (error: any) {
    console.error("Pricing standards GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing standards" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { authorized, errorResponse, session } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const { courseName, groupPrice, individualPrice, schedule, audience, language, duration, maxStudents } = body;

    if (!courseName?.trim()) {
      return NextResponse.json({ error: "Kurs adı tələb olunur" }, { status: 400 });
    }

    const [created] = await sql`
      INSERT INTO pricing_standards (
        course_name, group_price, individual_price, schedule, audience, language, duration, max_students
      )
      VALUES (
        ${courseName.trim()},
        ${groupPrice ? Number(groupPrice) : null},
        ${individualPrice ? Number(individualPrice) : null},
        ${schedule || 'Həftədə 2 dəfə + praktika'},
        ${audience || 'Teen'},
        ${language || 'Any'},
        ${duration || '3-6 ay'},
        ${maxStudents || 'max 5'}
      )
      RETURNING *;
    `;

    await logAction("CREATE_PRICING_STANDARD", { courseName, groupPrice, individualPrice }, (session?.user as any)?.id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Pricing standards POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save course pricing" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) return errorResponse;

    const body = await req.json();
    const { id, courseName, groupPrice, individualPrice, schedule, audience, language, duration, maxStudents } = body;

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE pricing_standards
      SET 
        course_name = COALESCE(${courseName}, course_name),
        group_price = ${groupPrice !== undefined ? Number(groupPrice) : null},
        individual_price = ${individualPrice !== undefined ? Number(individualPrice) : null},
        schedule = COALESCE(${schedule}, schedule),
        audience = COALESCE(${audience}, audience),
        language = COALESCE(${language}, language),
        duration = COALESCE(${duration}, duration),
        max_students = COALESCE(${maxStudents}, max_students)
      WHERE id = ${id}
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Pricing standards PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update course pricing" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { authorized, errorResponse } = await checkRoleGuard(["super_admin", "admin"]);
    if (!authorized) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

    await sql`DELETE FROM pricing_standards WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Pricing standards DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
