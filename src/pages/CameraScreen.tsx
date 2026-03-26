import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Camera as CameraIcon, Check, Shield, X, RotateCcw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { blurFaces, preloadFaceDetector } from "@/services/faceBlur";
import useGameStore from "../store/useGameStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface BusinessData {
  id: string;
  name: string;
  category: string;
  icon: string;
  label: string;
  tier: "easy" | "medium" | "hard";
  reward: number;
  lat: number;
  lng: number;
}

/* ------------------------------------------------------------------ */
/*  CameraScreen Component                                             */
/* ------------------------------------------------------------------ */
const CameraScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const business: BusinessData | null = location.state?.business || null;
  const userAddress = useGameStore(s => s.user?.evm_address);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Capture state
  const [captured, setCaptured] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [facesBlurred, setFacesBlurred] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check for PWA standalone mode
  useEffect(() => {
    const standalone = (window.navigator as any).standalone || 
                       window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    console.log("📱 PWA Standalone Mode:", standalone);
  }, []);

  // GPS state
  const [gpsLocked, setGpsLocked] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(598);

  // Preload face detector on mount
  useEffect(() => {
    preloadFaceDetector();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (captured) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [captured]);

  // Get GPS on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsLocked(true);
        },
        (error) => {
          console.error("GPS Error:", error);
          if (business) {
            setCoords({ lat: business.lat, lng: business.lng });
            setGpsLocked(true);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [business]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Force attributes via JS as backup to JSX props
        video.setAttribute("playsinline", "true");
        video.muted = true;

        // iOS standalone mode fix — avoid .load() as it can abort streams.
        // Instead, try play() after a tiny delay to ensure the browser is ready.
        setTimeout(async () => {
          try {
            await video.play();
            setCameraReady(true);
          } catch (e) {
            console.warn("video.play() retry error:", e);
            // Last resort: if play() fails, maybe we just need to set ready
            // so the overlay disappears and shows the still frame.
            setCameraReady(true);
          }
        }, 300);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera permission denied or not available.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Flip camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // --- MAIN WEBRTC CAPTURE FLOW ---
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || captured) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Step 1: Capture frame, resize, and compress
    const MAX_WIDTH = 1024;
    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, width, height);

    // 80% JPEG quality is visually indistinguishable to AI but saves massive tokens
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.80);

    setCaptured(true);
    setProcessing(true);

    try {
      // Step 2: Blur faces (Edge AI, on-device)
      setProcessingStep("Scanning for faces...");
      const { blurredBase64, facesDetected } = await blurFaces(rawDataUrl);
      setFacesBlurred(facesDetected);

      const blurredDataUrl = `data:image/jpeg;base64,${blurredBase64}`;
      setPhotoDataUrl(blurredDataUrl);

      if (facesDetected > 0) {
        toast.success(`${facesDetected} face${facesDetected > 1 ? "s" : ""} anonymized (GDPR)`, {
          icon: "🛡️",
        });
      }

      // Step 3: Unify with validation flow
      await processValidation(blurredDataUrl, blurredBase64, facesDetected);
    } catch (err) {
      console.error("WebRTC capture processing error:", err);
      setProcessing(false);
      toast.error("Error processing photo. Please try again.");
    }
  };

  // --- NATIVE CAMERA FALLBACK (PWA) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setProcessingStep("Reading photo...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
      setCaptured(true);
      
      // Proceed to processing (blurring + validation)
      try {
        setProcessingStep("Scanning for faces...");
        const { blurredBase64, facesDetected } = await blurFaces(dataUrl);
        setFacesBlurred(facesDetected);
        
        const blurredDataUrl = `data:image/jpeg;base64,${blurredBase64}`;
        setPhotoDataUrl(blurredDataUrl);
        
        // Call validation with this new data
        await processValidation(blurredDataUrl, blurredBase64, facesDetected);
      } catch (err) {
        console.error("Native capture processing error:", err);
        setProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const processValidation = async (blurredDataUrl: string, blurredBase64: string, facesDetected: number) => {
    setProcessingStep("Sending to AI Validator...");
    try {
      // Convert base64 to blob for FormData
      const byteString = atob(blurredBase64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("photo", blob, "capture.jpg");
      formData.append("lat", String(coords?.lat || 0));
      formData.append("lng", String(coords?.lng || 0));
      formData.append("reward", String(business?.reward || 25));
      formData.append("businessName", business?.name || "unknown");
      formData.append("businessCategory", business?.category || business?.label || "business");
      formData.append("explorerAddress", userAddress || "0x0000000000000000000000000000000000000001");

      const apiRes = await fetch("/api/validate", {
        method: "POST",
        body: formData,
      });

      const result = await apiRes.json();
      setProcessing(false);

      if (result.approved) {
        toast.success(result.message || "AI verified! NFT Minted! 🎉");
        setTimeout(() => {
          navigate("/validation", {
            state: { business, result, photoUrl: blurredDataUrl, facesBlurred: facesDetected },
          });
        }, 800);
      } else {
        toast.error(result.message || "AI could not verify this location.");
        setTimeout(() => {
          navigate("/rejected", { state: { business, result, photoUrl: blurredDataUrl } });
        }, 1500);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setCaptured(false);
    setPhotoDataUrl(null);
    setProcessing(false);
    setProcessingStep("");
    setFacesBlurred(0);
    if (!isStandalone) startCamera();
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-black">
      {/* Hidden inputs & canvas */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Camera viewfinder / Captured photo */}
      <div className="absolute inset-0">
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="Captured" className="w-full h-full object-cover" />
        ) : isStandalone ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <CameraIcon size={32} className="text-white/40" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">PWA Standalone Mode</h3>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              To capture accurately, iOS requires using the native camera in standalone mode. 
              Tap the capture button below to start.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setCameraReady(true)}
            onCanPlay={() => setCameraReady(true)}
            className="w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        )}

        {!cameraReady && !photoDataUrl && !isStandalone && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4">
            <div className="text-white/60 text-sm font-medium animate-pulse">
              Starting camera...
            </div>
            {/* Manual fallback button for stuck black screen */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[11px] text-white/50 uppercase tracking-widest font-bold transition-all"
            >
              Native Camera Fallback
            </button>
          </div>
        )}
      </div>

      {/* Top header */}
      <div
        className="absolute top-4 left-4 right-4 z-10"
        style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
      >
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Active Mission
                </span>
              </div>
              <p className="text-[14px] font-bold text-white leading-snug">
                Capture{" "}
                <span className="text-green-400 font-black">
                  {business?.name || "this storefront"}
                </span>
              </p>
              {business && (
                <p className="text-[11px] text-white/50 mt-0.5">
                  {business.icon} {business.label} • {business.tier.toUpperCase()} • +{business.reward} GEO
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                  timeLeft < 60
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-white/10 text-white/80 border-white/20"
                }`}
              >
                <Timer size={14} strokeWidth={2.5} />
                <span className="text-[13px] font-mono font-bold tracking-wide">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                  }
                  navigate("/map");
                }}
                className="text-[11px] font-bold text-white/40 uppercase tracking-wider hover:text-white/70 transition-colors px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GPS + Privacy indicator pills */}
      <div
        className="absolute right-4 z-10 flex flex-col gap-2"
        style={{ top: "calc(max(8px, env(safe-area-inset-top)) + 110px)" }}
      >
        <motion.div
          className="flex items-center gap-2 rounded-full px-3 py-2 bg-black/50 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-2 w-2 rounded-full ${gpsLocked ? "bg-green-400" : "bg-yellow-400"}`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              gpsLocked ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {gpsLocked ? "GPS ✓" : "Locating..."}
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 rounded-full px-3 py-2 bg-black/50 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Shield size={10} className="text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            GDPR Blur
          </span>
        </motion.div>
      </div>

      {/* Center framing guide (visible only before capture) */}
      {!captured && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative w-[280px] h-[220px]">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/30 rounded-tl-md" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/30 rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/30 rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/30 rounded-br-md" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-[1px] bg-white/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-7 bg-white/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
              </motion.div>
            </div>
            <motion.p
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-medium tracking-wider uppercase whitespace-nowrap"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Align storefront within frame
            </motion.p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-white/10 border-t-green-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white font-bold text-sm mt-6">{processingStep}</p>
            {facesBlurred > 0 && (
              <p className="text-green-400 text-xs mt-2 font-medium">
                🛡️ {facesBlurred} face{facesBlurred > 1 ? "s" : ""} anonymized
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash overlay on capture */}
      {captured && !processing && (
        <motion.div
          className="absolute inset-0 z-20 bg-white"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}

      {/* Bottom capture controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[420px]">
        <div className="flex items-center justify-center gap-8 bg-black/50 backdrop-blur-xl rounded-[2.5rem] p-4 border border-white/10">
          {/* Flip camera / Retry button */}
          <button
            onClick={captured ? handleRetry : flipCamera}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
            disabled={processing}
          >
            <RotateCcw size={20} className="text-white/70" />
          </button>

          {/* Main capture button */}
          <motion.button
            onClick={() => {
              if (isStandalone) {
                fileInputRef.current?.click();
              } else {
                handleCapture();
              }
            }}
            disabled={captured || processing || (!cameraReady && !isStandalone)}
            className="relative h-20 w-20 rounded-full flex items-center justify-center"
            whileTap={{ scale: 0.88 }}
          >
            <div className="absolute inset-0 rounded-full border-[3px] border-white/40" />
            <motion.div
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
                captured
                  ? "bg-white/20"
                  : "bg-white shadow-lg shadow-white/20"
              }`}
            >
              {captured ? (
                <Check size={32} className="text-green-400" strokeWidth={3} />
              ) : (
                <CameraIcon size={28} className="text-black" strokeWidth={2.5} />
              )}
            </motion.div>
          </motion.button>

          {/* Cancel / Close button */}
          <button
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
              }
              navigate("/map");
            }}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
            disabled={processing}
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        <p className="text-center text-[11px] text-white/30 font-medium mt-3">
          {processing
            ? "Processing, please wait..."
            : captured
            ? "Photo captured! Sending to AI..."
            : "Tap the button to capture"}
        </p>
      </div>
    </div>
  );
};

export default CameraScreen;
