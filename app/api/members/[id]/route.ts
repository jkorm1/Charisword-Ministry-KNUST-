import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const member_id = params.id
    if (!member_id || isNaN(Number(member_id))) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
    }

    const { full_name, gender, residence, phone, email, cell_id, fold_id, membership_status } =
      await request.json()

    if (!full_name || !gender) {
      return NextResponse.json({ error: "Name and gender required" }, { status: 400 })
    }

    await pool.execute(
      `
      UPDATE members SET
        full_name = ?, gender = ?, residence = ?, phone = ?, email = ?, 
        cell_id = ?, fold_id = ?, membership_status = ?
      WHERE member_id = ?
    `,
      [
        full_name, 
        gender, 
        residence || null,
        phone || null,
        email || null,
        cell_id || null,
        fold_id || null,
        membership_status || "Member",
        member_id
      ]
    )

    return NextResponse.json({
      message: "Member updated successfully",
      member_id: Number(member_id)
    })
  } catch (error) {
    console.error("Update member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "cell_leader"])(user)

    const member_id = params.id
    if (!member_id || isNaN(Number(member_id))) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Check if the member exists and get their cell_id
      const [memberRows] = await connection.execute(
        "SELECT cell_id FROM members WHERE member_id = ?",
        [member_id]
      )

      if ((memberRows as any[]).length === 0) {
        await connection.rollback()
        return NextResponse.json({ error: "Member not found" }, { status: 404 })
      }

      const memberCellId = (memberRows as any[])[0].cell_id

      // Check cell leader permissions
      if (user?.role === "cell_leader") {
        if (memberCellId !== user.assigned_cell_id) {
          await connection.rollback()
          return NextResponse.json({ error: "Unauthorized to delete member from another cell" }, { status: 403 })
        }
      }

      // Get all attendance records for this member
      const [attendanceRecords] = await connection.execute(
        "SELECT attendance_id FROM attendance WHERE member_id = ?",
        [member_id]
      )

      // Delete from attendance_status_history first (most dependent)
      if ((attendanceRecords as any[]).length > 0) {
        const attendanceIds = (attendanceRecords as any[]).map(r => r.attendance_id)
        const placeholders = attendanceIds.map(() => '?').join(',')
        await connection.execute(
          `DELETE FROM attendance_status_history WHERE attendance_id IN (${placeholders})`,
          attendanceIds
        )
      }

      // Delete from attendance
      await connection.execute("DELETE FROM attendance WHERE member_id = ?", [member_id])

      // Delete from service_expected_attendance
      await connection.execute("DELETE FROM service_expected_attendance WHERE member_id = ?", [member_id])

      // Delete from partnerships
      await connection.execute("DELETE FROM partnerships WHERE member_id = ?", [member_id])

      // Finally delete the member
      await connection.execute("DELETE FROM members WHERE member_id = ?", [member_id])

      await connection.commit()

      return NextResponse.json({
        message: "Member deleted successfully",
        member_id: Number(member_id)
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Delete member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
