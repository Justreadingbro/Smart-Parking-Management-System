"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParkingSlot } from "@/types/parking";
import { SlotCard } from "./slot-card";
import { StatsPanel } from "./stats-panel";
import { Card } from "@/components/ui/card";
import { SlotDetailModal } from "./slot-detail-modal";
import { useParkingData } from "@/hooks/useParkingData";

export function ParkingDashboard() {
  // Live parking + camera data from backend (poll every 3s)
  const { slots: liveSlots, cameras } = useParkingData(3000);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isSimulated = !liveSlots || liveSlots.length === 0;

  const slots: ParkingSlot[] = useMemo(() => {
    const mock = generateMockData();

    if (liveSlots && liveSlots.length > 0) {
      mock.forEach((m, index) => {
        const live = liveSlots.find((s) => s.slotId === m.slotId);
        if (live && (m.slotId === "A-001" || m.slotId === "A-002")) {
          mock[index] = live;
        }

        if (!live && (m.slotId === "A-001" || m.slotId === "A-002")) {
          mock[index] = {
            slotId: m.slotId,
            status: "offline",
            licensePlate: "",
            entryTime: "",
            bill: 0,
          };
        }
      });

      return mock;
    }

    mock[0] = {
      slotId: "A-001",
      status: "offline",
      licensePlate: "",
      entryTime: "",
      bill: 0,
    };
    mock[1] = {
      slotId: "A-002",
      status: "offline",
      licensePlate: "",
      entryTime: "",
      bill: 0,
    };
    return mock;
  }, [liveSlots]);
  useEffect(() => {
    setLoading(false);
    setLastUpdate(new Date());
  }, [liveSlots]);
  const stats = useMemo(() => {
    const total = slots.length;
    const occupied = slots.filter((s) => s.status === "occupied").length;
    const available = slots.filter((s) => s.status === "available").length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, occupancyRate };
  }, [slots]);
  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Smart Parking System
          </h1>
          <p className="text-muted-foreground">
            Real-time parking lot occupancy management
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}{" "}
            {isSimulated && "(simulated data)"}
          </p>
        </div>
        {/* Stats Panel */}
        <StatsPanel stats={stats} />
        {/* Parking Slots Grid */}
        <Card className="p-6 mt-8 border-border bg-card/50 backdrop-blur">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Parking Slots
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">
                Loading parking data...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {slots.map((slot) => (
                <div
                  key={slot.slotId}
                  onClick={() => handleSlotClick(slot)}
                  className="cursor-pointer"
                >
                  <SlotCard
                    slot={slot}
                    cameraStatus={cameras}
                    simulated={isSimulated}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Smart Parking System © 2025 | University Project | Powered by YOLOv8
            & EasyOCR
          </p>
        </div>
      </div>

      {/* Slot Detail Modal with Camera Feed */}
      {showModal && selectedSlot && (
        <SlotDetailModal
          slot={selectedSlot}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/** -------------------------
 * Mock fallback generator
 * --------------------------*/
function generateMockData(): ParkingSlot[] {
  const slots: ParkingSlot[] = [];
  const licensePlates = [
    "DL-01-AB-1234",
    "MH-02-CD-5678",
    "KA-03-EF-9012",
    "TN-04-GH-3456",
    "UP-05-IJ-7890",
    "GJ-06-KL-2345",
    "AP-07-MN-6789",
    "WB-08-OP-0123",
  ];

  for (let i = 1; i <= 16; i++) {
    const isOccupied = Math.random() > 0.4;
    slots.push({
      slotId: `A-${String(i).padStart(3, "0")}`,
      status: isOccupied ? "occupied" : "available",
      licensePlate: isOccupied
        ? licensePlates[Math.floor(Math.random() * licensePlates.length)]
        : "",
      entryTime: isOccupied
        ? new Date(Date.now() - Math.random() * 3600000).toISOString()
        : "",
      bill: isOccupied ? 50 + Math.floor(Math.random() * 200) : 0,
    } as ParkingSlot);
  }
  return slots;
}
