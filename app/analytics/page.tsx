"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground">Parking statistics and revenue analytics</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </LayoutWrapper>
  )
}
