// hooks/useParkingData.ts
import { useEffect, useState, useRef } from "react";

export function useParkingData(pollInterval = 3000) {
  const [slots, setSlots] = useState<any[]>([]);
  const [cameras, setCameras] = useState<Record<string,string>>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function fetchOnce() {
      try {
        const res = await fetch("/api/parking-data");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const s = json.slots || [];
        const c = json.cameras || {};
        if (mounted.current) {
          setSlots(Array.isArray(s) ? s : Object.values(s));
          setCameras(c);
        }
      } catch (e) {
        // keep previous data if fetch fails
        console.warn("useParkingData fetch error:", e);
      }
    }

    fetchOnce();
    const id = setInterval(fetchOnce, pollInterval);
    return () => { mounted.current = false; clearInterval(id); };
  }, [pollInterval]);

  return { slots, cameras };
}
