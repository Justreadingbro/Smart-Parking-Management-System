import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db from "@/lib/db"

const SECRET = "smart-parking-secret"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      )
    }

    const decoded: any = jwt.verify(
      token,
      SECRET
    )

    const user = db
      .prepare(
        `
        SELECT
        id,
        name,
        email,
        role,
        vehicleNumber
        FROM users
        WHERE id=?
      `
      )
      .get(decoded.id)

    return NextResponse.json(user)
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    const decoded: any = jwt.verify(
      token!,
      SECRET
    )

    const body = await req.json()

    db.prepare(
      `
      UPDATE users
      SET vehicleNumber=?
      WHERE id=?
    `
    ).run(
      body.vehicleNumber,
      decoded.id
    )

    return NextResponse.json({
      success: true,
    })
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}