import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ── Custom SVG Illustrations ── */

const CityMapIllustration = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Grid streets */}
    {[30, 55, 80, 105, 130].map((x) => (
      <line key={`v${x}`} x1={x} y1="15" x2={x} y2="145" stroke="hsl(150 8% 18%)" strokeWidth="1" />
    ))}
    {[30, 55, 80, 105, 130].map((y) => (
      <line key={`h${y}`} x1="15" y1={y} x2="145" y2={y} stroke="hsl(150 8% 18%)" strokeWidth="1" />
    ))}

    {/* City blocks */}
    <rect x="32" y="32" width="21" height="21" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="57" y="57" width="21" height="21" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="107" y="32" width="21" height="21" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="32" y="107" width="21" height="21" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="82" y="82" width="21" height="46" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="57" y="32" width="46" height="21" rx="2" fill="hsl(150 10% 9%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />
    <rect x="107" y="82" width="21" height="21" rx="2" fill="hsl(150 10% 10%)" stroke="hsl(150 8% 16%)" strokeWidth="0.5" />

    {/* Glowing route line */}
    <path
      d="M25 130 L55 130 L55 105 L80 105 L80 80 L105 80 L105 55 L130 55 L130 30"
      stroke="hsl(142 72% 50%)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      filter="url(#routeGlow)"
    />
    {/* Route dots at turns */}
    {[
      [25, 130], [55, 130], [55, 105], [80, 105], [80, 80], [105, 80], [105, 55], [130, 55], [130, 30],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={i === 0 || i === 8 ? 4 : 2} fill="hsl(142 72% 50%)" filter="url(#routeGlow)" />
    ))}

    {/* Pin at start */}
    <circle cx="25" cy="130" r="6" fill="hsl(142 72% 50% / 0.15)" stroke="hsl(142 72% 50%)" strokeWidth="1.5" />
    {/* Pin at end */}
    <circle cx="130" cy="30" r="6" fill="hsl(142 72% 50% / 0.15)" stroke="hsl(142 72% 50%)" strokeWidth="1.5" />
    <circle cx="130" cy="30" r="2.5" fill="hsl(142 72% 50%)" />

    <defs>
      <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const AIEyeIllustration = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer neural ring */}
    <circle cx="80" cy="80" r="60" stroke="hsl(150 8% 16%)" strokeWidth="0.5" fill="none" />
    <circle cx="80" cy="80" r="48" stroke="hsl(150 8% 18%)" strokeWidth="0.5" fill="none" />

    {/* Neural network nodes on outer ring */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 80 + Math.cos(rad) * 60;
      const cy = 80 + Math.sin(rad) * 60;
      return (
        <g key={`outer${i}`}>
          <circle cx={cx} cy={cy} r="2.5" fill="hsl(142 72% 50% / 0.4)" />
          <line x1={cx} y1={cy} x2={80 + Math.cos(rad) * 48} y2={80 + Math.sin(rad) * 48} stroke="hsl(142 72% 50% / 0.12)" strokeWidth="0.5" />
        </g>
      );
    })}

    {/* Inner nodes */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 80 + Math.cos(rad) * 48;
      const cy = 80 + Math.sin(rad) * 48;
      return <circle key={`inner${i}`} cx={cx} cy={cy} r="1.5" fill="hsl(142 72% 50% / 0.3)" />;
    })}

    {/* Eye shape */}
    <path
      d="M30 80 Q55 50 80 50 Q105 50 130 80 Q105 110 80 110 Q55 110 30 80Z"
      stroke="hsl(142 72% 50%)"
      strokeWidth="1.5"
      fill="hsl(142 72% 50% / 0.03)"
      filter="url(#eyeGlow)"
    />

    {/* Iris */}
    <circle cx="80" cy="80" r="18" stroke="hsl(142 72% 50%)" strokeWidth="1.5" fill="hsl(142 72% 50% / 0.06)" filter="url(#eyeGlow)" />

    {/* Pupil */}
    <circle cx="80" cy="80" r="8" fill="hsl(142 72% 50% / 0.25)" stroke="hsl(142 72% 50%)" strokeWidth="1" filter="url(#eyeGlow)" />
    <circle cx="80" cy="80" r="3" fill="hsl(142 72% 50%)" filter="url(#eyeGlow)" />

    {/* Scan lines */}
    <line x1="40" y1="70" x2="120" y2="70" stroke="hsl(142 72% 50% / 0.08)" strokeWidth="0.5" />
    <line x1="35" y1="80" x2="125" y2="80" stroke="hsl(142 72% 50% / 0.06)" strokeWidth="0.5" />
    <line x1="40" y1="90" x2="120" y2="90" stroke="hsl(142 72% 50% / 0.08)" strokeWidth="0.5" />

    {/* Highlight */}
    <circle cx="75" cy="75" r="2" fill="hsl(0 0% 100% / 0.3)" />

    <defs>
      <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const GPSIllustration = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Radar sweep */}
    <circle cx="80" cy="80" r="60" stroke="hsl(150 8% 16%)" strokeWidth="1" fill="none" />
    <circle cx="80" cy="80" r="40" stroke="hsl(150 8% 18%)" strokeWidth="1" fill="none" />
    <circle cx="80" cy="80" r="20" stroke="hsl(150 8% 20%)" strokeWidth="1" fill="none" />
    
    <path d="M80 80 L140 80 A60 60 0 0 0 80 20 Z" fill="hsl(142 72% 50% / 0.15)" filter="url(#gpsGlow)" />
    
    {/* Pin marker */}
    <path
      d="M80 35 C68.954 35 60 43.954 60 55 C60 70 80 95 80 95 C80 95 100 70 100 55 C100 43.954 91.046 35 80 35 Z"
      fill="hsl(142 72% 50% / 0.1)"
      stroke="hsl(142 72% 50%)"
      strokeWidth="2"
      filter="url(#gpsGlow)"
    />
    <circle cx="80" cy="55" r="8" fill="hsl(142 72% 50%)" filter="url(#gpsGlow)" />
    
    {/* Found dots */}
    <circle cx="110" cy="60" r="3" fill="hsl(142 72% 50%)" filter="url(#gpsGlow)" />
    <circle cx="50" cy="90" r="2" fill="hsl(142 72% 50%)" filter="url(#gpsGlow)" />
    <circle cx="100" cy="110" r="4" fill="hsl(142 72% 50% / 0.5)" />

    <defs>
      <filter id="gpsGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const illustrations = [CityMapIllustration, AIEyeIllustration, GPSIllustration];

