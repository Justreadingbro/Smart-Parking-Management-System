"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function PaymentsPage() {
  const [parking, setParking] =
    useState<any>(null)

  useEffect(() => {
    fetch("/api/my-parking")
      .then((r) => r.json())
      .then((data) => {
        console.log(data)
        setParking(data)
      })
  }, [])

  return (
    <LayoutWrapper>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Payments
        </h1>

        {!parking && (
          <div className="mt-6">
            No active parking found.
          </div>
        )}

        {parking && (
          <div className="mt-6 rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold">
              Parking Details
            </h2>

            <div className="mt-4 space-y-2">
              <p>
                <b>Slot:</b>{" "}
                {parking.slotId}
              </p>

              <p>
                <b>Vehicle:</b>{" "}
                {parking.licensePlate}
              </p>

              <p>
                <b>Status:</b>{" "}
                {parking.status}
              </p>

              <p>
                <b>Entry Time:</b>{" "}
                {parking.entryTime}
              </p>

              <p className="text-3xl font-bold text-green-500">
                Amount Due: ₹
                {parking.bill}
              </p>
            </div>

            <div className="mt-6">
              <img
                src="/UPI_QR.png"
                alt="UPI_qr"
                className="w-64 rounded-lg border"
              />

              <p className="mt-4">
                UPI ID:
                smartparking@upi
              </p>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}