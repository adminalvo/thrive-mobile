export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Only super_admin can view permissions" }, { status: 403 });
    }

    const permissionsRows = await sql`
      SELECT module_name, can_view, can_create, can_edit, can_delete, can_export
      FROM user_permissions
      WHERE user_id = ${id}
    `;

    const permissions = permissionsRows.reduce((acc: any, row: any) => {
      acc[row.module_name] = {
        view: row.can_view,
        create: row.can_create,
        edit: row.can_edit,
        delete: row.can_delete,
        export: row.can_export
      };
      return acc;
    }, {});

    return NextResponse.json(permissions);
  } catch (error: any) {
    console.error("Fetch permissions error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "super_admin") {
      return NextResponse.json({ error: "Only super_admin can update permissions" }, { status: 403 });
    }

    const { permissions } = await req.json();
    
    // permissions is an object: { students: { view: true, create: false... }, ... }
    
    await sql.begin(async (tx) => {
      // First, clear existing permissions to replace them
      await tx`DELETE FROM user_permissions WHERE user_id = ${id}`;
      
      const modules = Object.keys(permissions);
      for (const mod of modules) {
        const p = permissions[mod];
        await tx`
          INSERT INTO user_permissions (
            user_id, module_name, can_view, can_create, can_edit, can_delete, can_export
          ) VALUES (
            ${id}, ${mod}, 
            ${p.view || false}, 
            ${p.create || false}, 
            ${p.edit || false}, 
            ${p.delete || false}, 
            ${p.export || false}
          )
        `;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update permissions error:", error);
    return NextResponse.json({ error: error.message || "Failed to update permissions" }, { status: 500 });
  }
}