const slides = [
  {
    title: "Map the World,\nEarn Crypto",
    subtitle: "Walk around your city, complete missions, snap photos — earn $GEO tokens for every verified task.",
  },
  {
    title: "AI Verifies\nYour Work",
    subtitle: "Every photo gets checked by AI in seconds. No fakes pass through — your effort always counts.",
  },
  {
    title: "Enable\nLocation",
    subtitle: "Turn ON your phone's GPS and allow browser location access so we can find capture targets around you.",
  },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigate("/map");
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const isLast = current === slides.length - 1;
  const Illustration = illustrations[current];

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-background"
      onTouchStart={(e) => setDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const diff = dragStart - e.changedTouches[0].clientX;
        if (diff > 50) next();
        else if (diff < -50) prev();
      }}
    >
      {/* Skip */}
      <div className="relative z-10 flex justify-end px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate("/map")}
          className="text-[13px] text-muted-foreground font-medium px-3 py-1.5"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Illustration with glow */}
            <div className="relative mb-6">
              <div
                className="absolute inset-[-30px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(142 72% 30% / 0.1), transparent 70%)",
                }}
              />
              <Illustration />
            </div>

            <h1 className="text-[30px] font-bold text-foreground leading-[1.2] tracking-tight whitespace-pre-line">
              {slides[current].title}
            </h1>

            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-[300px]">
              {slides[current].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 6,
                background: i === current ? "hsl(var(--primary))" : "hsl(0 0% 100% / 0.1)",
              }}
            />
          ))}
        </div>

        {/* Neon green CTA */}
        <motion.button
          onClick={next}
          className="w-full max-w-[340px] flex items-center justify-center gap-2 rounded-2xl py-[16px] font-semibold text-[15px] bg-primary text-primary-foreground active:scale-[0.98] transition-transform"
          style={{
            boxShadow: "0 0 24px hsl(142 72% 50% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.12)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          {isLast ? "Get Started" : "Next"}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
