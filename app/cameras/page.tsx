"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { CameraFeedGrid } from "@/components/camera-feed-grid"

export default function CamerasPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Live Camera Feeds</h2>
          <p className="text-muted-foreground">Real-time video feeds from all parking slots</p>
        </div>
        <CameraFeedGrid />
      </div>
    </LayoutWrapper>
  )
}
