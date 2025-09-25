import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const [rows] = await pool.execute(
      "SELECT user_id, email, password_hash, role, assigned_cell_id FROM users WHERE email = ?",
      [email],
    )

    const users = rows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      assigned_cell_id: user.assigned_cell_id,
    })

    const response = NextResponse.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        assigned_cell_id: user.assigned_cell_id,
      },
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
