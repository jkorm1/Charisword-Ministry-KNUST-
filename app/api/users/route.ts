import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin"])(user)

    const [rows] = await pool.execute(`
      SELECT u.user_id, u.email, u.role, u.assigned_cell_id, u.created_at,
             c.name as cell_name
      FROM users u
      LEFT JOIN cells c ON u.assigned_cell_id = c.cell_id
      ORDER BY u.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin"])(user)

    const { email, password, role, assigned_cell_id } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role required" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, role, assigned_cell_id) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, role, assigned_cell_id || null],
    )

    return NextResponse.json({
      message: "User created successfully",
      user_id: (result as any).insertId,
    })
  } catch (error: any) {
    console.error("Create user error:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
