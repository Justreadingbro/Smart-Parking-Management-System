export interface ParkingSlot {
  slotId: string
  status: "occupied" | "available"| "offline"
  licensePlate: string
  entryTime: string
  bill: number
}

export interface ParkingData {
  slots: ParkingSlot[]
}