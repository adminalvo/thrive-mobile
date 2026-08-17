import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export type ModuleName = "students" | "finance" | "groups" | "tasks" | "staff" | "settings" | "teachers" | "parents";
export type ActionType = "view" | "create" | "edit" | "delete" | "export";

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
    if (moduleName === "finance" || moduleName === "staff") return false;
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
