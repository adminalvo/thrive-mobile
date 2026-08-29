export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email?.toLowerCase() || null;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify session ownership
    const sessionRecord = await sql`
      SELECT * FROM ai_chat_sessions
      WHERE id = ${id} AND (user_id = ${userId} OR user_email = ${userEmail})
      LIMIT 1
    `;

    if (sessionRecord.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await sql`
      SELECT id, role, content, image_url, created_at
      FROM ai_chat_messages
      WHERE session_id = ${id}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      session: sessionRecord[0],
      messages: messages
    });
  } catch (error: any) {
    console.error("AI Session GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch session messages" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email?.toLowerCase() || null;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sql`
      DELETE FROM ai_chat_sessions
      WHERE id = ${id} AND (user_id = ${userId} OR user_email = ${userEmail})
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("AI Session DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete session" }, { status: 500 });
  }
}
