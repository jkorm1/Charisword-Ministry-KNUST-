import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    requireRole(["admin", "usher", "cell_leader", "finance_leader"])(user)

    const [rows] = await pool.execute(`
      SELECT s.service_id, s.service_date, s.service_type, s.topic, s.created_at,
             u.email as created_by_email,
             COUNT(a.attendance_id) as total_attendance
      FROM services s
      LEFT JOIN users u ON s.created_by_user_id = u.user_id
      LEFT JOIN attendance a ON s.service_id = a.service_id AND a.status = 'Present'
      GROUP BY s.service_id
      ORDER BY s.service_date DESC, s.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get services error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    requireRole(["admin", "usher"])(user)

    const { service_date, service_type, topic } = await request.json()

    if (!service_date || !service_type) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          service_date: !service_date ? "Service date is required" : null,
          service_type: !service_type ? "Service type is required" : null
        }
      }, { status: 400 })
    }

    const [result] = await pool.execute(
      "INSERT INTO services (service_date, service_type, topic, created_by_user_id) VALUES (?, ?, ?, ?)",
      [service_date, service_type, topic, user.user_id]
    )

    return NextResponse.json({
      message: "Service created successfully",
      service_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create service error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    requireRole(["admin", "usher"])(user)

    const { service_id, service_date, service_type, topic } = await request.json()

    if (!service_id || !service_date || !service_type) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          service_id: !service_id ? "Service ID is required" : null,
          service_date: !service_date ? "Service date is required" : null,
          service_type: !service_type ? "Service type is required" : null
        }
      }, { status: 400 })
    }

    await pool.execute(
      "UPDATE services SET service_date = ?, service_type = ?, topic = ? WHERE service_id = ?",
      [service_date, service_type, topic, service_id]
    )

    return NextResponse.json({
      message: "Service updated successfully",
      service_id
    })
  } catch (error) {
    console.error("Update service error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}
