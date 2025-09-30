import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT o.offering_id, o.amount, o.date_recorded, o.created_at,
             s.service_date, s.service_type, s.topic,
             u.email as recorded_by
      FROM offerings o
      JOIN services s ON o.service_id = s.service_id
      LEFT JOIN users u ON o.recorded_by_user_id = u.user_id
      ORDER BY s.service_date DESC, o.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get offerings error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { service_id, amount, date_recorded } = await request.json()

    if (!service_id || !amount || !date_recorded) {
      return NextResponse.json({ error: "Service, amount, and date required" }, { status: 400 })
    }

     // Check for existing offering
    const [existingOfferings] = await pool.execute(
      `SELECT * FROM offerings 
       WHERE service_id = ? AND DATE(date_recorded) = ?`,
      [service_id, date_recorded]
    )

    if ((existingOfferings as any[]).length > 0) {
      return NextResponse.json({ 
        error: "An offering for this service and date already exists" 
      }, { status: 400 })
    }


    const [result] = await pool.execute(
      `INSERT INTO offerings 
       (service_id, amount, date_recorded, recorded_by_user_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [service_id, amount, date_recorded, user?.user_id]
    )

    return NextResponse.json({
      message: "Offering recorded successfully",
      offering_id: (result as any).insertId
    })
  } catch (error) {
    console.error("Create offering error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { offering_id, amount, date_recorded } = await request.json()

    if (!offering_id || !amount || !date_recorded) {
      return NextResponse.json({ error: "Offering ID, amount, and date required" }, { status: 400 })
    }

    const [result] = await pool.execute(
      `UPDATE offerings 
       SET amount = ?, date_recorded = ?, updated_at = NOW()
       WHERE offering_id = ?`,
      [amount, date_recorded, offering_id]
    )

    return NextResponse.json({
      message: "Offering updated successfully",
      offering_id
    })
  } catch (error) {
    console.error("Update offering error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

