"use client";

import { CameraFeed } from "./camera-feed";

export function CameraFeedGrid() {
  const cameras = [
    { id: "1", name: "Entrance Gate", range: "Slots A-001 to A-004" },
    { id: "2", name: "Middle Section", range: "Slots A-005 to A-008" },
    { id: "3", name: "North Wing", range: "Slots A-009 to A-012" },
    { id: "4", name: "South Wing", range: "Slots A-013 to A-016" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {cameras.map((camera) => (
        <CameraFeed
          key={camera.id}
          cameraId={camera.id}
          title={camera.name}
          slotRange={camera.range}
          isDemo={false}
        />
      ))}
    </div>
  );
}
