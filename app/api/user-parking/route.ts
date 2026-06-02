import fs from "fs"
import path from "path"
import jwt from "jsonwebtoken"
import db from "@/lib/db"
import { NextRequest,
  NextResponse } from "next/server"

const SECRET =
  "smart-parking-secret"

export async function GET(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("token")
        ?.value

    const decoded: any =
      jwt.verify(
        token!,
        SECRET
      )

    const user: any =
      db.prepare(
        `
        SELECT vehicleNumber
        FROM users
        WHERE id=?
      `
      ).get(decoded.id)

    const file =
      path.join(
        process.cwd(),
        "scripts",
        "parking_data.json"
      )

    const parking =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8"
        )
      )

    const slot =
      parking.slots.find(
        (s: any) =>
          s.licensePlate ===
          user.vehicleNumber
      )

    return NextResponse.json(
      slot || null
    )
  } catch {
    return NextResponse.json(
      null
    )
  }
}