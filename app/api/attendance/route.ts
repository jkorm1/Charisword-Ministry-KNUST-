import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { service_id, present_member_ids } = await request.json()

    if (!service_id || !Array.isArray(present_member_ids)) {
      return NextResponse.json({ error: "Service ID and present member IDs required" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Delete existing attendance for this service
      await connection.execute("DELETE FROM attendance WHERE service_id = ?", [service_id])

      // Get all members
      const [allMembers] = await connection.execute(
        'SELECT member_id FROM members WHERE membership_status IN ("Member", "Associate", "FirstTimer")',
      )

      const allMemberIds = (allMembers as any[]).map((m) => m.member_id)

      // Insert attendance records
      for (const memberId of allMemberIds) {
        const status = present_member_ids.includes(memberId) ? "Present" : "Absent"

        await connection.execute(
          `
          INSERT INTO attendance (service_id, member_id, status, recorded_by_user_id, recorded_at)
          VALUES (?, ?, ?, ?, NOW())
        `,
          [service_id, memberId, status, user?.user_id],
        )
      }

      await connection.commit()

      return NextResponse.json({
        message: "Attendance recorded successfully",
        total_present: present_member_ids.length,
        total_members: allMemberIds.length,
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Record attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 })
    }

    let query = `
      SELECT a.attendance_id, a.status, a.recorded_at,
             m.member_id, m.full_name, m.gender, m.membership_status,
             c.name as cell_name, f.name as fold_name
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      LEFT JOIN cells c ON m.cell_id = c.cell_id
      LEFT JOIN folds f ON m.fold_id = f.fold_id
      WHERE a.service_id = ?
    `

    const params = [serviceId]

    // Cell leaders can only see their assigned cell
    if (user?.role === "cell_leader" && user.assigned_cell_id) {
      query += " AND m.cell_id = ?"
      params.push(user.assigned_cell_id)
    }

    query += " ORDER BY m.full_name ASC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
