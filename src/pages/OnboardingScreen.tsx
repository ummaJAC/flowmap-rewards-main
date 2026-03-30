import { motion, AnimatePresence } from "framer-motion";
import { Mail, Chrome, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import useGameStore from "../store/useGameStore";

const DOTS_COUNT = 80;
const CONNECTIONS_DIST = 100;

const WorldMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: DOTS_COUNT }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // connections
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTIONS_DIST) {
            const alpha = (1 - dist / CONNECTIONS_DIST) * 0.12;
            ctx.strokeStyle = `hsla(142, 72%, 50%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // dots
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(142, 72%, 50%, 0.25)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
};

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { login, token, user } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [initialToken] = useState(token);

  // Auto-redirect ONLY if already logged in on initial load
  // This prevents skipping the Welcome tutorial for newly registered users
  useEffect(() => {
    if (initialToken && user) {
      navigate('/map');
    }
  }, [initialToken, user, navigate]);

  // Email states (persisted for mobile app switching PWA behavior)
  const [emailStep, setEmailStep] = useState<0 | 1 | 2>(() => {
    const saved = localStorage.getItem('geocorp_auth_step');
    return saved ? (parseInt(saved) as 0 | 1 | 2) : 0;
  });
  
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('geocorp_auth_email') || "";
  });
  
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Save states to localStorage so PWA doesn't lose them on alt-tab
  useEffect(() => {
    localStorage.setItem('geocorp_auth_step', emailStep.toString());
  }, [emailStep]);

  useEffect(() => {
    localStorage.setItem('geocorp_auth_email', email);
  }, [email]);

  // Custom Google Login Hook
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: tokenResponse.access_token }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem('geocorp_auth_step');
          localStorage.removeItem('geocorp_auth_email');
          login(data.token, data.user);
          navigate("/welcome"); // First time tutorial
        } else {
          console.error("Login failed:", data.error);
        }
      } catch (err) {
        console.error("Network error during login:", err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => console.error("Google Login Failed"),
  });

  const handleSendCode = async () => {
      if (!email || !email.includes("@")) {
          setErrorMsg("Please enter a valid email address");
          return;
      }
      setErrorMsg("");
      setIsLoading(true);
      
      try {
        const res = await fetch(`/api/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
            setEmailStep(2);
        } else {
            setErrorMsg(data.error || "Failed to send verification code");
        }
      } catch (err) {
        setErrorMsg("Network error connecting to backend");
      } finally {
        setIsLoading(false);
      }
  };

  const handleVerifyOTP = async () => {
      if (otp.length < 6) {
          setErrorMsg("Please enter the 6-digit code from your email");
          return;
      }
      setErrorMsg("");
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: otp }),
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.removeItem('geocorp_auth_step');
            localStorage.removeItem('geocorp_auth_email');
            login(data.token, data.user);
            navigate("/welcome");
        } else {
            setErrorMsg(data.error || "Verification failed");
        }
      } catch (err) {
        setErrorMsg("Network error connecting to backend");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-background pb-14 px-6">
      {/* Animated network background */}
      <WorldMap />

      {/* Ambient glow */}
      <div
        className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)",
        }}
      />

      {/* Logo & Title */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Map pin + hexagon icon */}
        <motion.div
          className="mb-6 relative"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="72" height="96" viewBox="0 0 72 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M36 4C20.536 4 8 16.536 8 32C8 52 36 80 36 80C36 80 64 52 64 32C64 16.536 51.464 4 36 4Z"
              stroke="hsl(142, 72%, 50%)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#glow)"
            />
            <polygon
              points="36,20 47,26 47,38 36,44 25,38 25,26"
              stroke="hsl(142, 72%, 50%)"
              strokeWidth="2"
              fill="hsl(142, 72%, 50%, 0.08)"
              filter="url(#glow)"
            />
          </svg>
        </motion.div>

        <h1 className="text-[36px] font-bold tracking-tight text-foreground leading-tight">
          Geo<span className="text-primary">Corp</span>
        </h1>
        <p className="mt-2.5 text-[15px] text-muted-foreground tracking-wide">
          Map the world. Earn crypto.
        </p>
      </motion.div>

      {/* Dynamic Action Area */}
      <motion.div
        className="relative z-10 w-full max-w-[340px] space-y-3 min-h-[160px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
            {emailStep === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <button
                      onClick={() => handleGoogleLogin()}
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-foreground py-[15px] text-background font-semibold text-[15px] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Chrome size={18} />
                      {isLoading ? "Signing in..." : "Continue with Google"}
                    </button>
            
                    <button
                      onClick={() => setEmailStep(1)}
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl py-[15px] text-foreground font-semibold text-[15px] transition-all duration-200 active:scale-[0.98]"
                      style={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(0 0% 100% / 0.06)" }}
                    >
                      <Mail size={18} />
                      Continue with Email
                    </button>
            
                    <p className="pt-5 text-center text-[11px] text-muted-foreground leading-relaxed">
                      By signing in, a secure blockchain wallet is
                      <br />
                      automatically created for you.
                      <br />
                      <span className="text-primary/50 mt-1 inline-block">No seed phrases. No hassle.</span>
                    </p>
                </motion.div>
            )}

            {emailStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => { setEmailStep(0); setErrorMsg(""); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className="font-black text-slate-800 tracking-tight text-lg">LOGIN</h3>
                        <div className="w-8" />
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 mb-4">Enter your email to receive a code.</p>
                    
                    <input 
                        type="email" 
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-bold outline-none focus:border-green-500 transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                    
                    {errorMsg && <p className="text-[10px] text-red-500 font-bold">{errorMsg}</p>}

                    <button
                      onClick={handleSendCode}
                      disabled={isLoading}
                      className="w-full bg-green-500 text-white font-black py-3.5 rounded-xl uppercase tracking-wider hover:bg-green-600 transition-colors disabled:opacity-50 mt-2 shadow-[0_4px_0_#16a34a]"
                    >
                      {isLoading ? "Sending..." : "Send Code"}
                    </button>
                </motion.div>
            )}

            {emailStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => { setEmailStep(1); setErrorMsg(""); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className="font-black text-slate-800 tracking-tight text-lg">VERIFY</h3>
                        <div className="w-8" />
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 mb-4">
                        Code sent to <b>{email}</b>.
                        <br/>
                        <span className="text-green-600">Check your inbox (and spam folder)</span>
                    </p>
                    
                    <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-slate-800 font-black outline-none focus:border-green-500 transition-colors"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                    />

                    {errorMsg && <p className="text-[10px] text-red-500 font-bold text-center mt-1">{errorMsg}</p>}

                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLoading}
                      className="w-full bg-green-500 text-white font-black py-3.5 rounded-xl uppercase tracking-wider hover:bg-green-600 transition-colors disabled:opacity-50 mt-4 shadow-[0_4px_0_#16a34a]"
                    >
                      {isLoading ? "Verifying..." : "Confirm & Play"}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;
