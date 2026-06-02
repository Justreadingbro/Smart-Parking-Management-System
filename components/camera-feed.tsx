"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, Play, Pause } from "lucide-react";

interface CameraFeedProps {
  cameraId: string;
  slotRange: string;
  title: string;
  isDemo?: boolean;
}

export function CameraFeed({
  cameraId,
  slotRange,
  title,
  isDemo = true,
}: CameraFeedProps) {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Build direct Python backend MJPEG URL
  const streamUrl = `http://localhost:8000/video_feed/${cameraId}`;

  // Demo canvas animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId = 0;

    const drawDemo = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      const cell = 60;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const t = Date.now() / 1000;
      const carX = 60 + Math.sin(t * 0.7) * 30;
      ctx.fillStyle = "rgba(255,80,80,0.9)";
      ctx.fillRect(carX, 70, 48, 28);
      ctx.fillStyle = "white";
      ctx.font = "10px monospace";
      ctx.fillText("DL-01-AB-1234", carX + 2, 88);

      animationId = requestAnimationFrame(drawDemo);
    };

    drawDemo();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Initialize stream when not demo
  useEffect(() => {
    if (!isDemo) {
      setImgSrc(streamUrl);
      setIsStreamActive(true);
      setError(null);
    } else {
      setImgSrc(null);
      setIsStreamActive(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId, isDemo]);

  // img load / error handlers
  const onImgLoad = () => {
    setIsStreamActive(true);
    setError(null);
  };
  const onImgError = () => {
    setIsStreamActive(false);
    setError(
      "Cannot load video stream. Check backend at http://localhost:8000"
    );
  };

  // Play / Pause toggles the imgSrc to stop/start the browser from fetching MJPEG
  const toggleStream = () => {
    if (isDemo) return;
    if (isStreamActive) {
      setImgSrc(null);
      setIsStreamActive(false);
    } else {
      setImgSrc(streamUrl);
      setIsStreamActive(true);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{slotRange}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isStreamActive || isDemo ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs font-medium">
            {isStreamActive || isDemo ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-black">
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm z-10">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-300 text-center px-4">{error}</p>
            <p className="text-xs text-muted-foreground text-center px-4">
              Check IP Webcam URL in settings
            </p>
          </div>
        )}

        {isDemo ? (
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={imgSrc ?? undefined}
            onLoad={onImgLoad}
            onError={onImgError}
            alt="Live Camera Feed"
            className="h-full w-full object-cover"
            key={String(cameraId) + (imgSrc ?? "")}
            style={{ display: error ? "none" : "block" }}
          />
        )}

        <div className="absolute inset-0 pointer-events-none border-2 border-green-500/30"></div>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <p>Detection: AI-Powered YOLOv8</p>
          <p className="mt-1">FPS: 30 | Resolution: 640x480</p>
        </div>
        <button
          onClick={toggleStream}
          className="inline-flex items-center gap-2 rounded bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
        >
          {isStreamActive ? (
            <>
              <Pause className="h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Play
            </>
          )}
        </button>
      </div>
    </div>
  );
}
