export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logAction } from "@/lib/logger";
import { checkApiPermission } from "@/lib/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;
    const currentUserId = session?.user?.id;
    const currentUserEmail = session?.user?.email;
    const currentUserName = session?.user?.name;

    const [tasks, users] = await Promise.all([
      sql`
        SELECT id, title, description, status, priority, due_date, assignee, order_index, created_at, updated_at
        FROM kanban_tasks 
        ORDER BY order_index ASC, created_at DESC
      `,
      sql`
        SELECT u.id, u.email, p.first_name, p.last_name, p.phone
        FROM auth.users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
      `
    ]);

    const userMap = new Map();
    users.forEach((u: any) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email?.split("@")[0] || "İstifadəçi";
      userMap.set(u.id, {
        id: u.id,
        name: fullName,
        email: u.email || "",
        avatar_url: null
      });
    });

    const formattedTasks = tasks.map((task: any) => {
      let assigneeIds: string[] = [];
      if (task.assignee) {
        try {
          const raw = String(task.assignee).trim();
          if (raw.startsWith("[") && raw.endsWith("]")) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              assigneeIds = parsed.map((item: any) => typeof item === 'string' ? item : item?.id).filter(Boolean);
            }
          } else if (raw.includes(",")) {
            assigneeIds = raw.split(",").map((s: string) => s.trim()).filter(Boolean);
          } else if (raw) {
            assigneeIds = [raw];
          }
        } catch {
          assigneeIds = [task.assignee];
        }
      }

      // ONLY match real existing users from userMap
      const assignees = assigneeIds
        .map(id => userMap.get(id))
        .filter(Boolean);

      return {
        ...task,
        assignee: assignees.length > 0 ? assignees[0].name : null,
        assignees: assignees
      };
    });

    // If SuperAdmin -> Return ALL tasks across company
    if (userRole === "super_admin" || !session) {
      return NextResponse.json(formattedTasks);
    }

    // For other staff/users -> Return ONLY tasks assigned to this user
    const userTasks = formattedTasks.filter((task: any) => {
      if (!task.assignees || task.assignees.length === 0) return false;
      return task.assignees.some((a: any) => 
        (currentUserId && a.id === currentUserId) ||
        (currentUserEmail && a.email && a.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
        (currentUserName && a.name && a.name.toLowerCase() === currentUserName.toLowerCase())
      );
    });

    return NextResponse.json(userTasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authCheck = await checkApiPermission('tasks', 'create');
    if (!authCheck.authorized) return authCheck.error;

    const body = await req.json();
    const { 
      title, 
      description = null, 
      status = "TODO", 
      priority = "MEDIUM", 
      due_date = null, 
      dueDate = null,
      assignee = null,
      assignees = null
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const finalDueDate = due_date || dueDate || null;
    
    let storedAssignee = null;
    if (Array.isArray(assignees) && assignees.length > 0) {
      storedAssignee = JSON.stringify(assignees);
    } else if (assignee) {
      storedAssignee = typeof assignee === "object" ? JSON.stringify(assignee) : String(assignee).trim();
    }

    const task = await sql`
      INSERT INTO kanban_tasks (title, description, status, priority, due_date, assignee, order_index)
      VALUES (
        ${title.trim()}, 
        ${description ? String(description).trim() : null}, 
        ${status || "TODO"}, 
        ${priority || "MEDIUM"}, 
        ${finalDueDate ? new Date(finalDueDate) : null}, 
        ${storedAssignee}, 
        0
      )
      RETURNING *
    `;

    await logAction("CREATE_TASK", { taskId: task[0].id, title: task[0].title, status: task[0].status });
    return NextResponse.json(task[0], { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
