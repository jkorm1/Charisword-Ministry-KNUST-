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
    const cellId = searchParams.get("cellId")

    let query = `
      SELECT 
        DATE_FORMAT(p.date_given, '%Y-%m') as month,
        COUNT(p.partnership_id) as partnership_count,
        SUM(p.amount) as total_amount,
        AVG(p.amount) as average_amount
      FROM partnerships p
      LEFT JOIN members m ON p.member_id = m.member_id
      WHERE 1=1
    `

    const params: any[] = []

    if (from) {
      query += " AND p.date_given >= ?"
      params.push(from)
    }

    if (to) {
      query += " AND p.date_given <= ?"
      params.push(to)
    }

    if (cellId) {
      query += " AND m.cell_id = ?"
      params.push(cellId)
    }

    query += ' GROUP BY DATE_FORMAT(p.date_given, "%Y-%m") ORDER BY month DESC'

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get partnership reports error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
