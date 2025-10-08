import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

// In app/api/reports/attendance/route.ts
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const cellId = searchParams.get("cellId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    // Using a Common Table Expression (CTE) to get the latest status from history
    let query = `
      WITH latest_attendance_status AS (
        SELECT 
          h.member_id,
          h.service_id,
          h.attendance_status,
          h.member_status_at_time,
          ROW_NUMBER() OVER (PARTITION BY h.member_id, h.service_id ORDER BY h.recorded_at DESC) as rn
        FROM attendance_status_history h
      )
      SELECT 
        s.service_id, 
        s.service_date, 
        s.service_type, 
        s.topic,
        
        -- Members statistics
        SUM(CASE WHEN las.member_status_at_time = 'Member' THEN 1 ELSE 0 END) as expected_members,
        SUM(CASE WHEN las.member_status_at_time = 'Member' AND las.attendance_status = 'Present' THEN 1 ELSE 0 END) as present_members,
        SUM(CASE WHEN las.member_status_at_time = 'Member' AND las.attendance_status = 'Absent' THEN 1 ELSE 0 END) as absent_members,
        
        -- Associates statistics
        SUM(CASE WHEN las.member_status_at_time = 'Associate' THEN 1 ELSE 0 END) as expected_associates,
        SUM(CASE WHEN las.member_status_at_time = 'Associate' AND las.attendance_status = 'Present' THEN 1 ELSE 0 END) as present_associates,
        SUM(CASE WHEN las.member_status_at_time = 'Associate' AND las.attendance_status = 'Absent' THEN 1 ELSE 0 END) as absent_associates,
        
        -- First-timers statistics - only count present first-timers
        SUM(CASE WHEN las.member_status_at_time = 'FirstTimer' AND las.attendance_status = 'Present' THEN 1 ELSE 0 END) as first_timers,
        
        -- Overall statistics
        SUM(CASE WHEN las.attendance_status = 'Present' THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN las.attendance_status = 'Absent' THEN 1 ELSE 0 END) as total_absent
      FROM services s
      LEFT JOIN latest_attendance_status las ON s.service_id = las.service_id AND las.rn = 1
      LEFT JOIN members m ON las.member_id = m.member_id
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
