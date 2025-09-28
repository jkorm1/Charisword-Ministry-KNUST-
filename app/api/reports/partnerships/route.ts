// app/api/reports/partnerships/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

interface PartnershipDetail {
  amount: number;
  date: string;
  partner_name: string;
}

interface PartnershipReport {
  id: string;
  full_name: string;
  cell_name: string;
  total_partnerships: number;
  number_of_contributions: number;
  last_contribution_date: string | null;
  status: string;
  partnership_details: PartnershipDetail[];
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "finance_leader"])(user)

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const cellId = searchParams.get("cellId")

    // Get all members with their partnership details
    let membersQuery = `
      SELECT 
        m.member_id,
        m.full_name,
        c.name as cell_name,
        m.membership_status,
        COALESCE(SUM(p.amount), 0) as total_partnerships,
        COUNT(p.partnership_id) as number_of_contributions,
        MAX(p.date_given) as last_contribution_date,
        GROUP_CONCAT(
          JSON_OBJECT(
            'amount', p.amount,
            'date', p.date_given,
            'partner_name', p.partner_name
          )
        ) as partnership_details
      FROM members m
      LEFT JOIN cells c ON m.cell_id = c.cell_id
      LEFT JOIN partnerships p ON m.member_id = p.member_id
      WHERE m.membership_status IN ('Member', 'Associate')
    `

    const params: any[] = []

    if (from) {
      membersQuery += " AND (p.date_given >= ? OR p.date_given IS NULL)"
      params.push(from)
    }

    if (to) {
      membersQuery += " AND (p.date_given <= ? OR p.date_given IS NULL)"
      params.push(to)
    }

    if (cellId) {
      membersQuery += " AND m.cell_id = ?"
      params.push(cellId)
    }

    membersQuery += `
      GROUP BY m.member_id, m.full_name, c.name, m.membership_status
      ORDER BY total_partnerships DESC, m.full_name ASC
    `

    const [members] = await pool.execute(membersQuery, params)
    
    // Process member results
    const processedMembers: PartnershipReport[] = members.map((row: any) => {
      const totalPartnerships = Number(row.total_partnerships) || 0;
      const contributionCount = Number(row.number_of_contributions) || 0;
      
      return {
        id: row.member_id.toString(),
        full_name: row.full_name,
        cell_name: row.cell_name || '',
        total_partnerships: totalPartnerships,
        number_of_contributions: contributionCount,
        last_contribution_date: contributionCount > 0 ? row.last_contribution_date : null,
        status: row.membership_status || 'Member',
        partnership_details: contributionCount > 0 && row.partnership_details 
          ? JSON.parse(`[${row.partnership_details}]`)
          : []
      };
    });

    // Get non-members with partnerships
    let nonMembersQuery = `
      SELECT 
        partner_name as full_name,
        SUM(amount) as total_partnerships,
        COUNT(partnership_id) as number_of_contributions,
        MAX(date_given) as last_contribution_date,
        GROUP_CONCAT(
          JSON_OBJECT(
            'amount', amount,
            'date', date_given,
            'partner_name', partner_name
          )
        ) as partnership_details
      FROM partnerships 
      WHERE member_id IS NULL
    `

    const nonMembersParams: any[] = []

    if (from) {
      nonMembersQuery += " AND date_given >= ?"
      nonMembersParams.push(from)
    }

    if (to) {
      nonMembersQuery += " AND date_given <= ?"
      nonMembersParams.push(to)
    }

    nonMembersQuery += `
      GROUP BY partner_name
      ORDER BY total_partnerships DESC
    `

    const [nonMembers] = await pool.execute(nonMembersQuery, nonMembersParams)
    
    // Process non-member results
    const processedNonMembers: PartnershipReport[] = nonMembers.map((row: any) => {
      const totalPartnerships = Number(row.total_partnerships) || 0;
      const contributionCount = Number(row.number_of_contributions) || 0;
      
      return {
        id: `non-member_${row.full_name}`,
        full_name: row.full_name,
        cell_name: '',
        total_partnerships: totalPartnerships,
        number_of_contributions: contributionCount,
        last_contribution_date: contributionCount > 0 ? row.last_contribution_date : null,
        status: 'Non-member',
        partnership_details: contributionCount > 0 && row.partnership_details 
          ? JSON.parse(`[${row.partnership_details}]`)
          : []
      };
    });

    // Combine members and non-members
    const results = [...processedMembers, ...processedNonMembers]
    
    // Sort by total_partnerships descending
    results.sort((a: PartnershipReport, b: PartnershipReport) => {
      return b.total_partnerships - a.total_partnerships
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Get partnership reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
