// app/api/partnerships/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

interface PartnershipDetail {
  amount: string;
  date: string;
  partner_name: string;
}

interface ProcessedRow {
  member_id: number;
  full_name: string;
  cell_name: string;
  total_partnerships: number;
  partnership_details: PartnershipDetail[];
  last_contribution_date: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { 
      member_id, 
      partner_name, 
      amount, 
      date_given,
      service_id,
      program_id 
    } = await request.json()

    // Validate required fields
    if (!partner_name || !amount || !date_given) {
      return NextResponse.json({ 
        error: "Partner name, amount, and date are required" 
      }, { status: 400 })
    }

    // Validate mutual exclusivity of service and program
    if (service_id && program_id) {
      return NextResponse.json({ 
        error: "Cannot associate partnership with both service and program" 
      }, { status: 400 })
    }

    // Validate amount
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number" 
      }, { status: 400 })
    }

    // Validate service/program existence if provided
    if (service_id) {
      const [service] = await pool.execute(
        "SELECT service_id FROM services WHERE service_id = ?",
        [service_id]
      )
      if (!(service as any[]).length) {
        return NextResponse.json({ 
          error: "Invalid service selected" 
        }, { status: 400 })
      }
    }

    if (program_id) {
      const [program] = await pool.execute(
        "SELECT program_id FROM programs WHERE program_id = ?",
        [program_id]
      )
      if (!(program as any[]).length) {
        return NextResponse.json({ 
          error: "Invalid program selected" 
        }, { status: 400 })
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO partnerships 
       (member_id, partner_name, amount, date_given, service_id, program_id, recorded_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id || null,
        partner_name,
        Number(amount),
        date_given,
        service_id || null,
        program_id || null,
        user?.user_id
      ]
    )

    return NextResponse.json({
      message: "Partnership recorded successfully",
      partnership_id: (result as any).insertId
    })
  } catch (error) {
    console.error("Create partnership error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET method for fetching partnership reports
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader", "cell_leader"])(user)

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

    // In the GET method, add cell filter for cell leaders
if (user?.role === "cell_leader" && user.assigned_cell_id) {
  query += " AND m.cell_id = ?"
  params.push(user.assigned_cell_id)
}


    query += " ORDER BY total_partnerships DESC, m.full_name ASC"

    const [rows] = await pool.execute(query, params)
    
    // Process partnership details for each member
    const processedRows = rows.map((row: any): ProcessedRow => ({
      member_id: Number(row.member_id) || 0,
      full_name: row.full_name || '',
      cell_name: row.cell_name || '',
      total_partnerships: Number(row.total_partnerships) || 0,
      partnership_details: row.partnership_details 
        ? row.partnership_details.split('|').map((detail: string) => JSON.parse(detail))
        : [],
      last_contribution_date: row.last_contribution_date || ''
    }))

    return NextResponse.json(processedRows)
  } catch (error) {
    console.error("Get partnership reports error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

