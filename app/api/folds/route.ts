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
      SELECT f.fold_id, f.name, f.description, f.created_at,
             c.name as cell_name, c.cell_id,
             COUNT(m.member_id) as member_count
      FROM folds f
      JOIN cells c ON f.cell_id = c.cell_id
      LEFT JOIN members m ON f.fold_id = m.fold_id AND m.membership_status IN ('Member', 'Associate')
    `

    const params: any[] = []
    if (cellId) {
      query += " WHERE f.cell_id = ?"
      params.push(cellId)
    }

    query +=
      " GROUP BY f.fold_id, f.name, f.description, f.created_at, c.name, c.cell_id ORDER BY c.name ASC, f.name ASC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get folds error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin"])(user)

    const { cell_id, name, description } = await request.json()

    if (!cell_id || !name) {
      return NextResponse.json({ error: "Cell ID and fold name required" }, { status: 400 })
    }

    const [result] = await pool.execute("INSERT INTO folds (cell_id, name, description) VALUES (?, ?, ?)", [
      cell_id,
      name,
      description,
    ])

    return NextResponse.json({
      message: "Fold created successfully",
      fold_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create fold error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
