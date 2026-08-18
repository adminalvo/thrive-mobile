import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Yalnız tələbələr yükləyə bilər" }, { status: 403 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Fayl tapılmadı" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    const filename = `contract_${userId}_${Date.now()}.${ext}`;
    const filePath = path.join(process.cwd(), "public", "uploads", "contracts", filename);

    // Write file to public/uploads/contracts
    await writeFile(filePath, buffer);

    // URL to store in DB
    const fileUrl = `/uploads/contracts/${filename}`;

    // Update the students table
    await sql`
      UPDATE students
      SET signed_contract_url = ${fileUrl}
      WHERE profile_id IN (
        SELECT id FROM user_profiles WHERE user_id = ${userId}
      ) OR id::text = ${userId}
    `;

    return NextResponse.json({ success: true, url: fileUrl }, { status: 200 });

  } catch (error: any) {
    console.error("Upload contract error:", error);
    return NextResponse.json({ error: "Faylı yükləmək mümkün olmadı" }, { status: 500 });
  }
}
