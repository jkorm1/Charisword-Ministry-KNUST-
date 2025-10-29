import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const programId = searchParams.get("programId")
    const date = searchParams.get("date")

    if (!serviceId && !programId) {
      return NextResponse.json({ 
        error: "Service ID or program ID required" 
      }, { status: 400 })
    }

    let query = `SELECT * FROM offerings WHERE 1=1`
    const params: any[] = []

    if (serviceId) {
      query += ` AND service_id = ?`
      params.push(serviceId)
    } else if (programId) {
      query += ` AND program_id = ?`
      params.push(programId)
    }

    if (date) {
      query += ` AND DATE(date_recorded) = ?`
      params.push(date)
    }

    query += ` ORDER BY created_at DESC LIMIT 1`

    const [rows] = await pool.execute(query, params)

    const exists = (rows as any[]).length > 0
    return NextResponse.json({
      exists,
      offering: exists ? (rows as any[])[0] : null
    })
  } catch (error) {
    console.error("Check offering error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}




