import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const cellId = searchParams.get("cellId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    // Modified query to only get services with attendance data
    // In app/api/reports/attendance/route.ts

// Modified query to properly filter by cell for cell leaders
let query = `
  WITH latest_attendance_status AS (
    SELECT 
      h.member_id,
      h.service_id,
      h.attendance_status,
      h.member_status_at_time,
      ROW_NUMBER() OVER (PARTITION BY h.member_id, h.service_id ORDER BY h.recorded_at DESC) as rn
    FROM attendance_status_history h
    INNER JOIN services s ON h.service_id = s.service_id
    INNER JOIN members m ON h.member_id = m.member_id
    ${user?.role === "cell_leader" ? "WHERE m.cell_id = ?" : ""}
  ),
  service_expected AS (
    SELECT 
      sea.service_id,
      sea.member_status_at_time,
      COUNT(DISTINCT sea.member_id) as count
    FROM service_expected_attendance sea
    INNER JOIN members m ON sea.member_id = m.member_id
    ${user?.role === "cell_leader" ? "WHERE m.cell_id = ?" : ""}
    GROUP BY sea.service_id, sea.member_status_at_time
  ),
  member_attendance AS (
    SELECT 
      h.service_id,
      h.member_status_at_time,
      h.attendance_status,
      COUNT(DISTINCT h.member_id) as count
    FROM latest_attendance_status h
    WHERE h.rn = 1
    GROUP BY h.service_id, h.member_status_at_time, h.attendance_status
  )
  SELECT DISTINCT
    s.service_id, 
    s.service_date, 
    s.service_type, 
    s.topic,
    EXISTS(SELECT 1 FROM attendance_status_history h WHERE h.service_id = s.service_id) as has_attendance,
    
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
  INNER JOIN attendance_status_history h ON s.service_id = h.service_id
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
`

const params: any[] = []
const conditions: string[] = []

// Add cell filter to params if user is cell leader
if (user?.role === "cell_leader" && user.assigned_cell_id) {
  params.push(user.assigned_cell_id) // For latest_attendance_status CTE
  params.push(user.assigned_cell_id) // For service_expected CTE
}

if (serviceId) {
  conditions.push("s.service_id = ?")
  params.push(serviceId)
}

if (cellId) {
  conditions.push("EXISTS (SELECT 1 FROM members m WHERE m.member_id = h.member_id AND m.cell_id = ?)")
  params.push(cellId)
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

query += " GROUP BY s.service_id, s.service_date, s.service_type, s.topic HAVING has_attendance = 1 ORDER BY s.service_date DESC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get attendance reports error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
