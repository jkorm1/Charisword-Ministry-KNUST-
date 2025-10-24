// app/api/payments/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

// ==============================
// DELETE - Delete Payment
// ==============================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const paymentId = params.id

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      )
    }

    // Check if payment exists
    const [existingPayment] = await pool.execute(
      "SELECT payment_id FROM payments WHERE payment_id = ?",
      [paymentId]
    )

    if (!existingPayment || (existingPayment as any[]).length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Delete the payment
    await pool.execute(
      "DELETE FROM payments WHERE payment_id = ?",
      [paymentId]
    )

    return NextResponse.json({
      message: "Payment deleted successfully",
      payment_id: parseInt(paymentId)
    })
  } catch (error) {
    console.error("Delete payment error:", error)
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}

// ==============================
// PUT - Update Payment by ID
// ==============================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const paymentId = params.id
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

    if (!paymentId || !amount || !payment_type || !payment_category) {
      return NextResponse.json(
        {
          error: "Payment ID, amount, payment type, and payment category are required",
        },
        { status: 400 }
      )
    }

    // Check if payment exists
    const [existingPayment] = await pool.execute(
      "SELECT payment_id FROM payments WHERE payment_id = ?",
      [paymentId]
    )

    if (!existingPayment || (existingPayment as any[]).length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Update the payment
    await pool.execute(
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
          payment_date = ?,
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
        Boolean(is_recurring),
        payment_date,
        paymentId
      ]
    )

    return NextResponse.json({
      message: "Payment updated successfully",
      payment_id: parseInt(paymentId)
    })
  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}
