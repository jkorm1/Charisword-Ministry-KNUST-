    // app/api/recurring-expenses/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT expense_id, expense_name, default_amount, is_active
      FROM recurring_expenses
      WHERE is_active = TRUE
      ORDER BY expense_name
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get recurring expenses error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { expense_name, default_amount } = await request.json()

    if (!expense_name || !default_amount) {
      return NextResponse.json({ 
        error: "Expense name and default amount are required" 
      }, { status: 400 })
    }

    const [result] = await pool.execute(
      `INSERT INTO recurring_expenses (expense_name, default_amount, created_at)
       VALUES (?, ?, NOW())`,
      [expense_name, default_amount]
    )

    return NextResponse.json({
      message: "Recurring expense created successfully",
      expense_id: (result as any).insertId
    })
  } catch (error) {
    console.error("Create recurring expense error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
