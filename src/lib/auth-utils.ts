import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function checkApiPermission(moduleName: string, action: 'read' | 'create' | 'update' | 'delete') {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { authorized: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  
  const userRole = session.user.role;
  if (userRole === "super_admin" || userRole === "admin") {
    return { authorized: true, error: null, session };
  }
  
  if (userRole === "staff") {
    const perms = (session.user as any).permissions?.[moduleName];
    if (perms && perms[action]) {
      return { authorized: true, error: null, session };
    }
  }
  
  return { authorized: false, error: NextResponse.json({ error: "Forbidden: No permission" }, { status: 403 }), session };
}
