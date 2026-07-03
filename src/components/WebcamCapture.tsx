import { Camera, RefreshCw, X, Check, Video } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WebcamCapture({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined, file?: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Try to get front camera
        audio: false,
      });
      setStream(mediaStream);
      setIsActive(true);
    } catch (err: any) {
      setError("Could not access camera. Please check permissions.");
      setIsActive(false);
    }
  };

  useEffect(() => {
    if (isActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isActive, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (stream) stopCamera();
    };
  }, [stopCamera, stream]);

  // If a value is provided, we stop the camera automatically.
  useEffect(() => {
    if (value && isActive) {
      stopCamera();
    }
  }, [value, isActive, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        
        // Convert dataUrl to a File object for the backend upload
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            onChange(dataUrl, file);
          });
      }
    }
  };

  const retake = () => {
    onChange(undefined);
    startCamera();
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          <img src={value} alt={label} className="h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              stopCamera();
            }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-0 flex w-full justify-center">
            <Button size="sm" type="button" onClick={retake} variant="secondary" className="gap-2 shadow">
              <RefreshCw className="h-4 w-4" /> Retake
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn("relative overflow-hidden rounded-xl border border-border bg-black", isActive ? "h-64" : "h-48")}>
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                onPlay={() => setError(null)}
              />
              <div className="absolute bottom-4 left-0 flex w-full justify-center">
                <Button size="lg" type="button" onClick={capturePhoto} className="gap-2 rounded-full shadow-lg">
                  <Camera className="h-5 w-5" /> Take Photo
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
                <Video className="h-6 w-6" />
              </span>
              <p className="text-sm text-muted-foreground">We need a live photo to verify your identity.</p>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="button" onClick={startCamera}>
                Open Camera
              </Button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
