"use client"

import { Card } from "@/components/ui/card"
import { ParkingCircle, TrendingUp } from "lucide-react"

interface StatsPanelProps {
  stats: {
    total: number
    occupied: number
    available: number
    occupancyRate: number
  }
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Slots */}
      <Card className="p-6 bg-card/50 border-border hover:border-accent/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Slots</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">{stats.total}</h3>
          </div>
          <ParkingCircle className="w-8 h-8 text-accent opacity-20" />
        </div>
      </Card>

      {/* Occupied */}
      <Card className="p-6 bg-destructive/5 border-destructive/30 hover:border-destructive/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Occupied</p>
            <h3 className="text-3xl font-bold text-destructive mt-2">{stats.occupied}</h3>
          </div>
          <ParkingCircle className="w-8 h-8 text-destructive opacity-40" />
        </div>
      </Card>

      {/* Available */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 cappuccino:bg-green-950/20 border-green-500/30 hover:border-green-500/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available</p>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 cappuccino:text-green-400 mt-2">
              {stats.available}
            </h3>
          </div>
          <ParkingCircle className="w-8 h-8 text-green-600 dark:text-green-400 cappuccino:text-green-400 opacity-40" />
        </div>
      </Card>

      {/* Occupancy Rate */}
      <Card className="p-6 bg-accent/5 border-accent/30 hover:border-accent/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Occupancy</p>
            <h3 className="text-3xl font-bold text-accent mt-2">{stats.occupancyRate}%</h3>
          </div>
          <TrendingUp className="w-8 h-8 text-accent opacity-40" />
        </div>
      </Card>
    </div>
  )
}
