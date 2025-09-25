import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const cellId = searchParams.get("cellId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = `
      SELECT 
        s.service_id, s.service_date, s.service_type, s.topic,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as total_present,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as total_absent,
        COUNT(CASE WHEN a.status = 'Present' AND m.membership_status = 'FirstTimer' THEN 1 END) as first_timers,
        COUNT(CASE WHEN a.status = 'Present' AND m.membership_status = 'Associate' THEN 1 END) as associates,
        COUNT(CASE WHEN a.status = 'Present' AND m.membership_status = 'Member' THEN 1 END) as members
      FROM services s
      LEFT JOIN attendance a ON s.service_id = a.service_id
      LEFT JOIN members m ON a.member_id = m.member_id
    `

    const params: any[] = []
    const conditions: string[] = []

    if (serviceId) {
      conditions.push("s.service_id = ?")
      params.push(serviceId)
    }

    if (cellId) {
      conditions.push("m.cell_id = ?")
      params.push(cellId)
    }

    // Cell leaders can only see their assigned cell
    if (user?.role === "cell_leader" && user.assigned_cell_id) {
      conditions.push("m.cell_id = ?")
      params.push(user.assigned_cell_id)
    }

    if (from) {
      conditions.push("s.service_date >= ?")
      params.push(from)
    }

    if (to) {
      conditions.push("s.service_date <= ?")
      params.push(to)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " GROUP BY s.service_id, s.service_date, s.service_type, s.topic ORDER BY s.service_date DESC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get attendance reports error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
