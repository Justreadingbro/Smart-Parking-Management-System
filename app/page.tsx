"use client"

import { useEffect, useState } from "react"
import { ParkingDashboard } from "@/components/parking-dashboard"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Parking Overview</h2>
          <p className="text-muted-foreground">Real-time parking slot management</p>
        </div>
        <ParkingDashboard />
      </div>
    </LayoutWrapper>
  )
}
