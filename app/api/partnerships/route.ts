import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const cellId = searchParams.get("cellId")

    let query = `
      SELECT 
        m.member_id,
        m.full_name,
        c.name as cell_name,
        COALESCE(p.total_amount, 0) as total_partnerships,
        p.partnership_details,
        p.last_contribution_date
      FROM members m
      LEFT JOIN cells c ON m.cell_id = c.cell_id
      LEFT JOIN (
        SELECT 
          member_id,
          SUM(amount) as total_amount,
          GROUP_CONCAT(
            CONCAT(
              '{',
              '"amount":"', amount,
              '","date":"', date_given,
              '","partner_name":"', IFNULL(partner_name, ''),
              '"}'
            ) SEPARATOR '|'
          ) as partnership_details,
          MAX(date_given) as last_contribution_date
        FROM partnerships 
        WHERE 1=1
    `

    const params: any[] = []

    if (from) {
      query += " AND date_given >= ?"
      params.push(from)
    }

    if (to) {
      query += " AND date_given <= ?"
      params.push(to)
    }

    query += `
        GROUP BY member_id
      ) p ON m.member_id = p.member_id
      WHERE m.membership_status IN ('Member', 'Associate')
    `

    if (cellId) {
      query += " AND m.cell_id = ?"
      params.push(cellId)
    }

    query += " ORDER BY total_partnerships DESC, m.full_name ASC"

    const [rows] = await pool.execute(query, params)
    
    // Process partnership details for each member
    const processedRows = rows.map((row: any) => ({
      ...row,
      partnership_details: row.partnership_details 
        ? row.partnership_details.split('|').map(detail => JSON.parse(detail))
        : []
    }))

    return NextResponse.json(processedRows)
  } catch (error) {
    console.error("Get partnership reports error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
