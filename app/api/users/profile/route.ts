import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest, hashPassword } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, oldPassword, password } = await request.json();

    // Fetch the user's current password hash from the database
    const [users] = await pool.execute(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [currentUser.user_id]
    ) as any;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPasswordHash = users[0].password_hash;

    // Verify the old password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentPasswordHash);

    if (!isOldPasswordCorrect) {
      return NextResponse.json({ error: "Old password does not match" }, { status: 400 });
    }

    // Build the query dynamically
    let query = "UPDATE users SET email = ?";
    let values = [email];

    // If a new password is provided, hash it and add to the query
    if (password) {
      const hashedPassword = await hashPassword(password);
      query += ", password_hash = ?";
      values.push(hashedPassword);
    }

    query += " WHERE user_id = ?";
    values.push(currentUser.user_id);

    await pool.execute(query, values);

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
