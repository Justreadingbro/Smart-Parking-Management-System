"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

type Theme = "light" | "dark" | "cappuccino"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem("parking-theme") as Theme) || "dark"
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    html.classList.remove("dark", "cappuccino", "light")
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else if (newTheme === "cappuccino") {
      html.classList.add("cappuccino")
    }
    localStorage.setItem("parking-theme", newTheme)
  }

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div className="flex gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
      <Button
        size="sm"
        variant={theme === "light" ? "default" : "outline"}
        onClick={() => toggleTheme("light")}
        className="gap-2"
      >
        <Sun className="w-4 h-4" />
        <span className="text-xs">Light</span>
      </Button>
      <Button
        size="sm"
        variant={theme === "dark" ? "default" : "outline"}
        onClick={() => toggleTheme("dark")}
        className="gap-2"
      >
        <Moon className="w-4 h-4" />
        <span className="text-xs">Dark</span>
      </Button>
      {/* Ihave diabled cappuccino as I dont have time
       for uppdating some theme colors and it looks
       bad need to change later LOL */}
      {/* <Button
        size="sm"
        variant={theme === "cappuccino" ? "default" : "outline"}
        onClick={() => toggleTheme("cappuccino")}
        className="gap-2"
      >
        <Coffee className="w-4 h-4" />
        <span className="text-xs">Cappuccino</span>
      </Button> */}
    </div>
  )
}
