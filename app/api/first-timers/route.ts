import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { service_id, first_timers } = await request.json()

    if (!service_id || !Array.isArray(first_timers) || first_timers.length === 0) {
      return NextResponse.json({ error: "Service ID and first-timers data required" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const results = []

      for (const firstTimer of first_timers) {
        const { full_name, gender, residence, phone, email, inviter_member_id } = firstTimer

        if (!full_name || !gender) {
          await connection.rollback()
          return NextResponse.json({ error: "Name and gender required for all first-timers" }, { status: 400 })
        }

        // Create first-timer record
        const [firstTimerResult] = await connection.execute(
          `
          INSERT INTO first_timers (
            full_name, gender, residence, phone, email, 
            inviter_member_id, service_id, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [full_name, gender, residence, phone, email, inviter_member_id, service_id, firstTimer.status],
        )

        // In the POST method, when fetching inviter info
const [inviterInfo] = await connection.execute(
  "SELECT cell_id FROM members WHERE member_id = ?" + 
  (user?.role === "cell_leader" ? " AND cell_id = ?" : ""),
  user?.role === "cell_leader" 
    ? [inviter_member_id, user.assigned_cell_id]
    : [inviter_member_id]
);


        const inviterCellId = (inviterInfo as any[])[0]?.cell_id;

        // Create temporary member record
        const [memberResult] = await connection.execute(
          `
          INSERT INTO members (
            full_name, gender, residence, phone, email, 
            inviter_member_id, membership_status, date_joined, cell_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `,
          [full_name, gender, residence, phone, email, inviter_member_id, firstTimer.status === "Stay" ? "Member" : "FirstTimer", inviterCellId],
        )

        const memberId = (memberResult as any).insertId

        // Create attendance record
        const [attendanceResult] = await connection.execute(
          `
          INSERT INTO attendance (service_id, member_id, status, recorded_by_user_id, recorded_at)
          VALUES (?, ?, 'Present', ?, NOW())
        `,
          [service_id, memberId, user?.user_id],
        )

        // Add to attendance history table
        await connection.execute(
          `
          INSERT INTO attendance_status_history (attendance_id, member_id, service_id, attendance_status, member_status_at_time)
          VALUES (?, ?, ?, ?, ?)
        `,
          [(attendanceResult as any).insertId, memberId, service_id, 'Present', 'firstTimer']
        )

        results.push({
          first_timer_id: (firstTimerResult as any).insertId,
          member_id: memberId,
          membership_status: firstTimer.status === "Stay" ? "Member" : "FirstTimer"
        })
      }

      await connection.commit()

      return NextResponse.json({
        message: `${results.length} first-timers recorded successfully`,
        results
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Record first-timers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT ft.first_timer_id, ft.full_name, ft.gender, ft.residence, 
             ft.phone, ft.email, ft.status, ft.created_at,
             s.service_date, s.service_type,
             inv.full_name as inviter_name
      FROM first_timers ft
      LEFT JOIN services s ON ft.service_id = s.service_id
      LEFT JOIN members inv ON ft.inviter_member_id = inv.member_id
      ORDER BY ft.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get first-timers error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
