"use client";

import { useEffect, useState } from "react";
import { format, formatDuration, intervalToDuration } from "date-fns";

interface HistoryRecord {
  id: string;
  slotId: string;
  licensePlate: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  amount: number;
  status: "active" | "completed";
}

export function HistoryTable() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const res = await fetch("/api/parking-data");
      const data = await res.json();

      setRecords(
        (data.history || []).sort(
          (a: HistoryRecord, b: HistoryRecord) =>
            new Date(b.exitTime || "").getTime() -
            new Date(a.exitTime || "").getTime(),
        ),
      );
    };

    loadHistory();

    const interval = setInterval(loadHistory, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Slot ID</th>
              <th className="px-6 py-3 text-left font-semibold">
                License Plate
              </th>
              <th className="px-6 py-3 text-left font-semibold">Entry Time</th>
              <th className="px-6 py-3 text-left font-semibold">Duration</th>
              <th className="px-6 py-3 text-left font-semibold">Amount (₹)</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono font-semibold">
                  {record.slotId}
                </td>
                <td className="px-6 py-4 font-mono">{record.licensePlate}</td>
                <td className="px-6 py-4 text-xs">
                  {format(new Date(record.entryTime), "MMM dd, HH:mm:ss")}
                </td>
                <td className="px-6 py-4">
                  {record.exitTime ? (
                    formatDuration(
                      intervalToDuration({
                        start: new Date(record.entryTime),
                        end: new Date(record.exitTime),
                      }),
                    )
                  ) : (
                    <span className="text-amber-600">Ongoing</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold">₹{record.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      record.status === "active"
                        ? "bg-green-500/20 text-green-700"
                        : "bg-gray-500/20 text-gray-700"
                    }`}
                  >
                    {record.status === "active" ? "Active" : "Completed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
