// app/api/programs/[programId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { programId: string } }
) {
  console.log("Fetching program payments for programId:", params.programId);
  
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader"])(user);

    // Add logging to see the actual query
    const query = `
      SELECT 
        p.*,
         u.email  as recorded_by
      FROM payments p
      LEFT JOIN users u ON p.recorded_by_user_id = u.user_id
      WHERE p.reference_id = ? AND p.reference_type = 'program'
      ORDER BY p.payment_date DESC
    `;
    console.log("Executing query:", query);
    console.log("With params:", [params.programId]);

    const [rows] = await pool.execute(query, [params.programId]);
    console.log("Query result:", rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Get program payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch program payments", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
