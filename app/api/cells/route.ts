import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const cellId = searchParams.get("cellId")

    let query = `
      SELECT c.cell_id, c.name, c.description, c.created_at,
             COUNT(m.member_id) as member_count
      FROM cells c
      LEFT JOIN members m ON c.cell_id = m.cell_id AND m.membership_status IN ('Member', 'Associate')
    `

    const params: any[] = []

    if (cellId) {
      query += " WHERE c.cell_id = ?"
      params.push(cellId)
    }

    query += " GROUP BY c.cell_id, c.name, c.description, c.created_at ORDER BY c.name ASC"

    const [rows] = await pool.execute(query, params)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get cells error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin"])(user)

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Cell name required" }, { status: 400 })
    }

    const [result] = await pool.execute("INSERT INTO cells (name, description) VALUES (?, ?)", [name, description])

    return NextResponse.json({
      message: "Cell created successfully",
      cell_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create cell error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
