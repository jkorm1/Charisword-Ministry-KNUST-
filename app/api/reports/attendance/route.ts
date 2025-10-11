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
),
service_expected AS (
  SELECT 
    service_id,
    member_status_at_time,
    COUNT(DISTINCT member_id) as count
  FROM service_expected_attendance
  GROUP BY service_id, member_status_at_time
),
member_attendance AS (
  SELECT 
    service_id,
    member_status_at_time,
    attendance_status,
    COUNT(DISTINCT member_id) as count
  FROM latest_attendance_status
  WHERE rn = 1
  GROUP BY service_id, member_status_at_time, attendance_status
)
SELECT 
  s.service_id, 
  s.service_date, 
  s.service_type, 
  s.topic,
  
  -- Members statistics
  COALESCE(se1.count, 0) as expected_members,
  COALESCE(ma1_present.count, 0) as present_members,
  COALESCE(ma1_absent.count, 0) as absent_members,
  
  -- Associates statistics
  COALESCE(se2.count, 0) as expected_associates,
  COALESCE(ma2_present.count, 0) as present_associates,
  COALESCE(ma2_absent.count, 0) as absent_associates,
  
  -- First-timers statistics
  COALESCE(ma3_present.count, 0) as first_timers,
  
  -- Overall statistics
  COALESCE(total_present.count, 0) as total_present,
  COALESCE(total_absent.count, 0) as total_absent
FROM services s
LEFT JOIN service_expected se1 ON s.service_id = se1.service_id AND se1.member_status_at_time = 'Member'
LEFT JOIN service_expected se2 ON s.service_id = se2.service_id AND se2.member_status_at_time = 'Associate'

LEFT JOIN member_attendance ma1_present ON s.service_id = ma1_present.service_id 
  AND ma1_present.member_status_at_time = 'Member' 
  AND ma1_present.attendance_status = 'Present'
LEFT JOIN member_attendance ma1_absent ON s.service_id = ma1_absent.service_id 
  AND ma1_absent.member_status_at_time = 'Member' 
  AND ma1_absent.attendance_status = 'Absent'
LEFT JOIN member_attendance ma2_present ON s.service_id = ma2_present.service_id 
  AND ma2_present.member_status_at_time = 'Associate' 
  AND ma2_present.attendance_status = 'Present'
LEFT JOIN member_attendance ma2_absent ON s.service_id = ma2_absent.service_id 
  AND ma2_absent.member_status_at_time = 'Associate' 
  AND ma2_absent.attendance_status = 'Absent'
LEFT JOIN member_attendance ma3_present ON s.service_id = ma3_present.service_id 
  AND ma3_present.member_status_at_time = 'FirstTimer' 
  AND ma3_present.attendance_status = 'Present'
LEFT JOIN (
  SELECT service_id, COUNT(DISTINCT member_id) as count
  FROM latest_attendance_status
  WHERE rn = 1 AND attendance_status = 'Present'
  GROUP BY service_id
) total_present ON s.service_id = total_present.service_id
LEFT JOIN (
  SELECT service_id, COUNT(DISTINCT member_id) as count
  FROM latest_attendance_status
  WHERE rn = 1 AND attendance_status = 'Absent'
  GROUP BY service_id
) total_absent ON s.service_id = total_absent.service_id
LEFT JOIN members m ON s.service_id = s.service_id

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

