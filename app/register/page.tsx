"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const register = async () => {
    const res = await fetch(
      "/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    )

    const data = await res.json()

    if (data.success) {
      alert("Registered")
      router.push("/login")
    }
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">
        Register
      </h1>

      <input
        placeholder="Name"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Email"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <button
        onClick={register}
        className="bg-black text-white px-4 py-2"
      >
        Register
      </button>
    </div>
  )
}