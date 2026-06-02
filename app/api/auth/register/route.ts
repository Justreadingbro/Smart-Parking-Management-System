import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } =
      await req.json()

    const existing = db
      .prepare(
        "SELECT * FROM users WHERE email=?"
      )
      .get(email)

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 400 }
      )
    }

    const hashed =
      await bcrypt.hash(password, 10)

    db.prepare(
      `
      INSERT INTO users
      (name,email,password)
      VALUES (?,?,?)
    `
    ).run(name, email, hashed)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
        console.error("REGISTER ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            {
                status: 500,
            }
        )
    }
}