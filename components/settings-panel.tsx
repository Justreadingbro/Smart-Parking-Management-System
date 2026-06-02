"use client"

import { useEffect, useState } from "react"

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    baseRate: 50,
    perSecondRate: 1,
    maxSlotsPerCamera: 4,
    updateInterval: 2,
    cameraUrl: "http://192.168.X.X:8080/video",
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()

        setSettings(data)
      } catch (err) {
        console.error(err)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Billing Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Base Parking Rate (₹)
            </label>

            <input
              type="number"
              value={settings.baseRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  baseRate: Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Per Second Rate (₹)
            </label>

            <input
              type="number"
              value={settings.perSecondRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  perSecondRate: Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Camera Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Primary Camera URL
            </label>

            <input
              type="text"
              value={settings.cameraUrl}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cameraUrl: e.target.value,
                })
              }
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Max Slots Per Camera
            </label>

            <input
              type="number"
              value={settings.maxSlotsPerCamera}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxSlotsPerCamera: Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          System Settings
        </h3>

        <div>
          <label className="text-sm font-medium">
            Dashboard Refresh Interval (seconds)
          </label>

          <input
            type="number"
            min="1"
            max="60"
            value={settings.updateInterval}
            onChange={(e) =>
              setSettings({
                ...settings,
                updateInterval: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 transition-colors"
      >
        Save Settings
      </button>

      {saved && (
        <div className="rounded-lg bg-green-500/20 border border-green-500/30 text-green-700 p-3 text-sm">
          Settings saved successfully!
        </div>
      )}
    </div>
  )
}