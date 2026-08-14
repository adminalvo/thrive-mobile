export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const studentsRes = await sql`SELECT COUNT(*) as count FROM students`;
    const groupsRes = await sql`SELECT COUNT(*) as count FROM groups`;
    
    // Simplifications assuming 'payments' table exists
    const paymentsRes = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Paid'`;
    const pendingRes = await sql`SELECT COUNT(*) as count FROM payments WHERE status = 'Pending'`;

    return NextResponse.json({
      totalStudents: parseInt(studentsRes[0].count),
      activeGroups: parseInt(groupsRes[0].count),
      monthlyRevenue: parseFloat(paymentsRes[0].total),
      pendingPayments: parseInt(pendingRes[0].count)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
