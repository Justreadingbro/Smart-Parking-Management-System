// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { LayoutDashboard, Camera, History, BarChart3, Settings } from "lucide-react"
// import { ThemeToggle } from "./theme-toggle"

// const navItems = [
//   { href: "/", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/cameras", label: "Live Feeds", icon: Camera },
//   { href: "/history", label: "History", icon: History },
//   { href: "/analytics", label: "Analytics", icon: BarChart3 },
//   { href: "/settings", label: "Settings", icon: Settings },
// ]

// export function NavSidebar() {
//   const pathname = usePathname()

//   return (
//     <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-background">
//       <div className="flex h-20 items-center justify-between border-b border-border px-6">
//         <h1 className="text-xl font-bold">Smart Parking</h1>
//         <div className="scale-75">
//           <ThemeToggle />
//         </div>
//       </div>

//       <nav className="space-y-2 p-4">
//         {navItems.map((item) => {
//           const Icon = item.icon
//           const isActive = pathname === item.href
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
//                 isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
//               }`}
//             >
//               <Icon className="h-5 w-5" />
//               {item.label}
//             </Link>
//           )
//         })}
//       </nav>

//       <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-border bg-accent/50 p-4 text-sm">
//         <p className="font-semibold">System Status</p>
//         <p className="mt-2 text-xs text-muted-foreground">Backend: Connected</p>
//         <p className="text-xs text-muted-foreground">Cameras: 4 Active</p>
//       </div>
//     </aside>
//   )
// }
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  Settings,
  User,
  CreditCard,
  LogOut,
} from "lucide-react"

import { ThemeToggle } from "./theme-toggle"

export function NavSidebar() {
  const pathname = usePathname()

  const [role, setRole] = useState("user")

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.role) {
          setRole(data.role)
        }
      })
      .catch(() => {})
  }, [])

  const adminItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cameras", label: "Live Feeds", icon: Camera },
    { href: "/history", label: "History", icon: History },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const userItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    //{ href: "/history", label: "History", icon: History },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const navItems =
    role === "admin"
      ? adminItems
      : userItems

  const logout = async () => {
    await fetch(
      "/api/auth/logout",
      {
        method: "POST",
      }
    )

    window.location.href =
      "/login"
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-20 items-center justify-between border-b border-border px-6">
        <h1 className="text-xl font-bold">
          Smart Parking
        </h1>

        <div className="scale-75">
          <ThemeToggle />
        </div>
      </div>

      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon

          const isActive =
            pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-accent"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>

      <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-border bg-accent/50 p-4 text-sm">
        <p className="font-semibold">
          System Status
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Backend: Connected
        </p>

        <p className="text-xs text-muted-foreground">
          Cameras: 4 Active
        </p>

        <p className="mt-2 text-xs font-semibold">
          Role: {role}
        </p>
      </div>
    </aside>
  )
}