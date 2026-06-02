"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    console.log("LOGIN RESPONSE:", data)

    if (data.success) {
      localStorage.setItem("token", data.token)

      if (data.role === "admin") {
        router.push("/")
      } else {
        router.push("/")
      }
    } else {
      alert(data.message || "Login failed")
    }
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">
        Login
      </h1>

      <input
        placeholder="Email"
        className="border p-2 w-full"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        onClick={login}
        className="bg-black text-white px-4 py-2"
      >
        Login
      </button>
    </div>
  )
}