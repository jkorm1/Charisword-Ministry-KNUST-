// app/api/reports/attendance/details/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

// --- Interfaces ---
interface Service {
  service_id: string
  service_date: string
  service_type: string
  topic: string
  [key: string]: any
}

interface Member {
  member_id: string
  full_name: string
  gender: string
  phone: string | null
  email: string | null
  membership_status?: string
  cell_name?: string
  attendance_status?: string
  member_status_at_time?: string
}


interface AttendanceSummary {
  members: { present: number; absent: number }
  associates: { present: number; absent: number }
  firstTimers: { present: number; absent: number }
}

interface OrganizationInfo {
  org_name?: string
  address?: string
  contact?: string
  [key: string]: any
}

interface DetailedAttendanceResponse {
  service: Service
  members: Member[]
  summary: AttendanceSummary
  organizationInfo: OrganizationInfo
}

// --- Route Handler ---
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // --- Get service details ---
    const [serviceRows] = await pool.execute("SELECT * FROM services WHERE service_id = ?", [serviceId])
    if ((serviceRows as any[]).length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    const service = (serviceRows as any[])[0]

    // --- Get detailed attendance info ---
  let detailedQuery = `
      WITH latest_attendance_status AS (
        SELECT 
          h.member_id,
          h.service_id,
          h.attendance_status,
          h.member_status_at_time,
          ROW_NUMBER() OVER (PARTITION BY h.member_id, h.service_id ORDER BY h.recorded_at DESC) as rn
        FROM attendance_status_history h
        WHERE h.service_id = ?
      )
      SELECT 
        m.member_id,
        m.full_name,
        m.gender,
        CASE 
          WHEN las.member_status_at_time = 'FirstTimer' THEN m.phone 
          ELSE m.phone 
        END as phone,
        m.email,
        m.membership_status,
        c.name AS cell_name,
        las.attendance_status,
        las.member_status_at_time
      FROM members m
      JOIN latest_attendance_status las ON m.member_id = las.member_id AND las.rn = 1
      LEFT JOIN cells c ON m.cell_id = c.cell_id
      WHERE las.service_id = ?
    `

    const params = [serviceId, serviceId]

    if (user?.role === "cell_leader") {
      detailedQuery += " AND m.cell_id = ?"
      params.push(user.assigned_cell_id)
    }

    detailedQuery += " ORDER BY las.member_status_at_time, las.attendance_status, m.full_name"

    const [memberRows] = await pool.execute(detailedQuery, params)

    // --- Get summary statistics ---
    const summaryQuery = `
      WITH latest_attendance_status AS (
        SELECT 
          h.member_id,
          h.service_id,
          h.attendance_status,
          h.member_status_at_time,
          ROW_NUMBER() OVER (PARTITION BY h.member_id, h.service_id ORDER BY h.recorded_at DESC) as rn
        FROM attendance_status_history h
        WHERE h.service_id = ?
      )
      SELECT 
        member_status_at_time,
        attendance_status,
        COUNT(DISTINCT member_id) AS count
      FROM latest_attendance_status
      WHERE rn = 1
      GROUP BY member_status_at_time, attendance_status
    `
    const [summaryRows] = await pool.execute(summaryQuery, [serviceId])

    // --- Build summary object ---
    const summary: AttendanceSummary = {
      members: { present: 0, absent: 0 },
      associates: { present: 0, absent: 0 },
      firstTimers: { present: 0, absent: 0 }
    }

    ;(summaryRows as any[]).forEach((row) => {
      const statusGroup = row.member_status_at_time
      const isPresent = row.attendance_status === "Present"
      const count = row.count

      if (statusGroup === "Member") {
        isPresent ? (summary.members.present = count) : (summary.members.absent = count)
      } else if (statusGroup === "Associate") {
        isPresent ? (summary.associates.present = count) : (summary.associates.absent = count)
      } else if (statusGroup === "FirstTimer") {
        isPresent ? (summary.firstTimers.present = count) : (summary.firstTimers.absent = count)
      }
    })

    // --- Get organization info ---
    const [orgInfo] = await pool.execute("SELECT * FROM organization_info LIMIT 1")

    // --- Return properly typed response ---
    return NextResponse.json<DetailedAttendanceResponse>({
      service,
      members: memberRows as Member[],
      summary,
      organizationInfo: (orgInfo as any[])[0] || {}
    })
  } catch (error) {
    console.error("Get detailed attendance reports error:", error)
    return NextResponse.json({ error: "Failed to fetch detailed reports" }, { status: 500 })
  }
}
