import { NextResponse, NextRequest} from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader"])(user);

// Fetch unique categories
const [categoriesRows] = await pool.execute(`
  SELECT DISTINCT payment_category 
  FROM payments 
  WHERE payment_category IS NOT NULL
  ORDER BY payment_category
`);
const categories = (categoriesRows as any[]).map(row => row.payment_category);

    // Fetch unique service types
    const [serviceTypesRows] = await pool.execute(`
      SELECT DISTINCT service_type 
      FROM services 
      WHERE service_type IS NOT NULL
      ORDER BY service_type
    `);
    const serviceTypes = (serviceTypesRows as any[]).map(row => row.service_type);

    // Fetch programs
    const [programsRows] = await pool.execute(`
      SELECT program_id, program_name 
      FROM programs 
      ORDER BY program_name
    `);
    const programs = (programsRows as any[]).map(row => ({
      id: row.program_id,
      name: row.program_name,
    }));

    return NextResponse.json({
      categories,
      serviceTypes,
      programs,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
