import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const date = searchParams.get("date")

    if (!serviceId || !date) {
      return NextResponse.json({ error: "Service ID and date required" }, { status: 400 })
    }

    const [rows] = await pool.execute(
      `SELECT * FROM offerings 
       WHERE service_id = ? AND DATE(date_recorded) = ?`,
      [serviceId, date]
    )

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
