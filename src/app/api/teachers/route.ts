export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const teachers = await sql`
      SELECT 
        t.id, 
        t.specialization, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone,
        p.user_id,
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
    `;

    const formatted = teachers.map(t => ({
      id: t.id,
      name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
      email: t.email || "",
      phone: t.phone || "",
      specialty: t.specialization || "Təyin edilməyib",
      activeGroups: Number(t.active_groups) || 0 
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, specialty, password, groupIds, groups, groupId } = data;
    
    if (!name || typeof name !== "string" || !name.trim() || !email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailToUse = email.trim().toLowerCase();

    const existingUser = await sql`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "Müəllim";
    const lastName = nameParts.slice(1).join(" ") || "";

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();

    // Hash the incoming password using bcrypt
    const passwordToHash = password || "123456";
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Normalize group IDs
    const selectedGroupIds: string[] = Array.isArray(groupIds)
      ? groupIds
      : (Array.isArray(groups)
        ? groups
        : (groupId ? [groupId] : (groupIds ? [groupIds] : [])));

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO auth.users (id, email, role, aud, encrypted_password)
        VALUES (${userId}, ${emailToUse}, 'teacher', 'authenticated', ${hashedPassword})
      `;

      await tx`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email)
        VALUES (${profileId}, ${userId}, ${firstName}, ${lastName}, ${emailToUse})
      `;

      await tx`
        INSERT INTO teachers (id, profile_id, specialization)
        VALUES (${teacherId}, ${profileId}, ${specialty || null})
      `;
      
      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${userId}, 'teacher')
        ON CONFLICT (user_id) DO UPDATE SET role = 'teacher'
      `;

      // Assign teacher to selected groups in database (SQL)
      for (const gid of selectedGroupIds) {
        if (gid) {
          await tx`
            UPDATE groups
            SET teacher_id = ${userId}
            WHERE id = ${gid}
          `;
        }
      }
    });

    return NextResponse.json({
      success: true,
      id: teacherId,
      teacher: {
        id: teacherId,
        name: `${firstName} ${lastName}`.trim(),
        email: emailToUse,
        specialty: specialty || null
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Teacher Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create teacher" }, { status: 500 });
  }
}
