import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT s.service_id, s.service_date, s.service_type, s.topic, s.created_at,
             u.email as created_by_email,
             COUNT(a.attendance_id) as total_attendance
      FROM services s
      LEFT JOIN users u ON s.created_by_user_id = u.user_id
      LEFT JOIN attendance a ON s.service_id = a.service_id AND a.status = 'Present'
      GROUP BY s.service_id
      ORDER BY s.service_date DESC, s.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get services error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher"])(user)

    const { service_date, service_type, topic } = await request.json()

    if (!service_date || !service_type) {
      return NextResponse.json({ error: "Service date and type required" }, { status: 400 })
    }

    const [result] = await pool.execute(
      "INSERT INTO services (service_date, service_type, topic, created_by_user_id) VALUES (?, ?, ?, ?)",
      [service_date, service_type, topic, user?.user_id],
    )

    return NextResponse.json({
      message: "Service created successfully",
      service_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
