import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import pool from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  user_id: number
  email: string
  role: "admin" | "usher" | "cell_leader" | "finance_leader"
  assigned_cell_id?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      assigned_cell_id: user.assigned_cell_id,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

  if (!token) return null

  const user = verifyToken(token)
  if (!user) return null

  // Verify user still exists in database
  const [rows] = await pool.execute("SELECT user_id, email, role, assigned_cell_id FROM users WHERE user_id = ?", [
    user.user_id,
  ])

  return (rows as any[]).length > 0 ? user : null
}

export function requireRole(allowedRoles: string[]) {
  return (user: User | null) => {
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Error("Unauthorized")
    }
    return user
  }
}
