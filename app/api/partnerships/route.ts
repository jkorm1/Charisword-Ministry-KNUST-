import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")

    if (memberId) {
      // Get partnerships for specific member
      const [rows] = await pool.execute(
        `
        SELECT p.partnership_id, p.amount, p.date_given, p.created_at,
               m.full_name as member_name, u.email as recorded_by
        FROM partnerships p
        LEFT JOIN members m ON p.member_id = m.member_id
        LEFT JOIN users u ON p.recorded_by_user_id = u.user_id
        WHERE p.member_id = ?
        ORDER BY p.date_given DESC
      `,
        [memberId],
      )

      return NextResponse.json(rows)
    } else {
      // Get partnership summary for all members
      const [rows] = await pool.execute(`
        SELECT m.member_id, m.full_name, c.name as cell_name,
               COALESCE(SUM(p.amount), 0) as total_partnerships,
               COUNT(p.partnership_id) as partnership_count,
               MAX(p.date_given) as last_partnership_date
        FROM members m
        LEFT JOIN partnerships p ON m.member_id = p.member_id
        LEFT JOIN cells c ON m.cell_id = c.cell_id
        WHERE m.membership_status IN ('Member', 'Associate')
        GROUP BY m.member_id, m.full_name, c.name
        ORDER BY total_partnerships DESC, m.full_name ASC
      `)

      return NextResponse.json(rows)
    }
  } catch (error) {
    console.error("Get partnerships error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { member_id, partner_name, amount, date_given } = await request.json()

    if (!amount || !date_given) {
      return NextResponse.json({ error: "Amount and date required" }, { status: 400 })
    }

    if (!member_id && !partner_name) {
      return NextResponse.json({ error: "Either member or partner name required" }, { status: 400 })
    }

    const [result] = await pool.execute(
      `
      INSERT INTO partnerships (member_id, partner_name, amount, date_given, recorded_by_user_id)
      VALUES (?, ?, ?, ?, ?)
    `,
      [member_id || null, partner_name, amount, date_given, user?.user_id],
    )

    return NextResponse.json({
      message: "Partnership recorded successfully",
      partnership_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Record partnership error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
