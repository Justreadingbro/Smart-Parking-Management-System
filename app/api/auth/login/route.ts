import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { generateToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } =
      await req.json()

    const user = db
      .prepare(
        "SELECT * FROM users WHERE email=?"
      )
      .get(email) as any

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 400,
        }
      )
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Wrong password",
        },
        {
          status: 400,
        }
      )
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    })

    const response =
        NextResponse.json({
            success: true,
            token,
            role: user.role,
        })

    response.cookies.set(
        "token",
        token,
        {
            httpOnly: false,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        }
    )

    return response
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    )
  }
}