export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS kanban_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'TODO',
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        due_date TIMESTAMPTZ,
        assignee TEXT,
        order_index INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.error("CREATE TABLE kanban_tasks error:", e);
  }

  const columns = [
    "ADD COLUMN IF NOT EXISTS description TEXT",
    "ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'MEDIUM'",
    "ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ",
    "ADD COLUMN IF NOT EXISTS assignee TEXT",
    "ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0",
    "ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()"
  ];

  for (const col of columns) {
    try {
      await sql.unsafe(`ALTER TABLE kanban_tasks ${col}`);
    } catch (e) {
      console.error(`ALTER TABLE kanban_tasks ${col} error:`, e);
    }
  }
}

export async function GET() {
  try {
    await ensureTable();
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
    await ensureTable();
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

    const task = await sql`
      INSERT INTO kanban_tasks (title, description, status, priority, due_date, assignee, order_index)
      VALUES (
        ${title.trim()}, 
        ${description ? String(description).trim() : null}, 
        ${status || 'TODO'}, 
        ${priority || 'MEDIUM'}, 
        ${finalDueDate ? new Date(finalDueDate) : null}, 
        ${assignee ? String(assignee).trim() : null}, 
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
