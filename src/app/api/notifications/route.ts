export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${session.user.id} OR user_id IS NULL
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, is_read } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE notifications
      SET is_read = ${is_read}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Notifications Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
