export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const expenses = await sql`
      SELECT 
        id, 
        category, 
        amount, 
        expense_date AS date, 
        description, 
        created_at 
      FROM expenses
      ORDER BY expense_date DESC
    `;

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category, amount, date, description } = await req.json();

    if (!category || !amount || !date) {
      return NextResponse.json({ error: "Eksik məlumatlar" }, { status: 400 });
    }

    const expense = await sql`
      INSERT INTO expenses (category, amount, expense_date, description)
      VALUES (${category}, ${amount}, ${date}, ${description || ""})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: expense[0] }, { status: 201 });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
