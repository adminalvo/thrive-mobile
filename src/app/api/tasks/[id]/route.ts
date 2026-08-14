export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingRes = await sql`SELECT * FROM kanban_tasks WHERE id = ${id}`;
    if (existingRes.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const current = existingRes[0];
    const title = body.title !== undefined ? (body.title ? String(body.title).trim() : "") : current.title;
    const description = body.description !== undefined ? (body.description ? String(body.description).trim() : null) : current.description;
    const status = body.status !== undefined ? String(body.status).trim() : current.status;
    const priority = body.priority !== undefined ? String(body.priority).trim() : current.priority;
    const rawDueDate = body.due_date !== undefined ? body.due_date : body.dueDate;
    const dueDate = rawDueDate !== undefined ? (rawDueDate ? new Date(rawDueDate) : null) : (current.due_date ? new Date(current.due_date) : null);
    const assignee = body.assignee !== undefined
      ? (body.assignee ? String(body.assignee).trim() : null)
      : (body.assignee_id !== undefined ? (body.assignee_id ? String(body.assignee_id).trim() : null) : current.assignee);
    const orderIndex = body.order_index !== undefined ? Number(body.order_index) : (body.orderIndex !== undefined ? Number(body.orderIndex) : Number(current.order_index || 0));

    const updated = await sql`
      UPDATE kanban_tasks
      SET 
        title = ${title},
        description = ${description},
        status = ${status},
        priority = ${priority},
        due_date = ${dueDate},
        assignee = ${assignee},
        order_index = ${orderIndex},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Task PUT error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM kanban_tasks 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Task DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
