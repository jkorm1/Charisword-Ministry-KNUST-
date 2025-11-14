import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, requireRole, hashPassword } from "@/lib/auth";

// Handles editing a user (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    requireRole(["admin"])(currentUser);

    const { email, password, role, assigned_cell_id } = await request.json();
    const userIdToUpdate = params.id;

    // Build the query dynamically
    let query = "UPDATE users SET email = ?, role = ?, assigned_cell_id = ?";
    let values = [email, role, assigned_cell_id || null];

    // If a new password is provided, hash it and add to the query
    if (password) {
      const hashedPassword = await hashPassword(password);
      query += ", password_hash = ?";
      values.push(hashedPassword);
    }

    query += " WHERE user_id = ?";
    values.push(userIdToUpdate);

    await pool.execute(query, values);

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handles deleting a user (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    requireRole(["admin"])(currentUser);
    
    // Prevent an admin from deleting themselves
    if (currentUser.user_id === parseInt(params.id, 10)) {
        return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await pool.execute("DELETE FROM users WHERE user_id = ?", [params.id]);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
