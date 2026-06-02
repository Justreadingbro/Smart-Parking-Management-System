"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { HistoryTable } from "@/components/history-table"

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Parking History</h2>
          <p className="text-muted-foreground">Transaction log and parking history</p>
        </div>
        <HistoryTable />
      </div>
    </LayoutWrapper>
  )
}
