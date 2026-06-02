import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Robust reader for scripts/parking_data.json
 * - Accepts several shapes and normalizes to: { slots: Array<{slotId,status,licensePlate,entryTime,bill}>, cameras: {} }
 */

function normalizeSlotObjectEntry(slotId: string, s: any) {
  const licensePlate = s.licensePlate ?? s.license_plate ?? s.license ?? "";
  const entryTime = s.entryTime ?? s.entry_time ?? s.entry ?? "";
  const bill = typeof s.bill === "number" ? s.bill : (typeof s.amount === "number" ? s.amount : (s.price ?? 0));

  let status = (s.status ?? "").toString().toLowerCase();
  if (status === "free") status = "available";
  if (status !== "available" && status !== "occupied" && status !== "offline") {
    // fallback to available when unknown
    status = "available";
  }

  return {
    slotId,
    status,
    licensePlate,
    entryTime,
    bill,
  };
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const jsonPath = path.join(projectRoot, "scripts", "parking_data.json");

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ slots: [], cameras: {}, error: "parking_data.json not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(jsonPath, "utf8");
    const data = raw ? JSON.parse(raw) : {};

    // 1) If file already contains a `slots` array in the expected normalized format
    if (Array.isArray((data as any).slots) && (data as any).slots.length > 0) {
      const slots = (data as any).slots.map((s: any) => ({
        slotId: s.slotId ?? s.id ?? s.slot ?? "",
        status: s.status ?? "available",
        licensePlate: s.licensePlate ?? s.license_plate ?? "",
        entryTime: s.entryTime ?? s.entry_time ?? "",
        bill: typeof s.bill === "number" ? s.bill : (s.amount ?? 0),
      }));
      return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? {} });
    }

    // 2) If the JSON has a top-level object that maps slotId -> object (A-001 -> {...})
    const topKeys = Object.keys(data || {});
    const looksLikeSlotMap = topKeys.length > 0 && topKeys.every(k => /^A-\d{3}$/.test(k));
    if (looksLikeSlotMap) {
      const slots = topKeys.map(k => normalizeSlotObjectEntry(k, data[k]));
      return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? {} });
    }

    // 3) If data contains wrapper names commonly used by backends
    const wrapperCandidates = ["parking_data", "slots_map", "slotsData", "data"];
    for (const key of wrapperCandidates) {
      if (data[key] && typeof data[key] === "object") {
        const maybe = data[key];
        const maybeKeys = Object.keys(maybe || {});
        if (Array.isArray(maybe)) {
          // Already array form
          const slots = maybe.map((s: any) => normalizeSlotObjectEntry(s.slotId ?? s.id ?? s.slot ?? "unknown", s));
          return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? data[key].cameras ?? {} });
        } else if (maybeKeys.length && maybeKeys.every(k => /^A-\d{3}$/.test(k))) {
          const slots = maybeKeys.map(k => normalizeSlotObjectEntry(k, maybe[k]));
          return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? maybe.cameras ?? {} });
        }
      }
    }

    // 4) If file contains a single `slots` object stored as first element or different structure,
    // try to salvage: if data.slots is an object keyed by slot id
    if (data.slots && typeof data.slots === "object" && !Array.isArray(data.slots)) {
      const keys = Object.keys(data.slots);
      const slots = keys.map(k => normalizeSlotObjectEntry(k, data.slots[k]));
      return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? {} });
    }

    // 5) If nothing matched, attempt to find any A-### keys at any depth (best-effort)
    const found: Array<{ id: string; obj: any }> = [];
    const scan = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const k of Object.keys(obj)) {
        if (/^A-\d{3}$/.test(k) && typeof obj[k] === "object") {
          found.push({ id: k, obj: obj[k] });
        } else if (typeof obj[k] === "object") {
          scan(obj[k]);
        }
      }
    };
    scan(data);

    if (found.length > 0) {
      const slots = found.map(f => normalizeSlotObjectEntry(f.id, f.obj));
      return NextResponse.json({ slots, history: data.history ?? [], cameras: data.cameras ?? {} });
    }

    // Fallback: return empty slots and the cameras object if present
    return NextResponse.json({ slots: [], history: data.history ?? [], cameras: data.cameras ?? {} });
  } catch (err) {
    console.error("[api/parking-data] read error:", err);
    return NextResponse.json({ slots: [], history: [], cameras: {}, error: "failed reading parking_data.json" }, { status: 500 });
  }
}
