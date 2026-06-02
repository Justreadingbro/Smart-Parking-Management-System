import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

const settingsPath = path.join(
  process.cwd(),
  "scripts",
  "settings.json"
)

export async function GET() {
  try {
    const data = JSON.parse(
      fs.readFileSync(settingsPath, "utf8")
    )

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      baseRate: 50,
      perSecondRate: 1,
      maxSlotsPerCamera: 4,
      updateInterval: 2,
      cameraUrl: "http://192.168.X.X:8080/video",
    })
  }
}

export async function POST(req: Request) {
  try {
    const settings = await req.json()

    fs.writeFileSync(
      settingsPath,
      JSON.stringify(settings, null, 2)
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
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