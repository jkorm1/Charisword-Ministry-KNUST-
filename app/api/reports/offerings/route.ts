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

   let query = `
  SELECT 
    o.offering_id,
    o.amount,
    o.date_recorded,
    s.service_date,
    s.service_type,
    s.topic,
    u.email as recorded_by
  FROM offerings o
  JOIN services s ON o.service_id = s.service_id
  LEFT JOIN users u ON o.recorded_by_user_id = u.user_id
  WHERE 1=1
`;

const params: any[] = [];

if (from) {
  query += " AND o.date_recorded >= ?";
  params.push(from);
}

if (to) {
  query += " AND o.date_recorded <= ?";
  params.push(to);
}

query += " ORDER BY o.date_recorded DESC, s.service_date DESC";


    const [rows] = await pool.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Get offering reports error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch offering reports" },
      { status: 500 }
    );
  }
}