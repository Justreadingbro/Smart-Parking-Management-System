"use client"

import { useEffect, useState } from "react"

export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalParking: 0,
    avgDuration: 0,
    peakHour: "-",
    occupancyRate: 0,
    averagePerSlot: 0,
    occupiedSlots: 0,
    totalSlots: 0,
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await fetch("/api/parking-data")
      const data = await res.json()

      const history = data.history || []
      const slots = data.slots || []

      const totalEarnings = history.reduce(
        (sum: number, record: any) => sum + (record.amount || 0),
        0
      )

      const occupiedSlots = slots.filter(
        (slot: any) => slot.status === "occupied"
      ).length

      const totalSlots = slots.length

      const occupancyRate =
        totalSlots > 0
          ? ((occupiedSlots / totalSlots) * 100).toFixed(1)
          : 0

      let totalDuration = 0

      history.forEach((record: any) => {
        if (record.entryTime && record.exitTime) {
          const duration =
            (new Date(record.exitTime).getTime() -
              new Date(record.entryTime).getTime()) /
            60000

          totalDuration += duration
        }
      })

      const avgDuration =
        history.length > 0
          ? Math.round(totalDuration / history.length)
          : 0

      const averagePerSlot =
        history.length > 0
          ? (totalEarnings / history.length).toFixed(2)
          : 0

      setStats({
        totalEarnings,
        totalParking: history.length,
        avgDuration,
        peakHour: "-",
        occupancyRate: Number(occupancyRate),
        averagePerSlot: Number(averagePerSlot),
        occupiedSlots,
        totalSlots,
      })
    }

    loadAnalytics()

    const interval = setInterval(loadAnalytics, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <p>Total Earnings</p>
          <p className="text-3xl font-bold">₹{stats.totalEarnings}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p>Total Parkings</p>
          <p className="text-3xl font-bold">{stats.totalParking}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p>Avg Duration</p>
          <p className="text-3xl font-bold">{stats.avgDuration}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <p>Current Occupancy</p>
          <p className="text-3xl font-bold">
            {stats.occupiedSlots}/{stats.totalSlots}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p>Occupancy Rate</p>
          <p className="text-3xl font-bold">
            {stats.occupancyRate}%
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p>Avg Revenue/Slot</p>
          <p className="text-3xl font-bold">
            ₹{stats.averagePerSlot}
          </p>
        </div>
      </div>
    </div>
  )
}