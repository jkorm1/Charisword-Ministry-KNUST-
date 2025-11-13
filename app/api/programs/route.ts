// app/api/programs/route.ts
import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  console.log("Fetching all programs");
  
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader", "cell_leader"])(user);

    const [rows] = await pool.execute(
      `SELECT * FROM programs ORDER BY program_date DESC`
    );
    console.log("Programs fetched:", rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Get programs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// app/api/payments/route.ts
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader", "cell_leader"])(user);

    const paymentData = await request.json();
    console.log("Creating payment:", paymentData);

    const [result] = await pool.execute(
      `INSERT INTO payments (
        amount, payment_type, payment_category, reference_id, 
        reference_type, description, is_recurring, payment_date, 
        recorded_by_user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymentData.amount,
        paymentData.payment_type,
        paymentData.payment_category,
        paymentData.reference_id,
        paymentData.reference_type,
        paymentData.description,
        paymentData.is_recurring,
        paymentData.payment_date,
        user.user_id
      ]
    );

    return NextResponse.json({
      message: "Payment created successfully",
      payment_id: (result as any).insertId
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader", "cell_leader"])(user);

    const { payment_id, ...paymentData } = await request.json();
    console.log("Updating payment:", payment_id, paymentData);

    const [result] = await pool.execute(
      `UPDATE payments SET 
        amount = ?, payment_type = ?, payment_category = ?, 
        description = ?, payment_date = ?, updated_at = NOW()
      WHERE payment_id = ?`,
      [
        paymentData.amount,
        paymentData.payment_type,
        paymentData.payment_category,
        paymentData.description,
        paymentData.payment_date,
        payment_id
      ]
    );

    return NextResponse.json({
      message: "Payment updated successfully"
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
