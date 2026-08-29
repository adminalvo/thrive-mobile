export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email?.toLowerCase() || null;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await sql`
      SELECT 
        s.id, 
        s.title, 
        s.module_filter, 
        s.created_at, 
        s.updated_at,
        (SELECT COUNT(*)::int FROM ai_chat_messages m WHERE m.session_id = s.id) as message_count
      FROM ai_chat_sessions s
      WHERE s.user_id = ${userId} OR s.user_email = ${userEmail}
      ORDER BY s.updated_at DESC
      LIMIT 100
    `;

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error("AI Sessions GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email?.toLowerCase() || null;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title || "New Conversation").trim();
    const moduleFilter = (body.module_filter || "ALL").trim().toUpperCase();

    const inserted = await sql`
      INSERT INTO ai_chat_sessions (user_id, user_email, title, module_filter)
      VALUES (${userId}, ${userEmail}, ${title}, ${moduleFilter})
      RETURNING *
    `;

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("AI Sessions POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}
