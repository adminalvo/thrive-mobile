export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const programs = await sql`
      SELECT id, name FROM programs WHERE deleted_at IS NULL ORDER BY name ASC
    `;

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Programs API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
