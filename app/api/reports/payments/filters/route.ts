import { NextResponse, NextRequest} from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader"])(user);

    // Fetch services with their details
    const [servicesRows] = await pool.execute(`
      SELECT 
        service_id as id,
        service_type as type,
        topic,
        service_date as date,
        CONCAT(service_type, ' - ', IFNULL(topic, 'No topic')) as name
      FROM services 
      WHERE service_date IS NOT NULL
      ORDER BY service_date DESC
    `);

    // Fetch programs with their details
    const [programsRows] = await pool.execute(`
      SELECT 
        program_id as id,
        'program' as type,
        program_name as name,
        program_date as date
      FROM programs 
       WHERE program_name IS NOT NULL
      ORDER BY program_date DESC
    `);


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

    return NextResponse.json({
      services: servicesRows as any[],
      programs: programsRows as any[],
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
