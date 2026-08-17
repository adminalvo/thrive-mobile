export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import sql from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await sql`
      SELECT id, title, description, status, priority, due_date as "dueDate", assignee
      FROM kanban_tasks
      WHERE assignee = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("My Tasks fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
