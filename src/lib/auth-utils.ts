import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function checkApiPermission(
  moduleName: string, 
  action: 'read' | 'view' | 'create' | 'update' | 'edit' | 'delete' | 'export'
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { authorized: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  
  const userRole = session.user.role;
  if (userRole === "super_admin") {
    return { authorized: true, error: null, session };
  }
  
  const perms = (session.user as any).permissions?.[moduleName];
  if (perms) {
    let hasPerm = false;
    if (action === 'read' || action === 'view') {
      hasPerm = Boolean(perms.view || perms.can_view || perms.read);
    } else if (action === 'create') {
      hasPerm = Boolean(perms.create || perms.can_create);
    } else if (action === 'update' || action === 'edit') {
      hasPerm = Boolean(perms.edit || perms.can_edit || perms.update);
    } else if (action === 'delete') {
      hasPerm = Boolean(perms.delete || perms.can_delete);
    } else if (action === 'export') {
      hasPerm = Boolean(perms.export || perms.can_export);
    }

    if (hasPerm) {
      return { authorized: true, error: null, session };
    }
  }
  
  return { authorized: false, error: NextResponse.json({ error: "Forbidden: No permission for " + moduleName }, { status: 403 }), session };
}
