"use client";

import { useEffect, useState } from "react";
import type { ParkingSlot } from "@/types/parking";
import { X, Clock, MapPin } from "lucide-react";
import { CameraFeed } from "./camera-feed";
import { format, formatDuration, intervalToDuration } from "date-fns";

interface SlotDetailModalProps {
  slot: ParkingSlot;
  onClose: () => void;
}

export function SlotDetailModal({ slot, onClose }: SlotDetailModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Determine which camera covers this slot (4 slots per camera)
  const slotNumber = Number.parseInt(slot.slotId.split("-")[1]);
  const cameraId = Math.ceil(slotNumber / 4).toString();

  useEffect(() => {
    if (slot.status !== "occupied" || !slot.entryTime) return;

    const entry = new Date(slot.entryTime).getTime();
    const now = Date.now();

    const elapsed = Math.floor((now - entry) / 1000);

    setElapsedTime(elapsed);
  }, [slot.status, slot.entryTime]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 p-6">
          <div>
            <h2 className="text-2xl font-bold">{slot.slotId}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Status:{" "}
              <span
                className={`font-semibold ${
                  slot.status === "occupied" ? "text-red-600" : "text-green-600"
                }`}
              >
                {slot.status === "occupied" ? "OCCUPIED" : "AVAILABLE"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg hover:bg-muted p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Camera Feed */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Live Camera Feed</h3>
            <CameraFeed
              cameraId={cameraId}
              title={`Camera ${cameraId} Feed`}
              slotRange={`Monitoring Slot ${slot.slotId}`}
              isDemo={false}
            />
          </div>

          {/* Slot Details */}
          {slot.status === "occupied" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Parking Details */}
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="font-semibold text-sm mb-4">
                    Parking Details
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          License Plate
                        </p>
                        <p className="font-mono font-bold text-lg">
                          {slot.licensePlate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Entry Time
                        </p>
                        <p className="text-sm font-medium">
                          {slot.entryTime
                            ? format(
                                new Date(slot.entryTime),
                                "MMM dd, HH:mm:ss"
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium">
                          {elapsedTime > 0
                            ? formatDuration(
                                intervalToDuration({
                                  start: 0,
                                  end: elapsedTime * 1000,
                                })
                              )
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Billing */}
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-gradient-to-br from-red-500/10 to-red-500/5 p-4">
                  <h4 className="font-semibold text-sm mb-4">
                    Current Billing
                  </h4>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-white/50 dark:bg-black/30 p-3">
                      <p className="text-xs text-muted-foreground">Base Rate</p>
                      <p className="text-xl font-bold">₹50</p>
                    </div>

                    <div className="rounded-lg bg-white/50 dark:bg-black/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Time-Based Charge
                      </p>
                      <p className="text-lg font-semibold">
                        ₹{Math.max(0, slot.bill - 50)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Money)
                      </p>
                    </div>

                    <div className="rounded-lg bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        ₹{slot.bill}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                  <p>Billing updates in real-time as vehicle is parked</p>
                </div>
              </div>
            </div>
          )}

          {slot.status === "available" && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-center">
              <p className="text-green-700 font-semibold">
                This parking slot is currently available
              </p>
              <p className="text-sm text-green-600 mt-2">
                Ready for new parking entry
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
