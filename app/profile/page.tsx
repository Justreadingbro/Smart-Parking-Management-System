"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [user, setUser] =
    useState<any>(null)

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(setUser)
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <LayoutWrapper>
        <div className="p-8">
        <h1 className="text-3xl font-bold">
            Profile
        </h1>

        <div className="mt-6 space-y-4">
            <p>
            <b>Name:</b>
            {" "}
            {user.name}
            </p>

            <p>
            <b>Email:</b>
            {" "}
            {user.email}
            </p>

            <p>
            <b>Role:</b>
            {" "}
            {user.role}
            </p>
        </div>
        </div>
    </LayoutWrapper>
  )
}