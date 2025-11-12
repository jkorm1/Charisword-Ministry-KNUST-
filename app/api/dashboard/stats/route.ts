import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isCellLeader = user.role === "cell_leader"
    const cellFilter = isCellLeader ? " AND m.cell_id = ?" : ""
    const cellParam = isCellLeader ? [user.assigned_cell_id] : []

    // --- Member counts ---
    const [members] = await pool.execute(
      `SELECT COUNT(*) as total FROM members m WHERE m.membership_status = "Member"${cellFilter}`,
      cellParam
    )

    const [associates] = await pool.execute(
      `SELECT COUNT(*) as total FROM members m WHERE m.membership_status = "Associate"${cellFilter}`,
      cellParam
    )

    // --- Weekly attendance ---
    const [attendance] = await pool.execute(
      `
      SELECT COUNT(DISTINCT a.member_id) as total 
      FROM attendance a
      JOIN services s ON a.service_id = s.service_id
      JOIN members m ON a.member_id = m.member_id
      WHERE YEARWEEK(s.service_date) = YEARWEEK(CURRENT_DATE)
        AND a.status = 'Present'
        ${cellFilter}
      `,
      cellParam
    )

    // --- First-timers (global) ---
    const [firstTimers] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM first_timers 
      WHERE status IN ('Visit', 'Stay')
    `)

    // --- Last service attendance ---
    const [lastService] = await pool.execute(
      `
      SELECT 
        s.service_id,
        DATE_FORMAT(s.service_date, '%m/%d/%Y') as service_date,
        COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.member_id END) as attendance_count
      FROM services s
      LEFT JOIN attendance a ON s.service_id = a.service_id
      LEFT JOIN members m ON a.member_id = m.member_id
      WHERE s.service_date <= CURRENT_DATE
      ${cellFilter}
      GROUP BY s.service_id, s.service_date
      ORDER BY s.service_date DESC
      LIMIT 1
      `,
      cellParam
    )

    // --- Recent activities ---
    const [services] = await pool.execute(`
      SELECT 'service' as type, s.service_id as id, s.service_date as date, 
             CONCAT('New service created: ', s.service_type, ' - ', s.topic) as description
      FROM services s
      ORDER BY s.service_date DESC
      LIMIT 3
    `)

    const [attendanceActivity] = await pool.execute(
      `
      SELECT 'attendance' as type, 
             DATE(a.recorded_at) as id,
             MAX(a.recorded_at) as date,
             CONCAT('Attendance submitted: ', COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.member_id END), ' members present') as description
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      WHERE a.status = 'Present'
      ${cellFilter}
      GROUP BY DATE(a.recorded_at)
      ORDER BY date DESC
      LIMIT 3
      `,
      cellParam
    )

    const allActivities = [...services, ...attendanceActivity]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalMembers: members[0].total,
        totalAssociates: associates[0].total,
        weeklyAttendance: attendance[0].total,
        totalFirstTimers: firstTimers[0].total,
        lastServiceAttendance: lastService[0]?.attendance_count || 0,
        lastServiceDate: lastService[0]?.service_date || null,
        activities: allActivities,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
