// app/api/programs/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT program_id, program_name, program_date, description, created_at
      FROM programs
      ORDER BY program_date DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get programs error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { program_name, program_date, description } = await request.json()

    if (!program_name || !program_date) {
      return NextResponse.json({ 
        error: "Program name and date are required" 
      }, { status: 400 })
    }

    const [result] = await pool.execute(
      `INSERT INTO programs (program_name, program_date, description, created_at)
       VALUES (?, ?, ?, NOW())`,
      [program_name, program_date, description || null]
    )

    return NextResponse.json({
      message: "Program created successfully",
      program_id: (result as any).insertId
    })
  } catch (error) {
    console.error("Create program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
