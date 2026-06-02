"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { SettingsPanel } from "@/components/settings-panel"

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LayoutWrapper>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">System configuration and preferences</p>
        </div>
        <SettingsPanel />
      </div>
    </LayoutWrapper>
  )
}
