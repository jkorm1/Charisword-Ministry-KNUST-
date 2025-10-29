// app/api/payments/route.ts

import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

// ==============================
// GET - Fetch Payments
// ==============================
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const referenceId = searchParams.get("referenceId")
    const referenceType = searchParams.get("referenceType")

    let query = `
      SELECT 
        p.*,
        CASE 
          WHEN p.reference_type = 'service' THEN s.service_type
          WHEN p.reference_type = 'program' THEN pr.program_name
        END as reference_name,
        CASE 
          WHEN p.reference_type = 'service' THEN s.service_date
          WHEN p.reference_type = 'program' THEN pr.program_date
        END as reference_date,
        u.email as recorded_by
      FROM payments p
      LEFT JOIN users u ON p.recorded_by_user_id = u.user_id
      LEFT JOIN services s ON p.reference_type = 'service' AND p.reference_id = s.service_id
      LEFT JOIN programs pr ON p.reference_type = 'program' AND p.reference_id = pr.program_id
      WHERE 1=1
    `

    const params: any[] = []

    if (category) {
      query += " AND p.payment_category = ?"
      params.push(category)
    }

    if (referenceId && referenceType) {
      query += " AND p.reference_id = ? AND p.reference_type = ?"
      params.push(referenceId, referenceType)
    }

    query += " ORDER BY p.created_at DESC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

// ==============================
// POST - Create Payment
// ==============================
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const {
      amount,
      payment_type,
      payment_category,
      reference_id,
      reference_type,
      description,
      is_recurring,
      payment_date,
    } = await request.json()

    if (!amount || !payment_type || !payment_category) {
      return NextResponse.json(
        { error: "Amount, payment type, and payment category are required" },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      `
        INSERT INTO payments (
          amount, 
          payment_type, 
          payment_category, 
          reference_id, 
          reference_type, 
          description, 
          is_recurring, 
          payment_date,
          recorded_by_user_id, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        amount,
        payment_type,
        payment_category,
        reference_id,
        reference_type,
        description || null,
        Boolean(is_recurring),
        payment_date,
        user?.user_id,
      ]
    )

    return NextResponse.json({
      message: "Payment recorded successfully",
      payment_id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ==============================
// PUT - Update Payment
// ==============================
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const {
      payment_id,
      amount,
      payment_type,
      payment_category,
      reference_id,
      reference_type,
      description,
      is_recurring,
    } = await request.json()

    if (!payment_id || !amount || !payment_type || !payment_category) {
      return NextResponse.json(
        {
          error: "Payment ID, amount, payment type, and payment category are required",
        },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      `
        UPDATE payments 
        SET 
          amount = ?, 
          payment_type = ?, 
          payment_category = ?, 
          reference_id = ?, 
          reference_type = ?, 
          description = ?, 
          is_recurring = ?, 
          updated_at = NOW()
        WHERE payment_id = ?
      `,
      [
        amount,
        payment_type,
        payment_category,
        reference_id,
        reference_type,
        description || null,
        is_recurring || false,
        payment_id,
      ]
    )

    return NextResponse.json({
      message: "Payment updated successfully",
      payment_id,
    })
  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}