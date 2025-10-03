import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher"])(user)

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
    requireRole(["admin"])(user)

    const member_id = params.id
    if (!member_id || isNaN(Number(member_id))) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
    }

    await pool.execute("DELETE FROM members WHERE member_id = ?", [member_id])

    return NextResponse.json({
      message: "Member deleted successfully",
      member_id: Number(member_id)
    })
  } catch (error) {
    console.error("Delete member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
