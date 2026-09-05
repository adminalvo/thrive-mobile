import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export type ModuleName = "students" | "finance" | "groups" | "tasks" | "staff" | "settings" | "teachers" | "parents" | "leads";
export type ActionType = "view" | "create" | "edit" | "delete" | "export";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function hasPermission(moduleName: ModuleName, action: ActionType): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return false;
  }

  const { role, permissions } = session.user as any;

  // Super Admin always has full access
  if (role === "super_admin") {
    return true;
  }

  // If permissions object exists and is populated for this user in DB, use it exclusively
  if (permissions && permissions[moduleName]) {
    return !!permissions[moduleName][action];
  }

  // Fallbacks for legacy/default roles if permissions are not set in DB
  if (role === "admin") {
    return true;
  }

  if (role === "teacher") {
    const allowedTeacherModules = ["students", "groups", "tasks"];
    if (allowedTeacherModules.includes(moduleName) && action === "view") {
      return true;
    }
  }

  if (role === "student" || role === "parent") {
    if (moduleName === "groups" && action === "view") return true;
  }

  // Default staff fallback
  if (role === "staff") {
    if (moduleName === "finance" || moduleName === "staff" || moduleName === "settings") return false;
    if (action === "view" || action === "create" || action === "edit") return true;
    return false;
  }

  return false;
}

export async function requirePermission(moduleName: ModuleName, action: ActionType) {
  const allowed = await hasPermission(moduleName, action);
  if (!allowed) {
    throw new Error("Giriş qadağandır (Forbidden)");
  }
}

/**
 * Strict RBAC check for API route handlers
 * Returns { errorResponse: null, session } if authorized, or { errorResponse: NextResponse, session: null } if forbidden
 */
export async function checkRoleGuard(allowedRoles: string[] = ["super_admin", "admin"]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "İcazəsiz giriş (Unauthorized)" }, { status: 401 }),
      session: null
    };
  }

  const userRole = (session.user as any).role || "staff";
  if (!allowedRoles.includes(userRole)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Bu əməliyyat üçün icazəniz yoxdur (Forbidden)" }, { status: 403 }),
      session
    };
  }

  return {
    authorized: true,
    errorResponse: null,
    session
  };
}
