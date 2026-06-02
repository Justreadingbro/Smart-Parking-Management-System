import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db from "@/lib/db"
import fs from "fs"
import path from "path"

const SECRET = "smart-parking-secret"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(null)
    }

    const decoded: any = jwt.verify(
      token,
      SECRET
    )

    const user: any = db
      .prepare(`
        SELECT *
        FROM users
        WHERE id=?
      `)
      .get(decoded.id)
    console.log("TOKEN USER:", decoded)
    console.log("DB USER:", user)
    console.log("VEHICLE:", user?.vehicleNumber)
    if (!user) {
      return NextResponse.json(null)
    }

    const vehicleNumber =
      user.vehicleNumber?.trim()

    if (!vehicleNumber) {
      return NextResponse.json(null)
    }

    const jsonPath = path.join(
      process.cwd(),
      "scripts",
      "parking_data.json"
    )

    const parkingData = JSON.parse(
      fs.readFileSync(
        jsonPath,
        "utf8"
      )
    )

    const slots =
      parkingData.slots || {}
    console.log("VEHICLE NUMBER:", vehicleNumber)
    console.log("SLOTS OBJECT:", slots)

    for (const slotId of Object.keys(slots)) {
        const slot: any = slots[slotId]

        console.log("CHECKING SLOT:", slotId)
        console.log("PLATE:", slot.licensePlate)
        console.log(
            "MATCH:",
            slot.licensePlate === vehicleNumber
        )
    }
    for (const slotId of Object.keys(slots)) {
      const slot: any =
        slots[slotId]

      const plate =
        (
          slot.licensePlate ||
          slot.license_plate ||
          ""
        ).trim()

      if (
        plate.toUpperCase() ===
        vehicleNumber.toUpperCase()
      ) {
        return NextResponse.json({
          slotId,
          status: slot.status,
          licensePlate: plate,
          entryTime:
            slot.entryTime ||
            slot.entry_time,
          bill:
            slot.bill ||
            slot.amount ||
            0,
        })
      }
    }

    return NextResponse.json(null)
  } catch (err) {
    console.error(
      "MY PARKING ERROR:",
      err
    )

    return NextResponse.json(null)
  }
}