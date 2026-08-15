export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";


export async function GET() {
  try {
    const tasks = await sql`
      SELECT id, title, description, status, priority, due_date, assignee, order_index, created_at, updated_at
      FROM kanban_tasks 
      ORDER BY order_index ASC, created_at DESC
    `;
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      title, 
      description = null, 
      status = "TODO", 
      priority = "MEDIUM", 
      due_date = null, 
      dueDate = null,
      assignee = null 
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const finalDueDate = due_date || dueDate || null;
    
    // Assignee is a UUID in the new schema. If the frontend passes a raw string name, we set it to null.
    let validAssignee = null;
    if (assignee && typeof assignee === 'string' && assignee.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      validAssignee = assignee;
    }

    const task = await sql`
      INSERT INTO kanban_tasks (title, description, status, priority, due_date, assignee, order_index)
      VALUES (
        ${title.trim()}, 
        ${description ? String(description).trim() : null}, 
        ${status || 'TODO'}, 
        ${priority || 'MEDIUM'}, 
        ${finalDueDate ? new Date(finalDueDate) : null}, 
        ${validAssignee}, 
        0
      )
      RETURNING *
    `;

    return NextResponse.json(task[0], { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
