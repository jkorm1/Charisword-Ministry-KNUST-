import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher"])(user)

    const { full_name, gender, residence, phone, email, inviter_member_id, service_id, status } = await request.json()

    if (!full_name || !gender || !service_id || !status) {
      return NextResponse.json({ error: "Name, gender, service, and status required" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Create first-timer record
      const [firstTimerResult] = await connection.execute(
        `
        INSERT INTO first_timers (
          full_name, gender, residence, phone, email, 
          inviter_member_id, service_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [full_name, gender, residence, phone, email, inviter_member_id, service_id, status],
      )

      let memberId: number
      let membershipStatus: string

      if (status === "Stay") {
        // Create member record for Stay status
        membershipStatus = "Member"

        // Get inviter's cell and fold info
        let cellId = null,
          foldId = null
        if (inviter_member_id) {
          const [inviterRows] = await connection.execute("SELECT cell_id, fold_id FROM members WHERE member_id = ?", [
            inviter_member_id,
          ])
          if ((inviterRows as any[]).length > 0) {
            cellId = (inviterRows as any[])[0].cell_id
            foldId = (inviterRows as any[])[0].fold_id
          }
        }

        const [memberResult] = await connection.execute(
          `
          INSERT INTO members (
            full_name, gender, residence, phone, email, 
            cell_id, fold_id, inviter_member_id, membership_status, date_joined
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
          [full_name, gender, residence, phone, email, cellId, foldId, inviter_member_id, membershipStatus],
        )

        memberId = (memberResult as any).insertId
      } else {
        // Create temporary member record for Visit status
        membershipStatus = "FirstTimer"

        const [memberResult] = await connection.execute(
          `
          INSERT INTO members (
            full_name, gender, residence, phone, email, 
            inviter_member_id, membership_status, date_joined
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
          [full_name, gender, residence, phone, email, inviter_member_id, membershipStatus],
        )

        memberId = (memberResult as any).insertId
      }

      // Create attendance record
      await connection.execute(
        `
        INSERT INTO attendance (service_id, member_id, status, recorded_by_user_id, recorded_at)
        VALUES (?, ?, 'Present', ?, NOW())
      `,
        [service_id, memberId, user?.user_id],
      )

      await connection.commit()

      return NextResponse.json({
        message: "First-timer recorded successfully",
        first_timer_id: (firstTimerResult as any).insertId,
        member_id: memberId,
        membership_status: membershipStatus,
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Record first-timer error:", error)
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
