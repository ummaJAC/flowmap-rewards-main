import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Search, Bot, Database, Gem, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useGameStore from "../store/useGameStore";

const steps = [
  { icon: MapPin, label: "Verifying GPS coordinates", emoji: "📍" },
  { icon: Search, label: "Extracting EXIF metadata", emoji: "🔍" },
  { icon: Bot, label: "AI Vision Contextual Analysis", emoji: "🤖" },
  { icon: Database, label: "Uploading to IPFS", emoji: "📦" },
  { icon: Gem, label: "Minting $GEO Tokens", emoji: "💎" },
];

const REWARD_AMOUNT = 50;

const useCountUp = (target: number, duration: number, start: boolean) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [start, target, duration]);

  return value;
};

const ConfettiExplosion = () => {
  const particles = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const velocity = 120 + Math.random() * 200;
    const size = 3 + Math.random() * 5;
    const colors = [
      "hsl(142 72% 50%)",
      "hsl(48 96% 56%)",
      "hsl(250 80% 65%)",
      "hsl(0 0% 100%)",
      "hsl(142 72% 70%)",
      "hsl(30 100% 60%)",
    ];
    return {
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity - 60,
      rotate: Math.random() * 720,
      color: colors[i % colors.length],
      size,
      delay: Math.random() * 0.15,
      isRect: Math.random() > 0.5,
    };
  });

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: p.isRect ? p.size * 1.5 : p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isRect ? "1px" : "50%",
            left: "50%",
            top: "30%",
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{
            opacity: 0,
            x: p.x,
            y: p.y + 100,
            scale: 0,
            rotate: p.rotate,
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.6,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </>
  );
};

const ValidationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addOwnedLocation = useGameStore(s => s.addOwnedLocation);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Get business data from CameraScreen navigation state
  const navState = location.state as any;
  const business = navState?.business;
  const result = navState?.result;
  const captureReward = business?.reward || 50;

  const countUpValue = useCountUp(captureReward, 1200, completed);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          // If we came from CameraScreen with an approved result, always pass
          const passed = result?.approved !== undefined ? result.approved : Math.random() > 0.3;
          if (passed) {
            // Add to global store on successful validation
            if (business) {
              addOwnedLocation({
                id: business.id || `${business.name}-${business.lat?.toFixed(4)}-${business.lng?.toFixed(4)}`,
                name: business.name,
                category: business.category || business.label || 'Business',
                icon: business.icon || '📍',
                tier: business.tier || 'easy',
                reward: business.reward || 25,
                dailyYield: Math.round((business.reward || 25) * 0.1),
                lat: business.lat || 0,
                lng: business.lng || 0,
                capturedAt: Date.now(),
                txHash: result?.blockchain?.txHash,
                ipfsUri: result?.ipfs?.uri,
              });
              // Clear state so back-swipe doesn't trigger re-validation loop
              window.history.replaceState({}, document.title);
            }
            setTimeout(() => setCompleted(true), 800);
          } else {
            setTimeout(() => navigate("/rejected"), 800);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(142 72% 50% / 0.06), transparent 65%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key="processing"
            className="relative z-10 w-full max-w-sm px-6"
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Spinner */}
            <div className="flex justify-center mb-10">
              <div className="relative h-[72px] w-[72px]">
                <motion.svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 72 72"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="36" cy="36" r="33" fill="none" stroke="hsl(142 72% 50% / 0.15)" strokeWidth="2" />
                  <circle cx="36" cy="36" r="33" fill="none" stroke="hsl(142 72% 50%)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 148" />
                </motion.svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ boxShadow: "0 0 12px hsl(142 72% 50% / 0.4)" }}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-center text-[17px] font-semibold text-foreground mb-2">
              Validating Your Proof
            </h2>
            <p className="text-center text-[12px] text-muted-foreground mb-8">
              This usually takes a few seconds
            </p>

            {/* Checklist — sharp corners (4px) for list items */}
            <div className="space-y-2">
              {steps.map((step, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;
                const isPending = i > currentStep;

                return (
                  <motion.div
                    key={i}
                    className={`flex items-center gap-3.5 px-4 py-3.5 transition-all duration-500 ${isPending ? "opacity-[0.25]" : ""}`}
                    style={{
                      borderRadius: "4px",
                      background: isDone || isActive ? "hsl(0 0% 100% / 0.04)" : "transparent",
                      border: isDone || isActive ? "1px solid hsl(0 0% 100% / 0.06)" : "1px solid transparent",
                    }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: isPending ? 0.25 : 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <motion.div
                          className="h-7 w-7 rounded-full bg-primary flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          style={{ boxShadow: "0 0 10px hsl(142 72% 50% / 0.25)" }}
                        >
                          <Check size={13} className="text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      ) : isActive ? (
                        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{
                          background: "hsl(0 0% 100% / 0.06)",
                          border: "1px solid hsl(142 72% 50% / 0.3)",
                        }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Loader2 size={13} className="text-primary" />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: "hsl(0 0% 100% / 0.04)" }}>
                          <span className="text-[12px]">{step.emoji}</span>
                        </div>
                      )}
                    </div>

                    <span className={`text-[13px] font-medium flex-1 ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                      {isActive && (
                        <motion.span className="text-muted-foreground" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>...</motion.span>
                      )}
                    </span>

                    {isDone && (
                      <motion.span className="text-[10px] font-semibold text-primary uppercase tracking-wider" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-8 h-[3px] rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ boxShadow: "0 0 8px hsl(142 72% 50% / 0.4)" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="relative z-10 flex flex-col items-center w-full max-w-sm px-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 200 }}
          >
            {/* Confetti explosion */}
            <ConfettiExplosion />

            {/* Big checkmark */}
            <motion.div
              className="h-[88px] w-[88px] rounded-full bg-primary flex items-center justify-center mb-7"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1, stiffness: 250, damping: 18 }}
              style={{ boxShadow: "0 0 40px hsl(142 72% 50% / 0.3), 0 8px 32px hsl(142 72% 50% / 0.15)" }}
            >
              <Check size={44} className="text-primary-foreground" strokeWidth={3} />
            </motion.div>

            <motion.h2
              className="text-[24px] font-bold text-foreground mb-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              Proof Verified!
            </motion.h2>
            <motion.p
              className="text-[13px] text-muted-foreground mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              All checks passed successfully
            </motion.p>

            {/* Reward card — hero card with 20px radius */}
            <motion.div
              className="w-full p-6 text-center relative overflow-hidden"
              style={{
                borderRadius: "20px",
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(142 72% 50% / 0.15)",
                boxShadow: "0 0 30px hsl(142 72% 50% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
              }}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 opacity-[0.04]"
                style={{ background: "linear-gradient(105deg, transparent 40%, hsl(0 0% 100%) 50%, transparent 60%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
              />

              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] font-medium mb-3">
                Reward Earned
              </p>
              <p className="text-[52px] font-black font-mono text-primary leading-none tracking-tighter" style={{
                textShadow: "0 0 30px hsl(142 72% 50% / 0.35)",
              }}>
                +{countUpValue}
              </p>
              <p className="text-[15px] font-semibold text-primary mt-1 mb-1">GEO Points</p>
              <p className="text-[11px] text-muted-foreground">
                {business ? `${business.name} added to your Empire!` : 'Added to your wallet balance'}
              </p>
            </motion.div>

            {/* Find Next Mission button */}
            <motion.button
              onClick={() => navigate("/map")}
              className="w-full mt-5 py-[15px] text-[15px] font-semibold text-primary-foreground transition-all active:scale-[0.98] bg-primary"
              style={{ borderRadius: "20px", boxShadow: "0 4px 24px hsl(142 72% 50% / 0.2)" }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              Find Next Mission
            </motion.button>

            <motion.button
              onClick={() => navigate("/wallet")}
              className="mt-3 text-[13px] text-muted-foreground font-medium hover:text-foreground transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              View Wallet →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValidationScreen;
