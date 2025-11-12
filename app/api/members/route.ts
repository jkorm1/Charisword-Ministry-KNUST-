import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const { searchParams } = new URL(request.url)
    const cellId = searchParams.get("cellId")
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let query = `
      SELECT m.member_id, m.full_name, m.gender, m.residence, m.phone, m.email,
             m.membership_status, m.date_joined, m.created_at,
             c.name as cell_name, f.name as fold_name,
             inv.full_name as inviter_name
      FROM members m
      LEFT JOIN cells c ON m.cell_id = c.cell_id
      LEFT JOIN folds f ON m.fold_id = f.fold_id
      LEFT JOIN members inv ON m.inviter_member_id = inv.member_id
    `

    const params: any[] = []
    const conditions: string[] = []

    // Cell leaders can only see their assigned cell
    if (user?.role === "cell_leader" && user.assigned_cell_id) {
      conditions.push("m.cell_id = ?")
      params.push(user.assigned_cell_id)
    } else if (cellId) {
      conditions.push("m.cell_id = ?")
      params.push(cellId)
    }

    if (search) {
      conditions.push("m.full_name LIKE ?")
      params.push(`%${search}%`)
    }

    if (status && status !== "all") {
      conditions.push("m.membership_status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY m.full_name ASC"

    const [rows] = await pool.execute(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    requireRole(["admin", "usher", "cell_leader"])(user)

    const body = await request.json()
    
    // Check if it's a bulk operation
    if (body.members && Array.isArray(body.members)) {
      const connection = await pool.getConnection()
      
      try {
        await connection.beginTransaction()
        const results = []

        for (const memberData of body.members) {
          let {
            full_name,
            gender,
            residence,
            phone,
            email,
            cell_id,
            fold_id,
            inviter_member_id,
            membership_status
          } = memberData

          if (!full_name || !gender) {
            await connection.rollback()
            return NextResponse.json({ error: "Name and gender required for all members" }, { status: 400 })
          }

          // Cell leaders can only add members to their assigned cell
          if (user?.role === "cell_leader") {
            cell_id = user.assigned_cell_id
          }

          const [result] = await connection.execute(
            `
            INSERT INTO members (
              full_name, gender, residence, phone, email, 
              cell_id, fold_id, inviter_member_id, membership_status, date_joined
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
              full_name,
              gender,
              residence || null,
              phone || null,
              email || null,
              cell_id || null,
              fold_id || null,
              inviter_member_id || null,
              membership_status || "Member"
            ]
          )

          results.push({
            member_id: (result as any).insertId,
            ...memberData
          })
        }

        await connection.commit()

        return NextResponse.json({
          message: `${results.length} members created successfully`,
          members: results
        })
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } else {
      // Single member creation (existing logic)
      let {
        full_name,
        gender,
        residence,
        phone,
        email,
        cell_id,
        fold_id,
        inviter_member_id,
        membership_status
      } = body

      if (!full_name || !gender) {
        return NextResponse.json({ error: "Name and gender required" }, { status: 400 })
      }

      // Cell leaders can only add members to their assigned cell
      if (user?.role === "cell_leader") {
        cell_id = user.assigned_cell_id
      }

      const [result] = await pool.execute(
        `
        INSERT INTO members (
          full_name, gender, residence, phone, email, 
          cell_id, fold_id, inviter_member_id, membership_status, date_joined
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          full_name,
          gender,
          residence || null,
          phone || null,
          email || null,
          cell_id || null,
          fold_id || null,
          inviter_member_id || null,
          membership_status || "Member"
        ]
      )

      return NextResponse.json({
        message: "Member created successfully",
        member_id: (result as any).insertId
      })
    }
  } catch (error) {
    console.error("Create member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}