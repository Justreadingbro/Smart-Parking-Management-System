"use client"

import type React from "react"

import { NavSidebar } from "./nav-sidebar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <NavSidebar />
      <main className="ml-64 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
