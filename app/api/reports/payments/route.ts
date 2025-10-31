// app/api/reports/payments/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    requireRole(["admin", "finance_leader"])(user);

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const category = searchParams.get("category");
    const serviceId = searchParams.get("serviceId");
    const referenceType = searchParams.get("referenceType");

    // Main payments query
    let query = `
      SELECT 
        p.*,
        CASE 
          WHEN p.reference_type = 'program' THEN pr.program_name
          WHEN p.reference_type = 'service' THEN CONCAT(s.service_type, ' - ', IFNULL(s.topic, 'No topic'))
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
    `;

    const params: any[] = [];

    if (from) {
      query += " AND DATE(p.payment_date) >= ?";
      params.push(from);
    }

    if (to) {
      query += " AND DATE(p.payment_date) <= ?";
      params.push(to);
    }

    if (category && category !== 'all') {
      query += " AND p.payment_category = ?";
      params.push(category);
    }

    // Handle service/program filtering
    if (referenceType) {
      if (referenceType === 'service:all') {
        query += " AND p.reference_type = 'service'";
      } else if (referenceType === 'program:all') {
        query += " AND p.reference_type = 'program'";
      } else if (referenceType === 'service' && serviceId) {
        query += " AND p.reference_type = 'service' AND p.reference_id = ?";
        params.push(serviceId);
      } else if (referenceType === 'program' && serviceId) {
        query += " AND p.reference_type = 'program' AND p.reference_id = ?";
        params.push(serviceId);
      }
    }

    query += " ORDER BY p.payment_date DESC, p.created_at DESC";

    const [rows] = await pool.execute(query, params);

    // Get total offerings
    let offeringsQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_offerings
      FROM offerings o
      LEFT JOIN services s ON o.service_id = s.service_id
      WHERE 1=1
    `;
    const offeringParams: any[] = [];
    
    if (from) {
      offeringsQuery += " AND o.date_recorded >= ?";
      offeringParams.push(from);
    }
    if (to) {
      offeringsQuery += " AND o.date_recorded <= ?";
      offeringParams.push(to);
    }

    // Add service/program filtering for offerings
    if (referenceType) {
      if (referenceType === 'service:all') {
        offeringsQuery += " AND o.service_id IS NOT NULL";
      } else if (referenceType === 'program:all') {
        offeringsQuery += " AND o.program_id IS NOT NULL";
      } else if (referenceType === 'service' && serviceId) {
        offeringsQuery += " AND o.service_id = ?";
        offeringParams.push(serviceId);
      } else if (referenceType === 'program' && serviceId) {
        offeringsQuery += " AND o.program_id = ?";
        offeringParams.push(serviceId);
      }
    }

    // Get total partnerships
    let partnershipsQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_partnerships
      FROM partnerships p
      WHERE 1=1
    `;
    const partnershipParams: any[] = [];
    
    if (from) {
      partnershipsQuery += " AND p.date_given >= ?";
      partnershipParams.push(from);
    }
    if (to) {
      partnershipsQuery += " AND p.date_given <= ?";
      partnershipParams.push(to);
    }

    // Add service/program filtering for partnerships
    if (referenceType) {
      if (referenceType === 'service:all') {
        partnershipsQuery += " AND p.service_id IS NOT NULL";
      } else if (referenceType === 'program:all') {
        partnershipsQuery += " AND p.program_id IS NOT NULL";
      } else if (referenceType === 'service' && serviceId) {
        partnershipsQuery += " AND p.service_id = ?";
        partnershipParams.push(serviceId);
      } else if (referenceType === 'program' && serviceId) {
        partnershipsQuery += " AND p.program_id = ?";
        partnershipParams.push(serviceId);
      }
    }

    // Execute all queries
    const [offeringRows] = await pool.execute(offeringsQuery, offeringParams);
    const [partnershipRows] = await pool.execute(partnershipsQuery, partnershipParams);

    const total_offerings = (offeringRows as any[])[0].total_offerings;
    const total_partnerships = (partnershipRows as any[])[0].total_partnerships;

    // Calculate totals by category
    const categoryTotals = (rows as any[]).reduce((acc, row) => {
      const category = row.payment_category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(row.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calculate total payments and available balance
    const totalPayments = rows.reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const totalReceipts = Number(total_offerings) + Number(total_partnerships);
    const availableBalance = totalReceipts - totalPayments;

    return NextResponse.json({
      payments: rows,
      summary: {
        totalOfferings: Number(total_offerings),
        totalPartnerships: Number(total_partnerships),
        totalPayments,
        totalReceipts,
        availableBalance,
        categoryTotals
      }
    });
  } catch (error) {
    console.error("Get payment reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
