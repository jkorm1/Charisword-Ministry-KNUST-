import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total members count
    const [members] = await pool.execute(
      'SELECT COUNT(*) as total FROM members WHERE membership_status = "Member"'
    )

    // Get this week's attendance
    const [attendance] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM attendance a
      JOIN services s ON a.service_id = s.service_id
      WHERE YEARWEEK(s.service_date) = YEARWEEK(CURRENT_DATE)
      AND a.status = 'Present'
    `)

    // Get this month's first-timers
    const [firstTimers] = await pool.execute(
      'SELECT COUNT(*) as total FROM first_timers WHERE MONTH(created_at) = MONTH(CURRENT_DATE)'
    )

    // Get this month's offerings (only for admin and finance leaders)
    let offerings = []
    if (user.role === 'admin' || user.role === 'finance_leader') {
      const [offeringsResult] = await pool.execute(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM offerings 
        WHERE MONTH(date_recorded) = MONTH(CURRENT_DATE)
      `)
      offerings = offeringsResult
    }

     // Get recent activities
    const [services] = await pool.execute(`
    SELECT 'service' as type, s.service_id as id, s.service_date as date, 
            CONCAT('New service created: ', s.service_type, ' - ', s.topic) as description
    FROM services s
    ORDER BY s.service_date DESC
    LIMIT 3
    `)

    // Update the offerings query to include a unique ID
    const [offeringsActivity] = await pool.execute(`
    SELECT 'offering' as type, o.offering_id as id, o.date_recorded as date,
            CONCAT('Offering recorded: ₵', o.amount) as description
    FROM offerings o
    ORDER BY o.date_recorded DESC
    LIMIT 3
    `)

    // Update the attendance query to include a unique ID
    const [attendanceActivity] = await pool.execute(`
    SELECT 'attendance' as type, 
            DATE(a.recorded_at) as id,
            MAX(a.recorded_at) as date,
            CONCAT('Attendance submitted: ', COUNT(*), ' members present') as description
    FROM attendance a
    WHERE a.status = 'Present'
    GROUP BY DATE(a.recorded_at)
    ORDER BY date DESC
    LIMIT 3
    `)


    // Combine and sort all activities
    const allActivities = [...services, ...offeringsActivity, ...attendanceActivity]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)


    return NextResponse.json({
      stats: {
        totalMembers: members[0].total,
        weeklyAttendance: attendance[0].total,
        monthlyFirstTimers: firstTimers[0].total,
        monthlyOfferings: offerings[0]?.total || 0,
        lastUpdated: new Date().toISOString(),
        activities: allActivities
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
