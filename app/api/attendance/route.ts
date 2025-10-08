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

      // Get all members with their current membership status
      const [allMembers] = await connection.execute(
        'SELECT member_id, membership_status FROM members WHERE membership_status IN ("Member", "Associate", "FirstTimer")',
      )

      const memberStatuses: Record<number, string> = {}
      const allMemberIds = (allMembers as any[]).map((m) => {
        memberStatuses[m.member_id] = m.membership_status
        return m.member_id
      })

      // Update existing attendance records or create new ones
      for (const memberId of allMemberIds) {
        const status = present_member_ids.includes(memberId) ? "Present" : "Absent"
        
     // Check if attendance record exists and get current status
      const [existingRecords] = await connection.execute(
        "SELECT attendance_id, status FROM attendance WHERE service_id = ? AND member_id = ?",
        [service_id, memberId]
      )

      if ((existingRecords as any[]).length > 0) {
        const existingRecord = (existingRecords as any[])[0]
        const previousStatus = existingRecord.status
        
        // Only update if status has changed
        if (previousStatus !== status) {
          // Update existing record
          await connection.execute(
            "UPDATE attendance SET status = ?, recorded_by_user_id = ?, recorded_at = NOW() WHERE service_id = ? AND member_id = ?",
            [status, user?.user_id, service_id, memberId]
          )
          
          // Update existing history record instead of creating a new one
          await connection.execute(
            "UPDATE attendance_status_history SET attendance_status = ?, recorded_at = NOW() WHERE attendance_id = ? AND member_id = ? AND service_id = ?",
            [status, existingRecord.attendance_id, memberId, service_id]
          )
        }
        } else {
          // Insert new record
          const [result] = await connection.execute(
            "INSERT INTO attendance (service_id, member_id, status, recorded_by_user_id, recorded_at) VALUES (?, ?, ?, ?, NOW())",
            [service_id, memberId, status, user?.user_id]
          )
          
          // Add to attendance history table with null previous status (since it's a new record)
          await connection.execute(
            "INSERT INTO attendance_status_history (attendance_id, member_id, service_id, attendance_status, member_status_at_time, previous_status) VALUES (?, ?, ?, ?, ?, ?)",
            [(result as any).insertId, memberId, service_id, status, memberStatuses[memberId], null]
          )
        }
      }

      // Then, check and update FirstTimers to Associates
    // Replace the FirstTimer promotion section with this:
      for (const memberId of present_member_ids) {
        const [memberInfo] = await connection.execute(
          "SELECT membership_status FROM members WHERE member_id = ?",
          [memberId]
        )

        if ((memberInfo as any[])[0]?.membership_status === "FirstTimer") {
          // Check attendance count including the current one
          const [attendanceCount] = await connection.execute(
            "SELECT COUNT(*) as count FROM attendance WHERE member_id = ? AND status = 'Present'",
            [memberId]
          )

          // If this is their second attendance or more, update to Associate
          if ((attendanceCount as any[])[0].count >= 2) {
            await connection.execute(
              "UPDATE members SET membership_status = 'Associate' WHERE member_id = ?",
              [memberId]
            )
            
            // Only update the current service's history record
            await connection.execute(
              "UPDATE attendance_status_history SET member_status_at_time = 'Associate' WHERE member_id = ? AND service_id = ?",
              [memberId, service_id]
            )
          }
        }
      }


      await connection.commit()

      // Get the final counts for the response
      const [attendanceCounts] = await connection.execute(
        "SELECT COUNT(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as total_present FROM attendance WHERE service_id = ?",
        [service_id]
      )

      return NextResponse.json({
        message: "Attendance recorded successfully",
        total_present: (attendanceCounts as any[])[0].total_present,
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
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Query to get attendance records for a specific service
    const query = `
      SELECT 
        a.attendance_id,
        a.member_id,
        a.status,
        a.recorded_at,
        m.full_name,
        m.membership_status
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      WHERE a.service_id = ?
      ORDER BY m.full_name
    `

    const [rows] = await pool.execute(query, [serviceId])
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
