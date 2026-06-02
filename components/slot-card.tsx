"use client";

import type { ParkingSlot } from "@/types/parking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, IndianRupee } from "lucide-react";

interface SlotCardProps {
  slot: ParkingSlot;
  /**
   * When true, this card is coming from simulated/mock data.
   * Dashboard will set this for non-live slots.
   */
  simulated?: boolean;
}

export function SlotCard({ slot, simulated = false }: SlotCardProps) {
  const isOccupied = slot?.status === "occupied";
  const isOffline = slot?.status === "offline";

  const billValue = typeof slot?.bill === "number" ? slot.bill : 0;
  const formattedBill = `₹${billValue.toFixed(2)}`;

  const cardClass = `relative overflow-hidden border-2 transition-all duration-300 ${
    isOffline
      ? "bg-neutral-900/40 border-yellow-600/30 hover:border-yellow-600"
      : isOccupied
      ? "bg-destructive/5 border-destructive/50 hover:border-destructive"
      : "bg-green-50 dark:bg-green-950/20 cappuccino:bg-green-950/20 border-green-500/50 hover:border-green-500"
  }`;

  return (
    <Card className={cardClass}>
      <div className="p-6">
        {/* Header: Slot ID + badges */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {slot?.slotId || "Unknown"}
          </h3>

          <div className="flex items-center gap-2">
            {simulated && (
              <Badge className="text-xs px-2 py-1" variant="outline">
                Demo
              </Badge>
            )}

            {isOffline ? (
              <Badge
                className="gap-1 bg-yellow-600/10 text-yellow-300 border-yellow-600/30"
                variant="outline"
              >
                <AlertCircle className="w-3 h-3" />
                Offline
              </Badge>
            ) : isOccupied ? (
              <Badge
                className="gap-1 bg-destructive/20 text-destructive border-destructive/30"
                variant="outline"
              >
                <AlertCircle className="w-3 h-3" />
                Occupied
              </Badge>
            ) : (
              <Badge
                className="gap-1 bg-green-100 dark:bg-green-900 cappuccino:bg-green-900 text-green-700 dark:text-green-300 cappuccino:text-green-300 border-green-300/50"
                variant="outline"
              >
                <CheckCircle className="w-3 h-3" />
                Available
              </Badge>
            )}
          </div>
        </div>

        {/* Offline card */}
        {isOffline ? (
          <div className="p-4 rounded-lg border border-yellow-700/10 bg-black/30">
            <p className="text-sm text-muted-foreground">
              Camera not connected
            </p>
            <p className="mt-3 text-xs text-yellow-200">
              No live data available for this slot.
            </p>
          </div>
        ) : (
          <>
            {/* License Plate (only when occupied) */}
            {isOccupied && (
              <div className="mb-4 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-xs text-muted-foreground mb-1">
                  License Plate:
                </p>
                <p className="text-xl font-mono font-bold text-destructive">
                  {slot?.licensePlate || "—"}
                </p>
              </div>
            )}

            {/* Entry Time & Bill (show when occupied) */}
            {isOccupied ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>{formatTime(slot?.entryTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-accent" />
                  <span className="text-lg font-bold text-foreground">
                    {formattedBill}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-2xl text-green-600 dark:text-green-400 cappuccino:text-green-400 font-bold">
                  Available
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ready for parking
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Indicator Bar */}
      <div
        className={`h-1 bg-gradient-to-r ${
          isOffline
            ? "from-yellow-500/40 to-yellow-500/20"
            : isOccupied
            ? "from-destructive/50 to-destructive"
            : "from-green-500/50 to-green-500"
        }`}
      />
    </Card>
  );
}

/** Helper: format entry time like "31m ago" or "N/A" */
function formatTime(isoString?: string): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Invalid time";
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`;
    return `${diffMins}m ago`;
  } catch {
    return "Invalid time";
  }
}
