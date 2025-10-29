// app/api/reports/payments/route.ts
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
    const category = searchParams.get("category")
    const programId = searchParams.get("programId")
    const serviceType = searchParams.get("serviceType") 
   // Get all programs for filter dropdown
const [programs] = await pool.execute(
  "SELECT program_id, program_name FROM programs ORDER BY program_name"
)

// Get all service types for filter dropdown
const [serviceTypes] = await pool.execute(
  "SELECT DISTINCT service_type FROM services WHERE service_type IS NOT NULL ORDER BY service_type"
)

// Get all payment categories for filter dropdown
const [categories] = await pool.execute(
  "SELECT DISTINCT payment_category FROM payments WHERE payment_category IS NOT NULL ORDER BY payment_category"
)

// Fetch unique services with their details
// Fetch unique services with their details
const [servicesRows] = await pool.execute(`
  SELECT 
    service_id,
    service_date,
    service_type,
    topic,
    DATE_FORMAT(service_date, '%W, %D %M %Y') as formatted_date
  FROM services 
  WHERE service_date IS NOT NULL
  ORDER BY service_date DESC
`);
const services = (servicesRows as any[]).map(row => ({
  id: row.service_id,
  type: row.service_type,
  topic: row.topic,
  date: row.formatted_date
}));



    // Main payments query with joins
let query = `
  SELECT 
    p.*,
    CASE 
      WHEN p.reference_type = 'program' THEN pr.program_name
      WHEN p.reference_type = 'service' THEN s.service_type
      ELSE 'Regular'
    END as reference_name,
    CASE 
      WHEN p.reference_type = 'program' THEN pr.program_date
      WHEN p.reference_type = 'service' THEN s.service_date
      ELSE NULL
    END as reference_date
  FROM payments p
  LEFT JOIN programs pr ON p.reference_type = 'program' AND p.reference_id = pr.program_id
  LEFT JOIN services s ON p.reference_type = 'service' AND p.reference_id = s.service_id
  WHERE 1=1
`

const params: any[] = []

if (from) {
  query += " AND DATE(p.payment_date) >= ?"
  params.push(from)
}

if (to) {
  query += " AND DATE(p.payment_date) <= ?"
  params.push(to)
}

if (category) {
  query += " AND p.payment_category = ?"
  params.push(category)
}

if (programId) {
  query += " AND (p.reference_type = 'program' AND p.reference_id = ?)"
  params.push(programId)
}

if (serviceType) {
  query += " AND (p.reference_type = 'service' AND s.service_type = ?)"
  params.push(serviceType)
}

if (serviceType) {
  offeringsQuery += " AND o.service_id = ?"
  offeringParams.push(serviceType)
}


query += " ORDER BY p.payment_date DESC, p.created_at DESC"



    const [rows] = await pool.execute(query, params)

    // Get total offerings separately
  let offeringsQuery = `
  SELECT COALESCE(SUM(amount), 0) as total_offerings
  FROM offerings o
  LEFT JOIN services s ON o.service_id = s.service_id
  WHERE 1=1
`
const offeringParams: any[] = []
if (from) {
  offeringsQuery += " AND o.date_recorded >= ?"
  offeringParams.push(from)
}
if (to) {
  offeringsQuery += " AND o.date_recorded <= ?"
  offeringParams.push(to)
}
if (programId) {
  offeringsQuery += " AND o.service_id IN (SELECT service_id FROM services WHERE service_id = ?)"
  offeringParams.push(programId)
}
if (serviceType) {
  offeringsQuery += " AND s.service_type = ?"
  offeringParams.push(serviceType)
}


    // Get total partnerships separately
    let partnershipsQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_partnerships
      FROM partnerships
      WHERE 1=1
    `
    const partnershipParams: any[] = []
    if (from) {
      partnershipsQuery += " AND date_given >= ?"
      partnershipParams.push(from)
    }
    if (to) {
      partnershipsQuery += " AND date_given <= ?"
      partnershipParams.push(to)
    }
    

    // Execute both queries separately
    const [offeringRows] = await pool.execute(offeringsQuery, offeringParams)
    const [partnershipRows] = await pool.execute(partnershipsQuery, partnershipParams)

    const total_offerings = (offeringRows as any[])[0].total_offerings
    const total_partnerships = (partnershipRows as any[])[0].total_partnerships

    // Calculate totals by category
    const categoryTotals = (rows as any[]).reduce((acc, row) => {
      const category = row.payment_category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += Number(row.amount)
      return acc
    }, {} as Record<string, number>)

    // Calculate total payments and available balance
    const totalPayments = rows.reduce((sum: number, row: any) => sum + Number(row.amount), 0)
    const totalReceipts = Number(total_offerings) + Number(total_partnerships)
    const availableBalance = totalReceipts - totalPayments

return NextResponse.json({
  payments: rows,
  programs: programs as any[],
   services,
  categories: (categories as any[]).map(c => c.payment_category),
  summary: {
    totalOfferings: Number(total_offerings),
    totalPartnerships: Number(total_partnerships),
    totalPayments,
    availableBalance,
    categoryTotals
  }
})
  } catch (error) {
    console.error("Get payment reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
