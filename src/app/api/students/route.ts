export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const students = await sql`
      SELECT s.id, s.created_at, p.first_name, p.last_name, p.email, p.phone
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      ORDER BY s.created_at DESC
    `;

    const formatted = students.map(s => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
      email: s.email || "",
      phone: s.phone || "",
      group: "Qrup", 
      joinDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
      status: "ACTIVE"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, email, fin, password } = data;
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("123456", 10);
    
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "Tələbə";
    const lastName = nameParts.slice(1).join(" ") || "";

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    // Raw SQL Transaction
    await sql.begin(async (tx) => {
      // 1. Create auth user using ON CONFLICT DO NOTHING to avoid duplicate email crash
      // Supabase users table uses email as a unique constraint. If it exists, we skip creating the auth user 
      // but we STILL create the CRM profile using the existing user ID, OR we let it fail gracefully.
      // Wait, if it exists, we need its ID. Let's try inserting or returning the ID.
      
      const emailToUse = email || `${userId.substring(0,8)}@example.com`;
      
      const existingUser = await tx`SELECT id FROM auth.users WHERE email = ${emailToUse}`;
      let finalUserId = userId;

      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        await tx`
          INSERT INTO auth.users (id, email, phone, role, aud, encrypted_password)
          VALUES (${userId}, ${emailToUse}, ${phone || null}, 'authenticated', 'authenticated', ${hashedPassword})
        `;
      }

      // 2. Create user profile
      const existingProfile = await tx`SELECT id FROM user_profiles WHERE user_id = ${finalUserId}`;
      let finalProfileId = profileId;

      if (existingProfile.length > 0) {
        finalProfileId = existingProfile[0].id;
      } else {
        await tx`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${profileId}, ${finalUserId}, ${firstName}, ${lastName}, ${email || null}, ${phone || null})
        `;
      }

      // 3. Create student record
      await tx`
        INSERT INTO students (id, profile_id)
        VALUES (${studentId}, ${finalProfileId})
      `;
      
      // 4. Optionally create user_roles record
      await tx`
        INSERT INTO user_roles (user_id, role)
        VALUES (${finalUserId}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `;
    });

    return NextResponse.json({ success: true, id: studentId });

  } catch (error: any) {
    console.error("Student Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
