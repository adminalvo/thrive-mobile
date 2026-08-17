export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const parents = await sql`
      SELECT p.id, p.fin_code, p.id_card_number, p.created_at, p.full_name, p.phone,
             au.email
      FROM parents p
      LEFT JOIN user_profiles u ON p.profile_id = u.id
      LEFT JOIN auth.users au ON u.user_id = au.id
      ORDER BY p.created_at DESC
    `;

    const formatted = parents.map((p: any) => ({
      id: p.id,
      name: p.full_name || "N/A",
      contact: p.phone || "N/A",
      email: p.email || "N/A",
      fin: p.fin_code || "N/A",
      idCard: p.id_card_number || "N/A"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Parents API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, phone, email, fin_code, id_card_number, password } = body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("123456", 10);

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const parentId = crypto.randomUUID();

    await sql.begin(async (tx: any) => {
      const emailToUse = email || `${userId.substring(0,8)}@example.com`;
      
      const existingUser = await tx`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
      let finalUserId = userId;

      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        await tx`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${userId}, ${emailToUse}, 'authenticated', 'authenticated', ${hashedPassword})
        `;
      }

      const existingProfile = await tx`SELECT id FROM user_profiles WHERE user_id = ${finalUserId}`;
      let finalProfileId = profileId;

      if (existingProfile.length > 0) {
        finalProfileId = existingProfile[0].id;
      } else {
        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${profileId}, ${finalUserId}, ${first_name || 'Valideyn'}, ${last_name || ''}, ${email || null}, ${phone || null})
        `;
      }

      await tx`
        INSERT INTO parents (id, profile_id, fin_code, id_card_number)
        VALUES (${parentId}, ${finalProfileId}, ${fin_code}, ${id_card_number || null})
      `;
      
      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${finalUserId}, 'parent')
        ON CONFLICT (user_id) DO NOTHING
      `;

      const reqStudentId = body.student_id || body.studentId;
      if (reqStudentId) {
        await tx`
          INSERT INTO student_parents (student_id, parent_id, relation_type)
          VALUES (${reqStudentId}, ${parentId}, 'Ata/Ana')
          ON CONFLICT DO NOTHING
        `;
      }
    });

    return NextResponse.json({ success: true, id: parentId });
  } catch (error: any) {
    console.error("Parents Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create parent" }, { status: 500 });
  }
}
