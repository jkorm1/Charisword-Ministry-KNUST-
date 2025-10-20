// app/api/reports/payments/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = `
      SELECT 
        p.payment_id,
        p.amount,
        p.payment_date,
        p.payment_type,
        p.description,
        u.email as recorded_by
      FROM payments p
      LEFT JOIN users u ON p.recorded_by_user_id = u.user_id
      WHERE 1=1
    `

    const params: any[] = []

    if (from) {
      query += " AND p.payment_date >= ?"
      params.push(from)
    }

    if (to) {
      query += " AND p.payment_date <= ?"
      params.push(to)
    }

    query += " ORDER BY p.payment_date DESC, p.created_at DESC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get payment reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
