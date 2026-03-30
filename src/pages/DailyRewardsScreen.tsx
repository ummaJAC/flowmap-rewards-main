import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const DailyRewardsScreen = () => {
  const navigate = useNavigate();
  const [claimed, setClaimed] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [floatY, setFloatY] = useState(0);
  const [rayRotation, setRayRotation] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let animId: number;
    const floatAnim = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      setFloatY(Math.sin((elapsed / 3) * 2 * Math.PI) * 10);
      animId = requestAnimationFrame(floatAnim);
    };
    animId = requestAnimationFrame(floatAnim);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    let start: number | null = null;
    let animId: number;
    const rayAnim = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      setRayRotation((elapsed / 25) * 360 % 360);
      animId = requestAnimationFrame(rayAnim);
    };
    animId = requestAnimationFrame(rayAnim);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleClaim = () => setClaimed(true);

  const conicRays = "conic-gradient(from 0deg, #FACC15 0deg 10deg, transparent 10deg 30deg, #22C55E 30deg 40deg, transparent 40deg 60deg, #FACC15 60deg 70deg, transparent 70deg 90deg, #22C55E 90deg 100deg, transparent 100deg 120deg, #FACC15 120deg 130deg, transparent 130deg 150deg, #22C55E 150deg 160deg, transparent 160deg 180deg)";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#F0FDF4", zIndex: 0 }}>
        <div className="absolute w-full h-full opacity-30" style={{ backgroundImage: "linear-gradient(#bbf7d0 2px, transparent 2px), linear-gradient(90deg, #bbf7d0 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
        <div className="absolute w-[120%] h-[60%] bg-yellow-400/10 rounded-[100%] top-[-20%] left-[-10%] blur-3xl" />
      </div>

      {/* Header */}
      <div className="px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-4 flex justify-between items-center" style={{ zIndex: 10 }}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-600">
          <i className="ph ph-caret-left font-bold text-xl" />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">DAILY REWARDS</h1>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
          <i className="ph-fill ph-coin text-yellow-400 text-lg" />
          <span className="font-bold text-slate-800 text-sm">1,450</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-6 overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))] scrollbar-hide" style={{ zIndex: 10 }}>
        {/* Chest Hero */}
        <div className="relative w-full h-64 flex justify-center items-center my-4">
          {/* Spinning Rays */}
          <div
            className="absolute opacity-30 pointer-events-none"
            style={{ top: "50%", left: "50%", width: "320px", height: "320px", transform: `translate(-50%, -50%) rotate(${rayRotation}deg)`, zIndex: 0 }}
          >
            <div className="absolute inset-0" style={{ background: conicRays }} />
          </div>

          {/* Floating Chest */}
          <div className="relative flex flex-col items-center" style={{ zIndex: 10, transform: `translateY(${floatY}px)` }}>
            <div className="w-48 h-40 relative">
              {/* Chest Bottom */}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-yellow-400 rounded-xl border-b-8 border-yellow-600 shadow-xl">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-6 bg-yellow-600 rounded-md" />
              </div>
              {/* Chest Lid */}
              <div className="absolute top-4 left-[-4%] w-[108%] h-20 bg-yellow-400 rounded-t-2xl border-b-4 border-yellow-600 shadow-md flex items-center justify-center">
                <i className="ph-fill ph-sparkle text-white text-4xl opacity-50" />
              </div>
              {/* Sparkle */}
              <div className="absolute -top-4 -right-2 transform rotate-12">
                <i className="ph-fill ph-sparkle text-yellow-400 text-4xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Shadow */}
          <div className="absolute bottom-8 w-40 h-4 bg-black/10 rounded-[100%] blur-md" />
        </div>

        {/* Streak Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">7 DAY STREAK</h2>
          <p className="text-slate-500 font-bold">Claim every day to win the Mega Chest!</p>
        </div>

        {/* Reward Tiles Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {/* Day 1 - Claimed */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center relative aspect-square" style={{ backgroundColor: "#F1F5F9", border: "2px solid #CBD5E1", opacity: 0.7 }}>
            <span className="text-[10px] font-black text-slate-400 uppercase">Day 1</span>
            <i className="ph-fill ph-coin text-yellow-400 text-xl my-1" />
            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              <i className="ph ph-check font-bold text-xs" />
            </div>
          </div>

          {/* Day 2 - Claimed */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center relative aspect-square" style={{ backgroundColor: "#F1F5F9", border: "2px solid #CBD5E1", opacity: 0.7 }}>
            <span className="text-[10px] font-black text-slate-400 uppercase">Day 2</span>
            <i className="ph-fill ph-sparkle text-sky-400 text-xl my-1" />
            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              <i className="ph ph-check font-bold text-xs" />
            </div>
          </div>

          {/* Day 3 - Active */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center shadow-md aspect-square" style={{ border: "2px solid #22C55E", background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)" }}>
            <span className="text-[10px] font-black text-green-500 uppercase">Day 3</span>
            <i className="ph-fill ph-coin text-yellow-400 text-2xl my-1 animate-bounce" />
            <span className="text-[10px] font-bold text-slate-600">+100 GEO</span>
          </div>

          {/* Day 4 - Locked */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: "#F8FAFC", border: "2px solid #E2E8F0" }}>
            <span className="text-[10px] font-black text-slate-400 uppercase">Day 4</span>
            <i className="ph-fill ph-coin text-slate-300 text-xl my-1" />
          </div>

          {/* Day 5 - Locked */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: "#F8FAFC", border: "2px solid #E2E8F0" }}>
            <span className="text-[10px] font-black text-slate-400 uppercase">Day 5</span>
            <i className="ph-fill ph-sparkle text-slate-300 text-xl my-1" />
          </div>

          {/* Day 6 - Locked */}
          <div className="rounded-2xl p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: "#F8FAFC", border: "2px solid #E2E8F0" }}>
            <span className="text-[10px] font-black text-slate-400 uppercase">Day 6</span>
            <i className="ph-fill ph-coin text-slate-300 text-xl my-1" />
          </div>

          {/* Day 7 - Mega Chest (col-span-2) */}
          <div className="col-span-2 bg-gradient-to-br from-yellow-400/20 to-orange-100 border-2 border-yellow-400 rounded-2xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <i className="ph-fill ph-crown text-yellow-400 text-xs" />
            </div>
            <span className="text-[10px] font-black text-orange-600 uppercase">Day 7 Bonus</span>
            <div className="flex gap-1 items-center my-1">
              <i className="ph-fill ph-treasure-chest text-orange-500 text-2xl" />
            </div>
            <span className="text-[10px] font-bold text-orange-600">MEGA CHEST</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-10 bg-white/80 backdrop-blur-md rounded-t-[32px] border-t border-slate-100" style={{ zIndex: 50 }}>
        {claimed ? (
          <div className="w-full bg-slate-100 text-slate-500 rounded-[20px] py-4 flex justify-center items-center gap-2">
            <span className="font-black text-xl tracking-wide uppercase">Claimed!</span>
            <i className="ph-bold ph-check-circle text-2xl text-green-500" />
          </div>
        ) : (
          <button
            className="w-full bg-green-500 hover:bg-green-700 text-white rounded-[20px] py-4 transition-all flex justify-center items-center gap-2"
            style={btnPressed ? { boxShadow: "0 0px 0 #15803D", transform: "translateY(6px)" } : { boxShadow: "0 6px 0 #15803D" }}
            onMouseDown={() => setBtnPressed(true)}
            onMouseUp={() => setBtnPressed(false)}
            onMouseLeave={() => setBtnPressed(false)}
            onTouchStart={() => setBtnPressed(true)}
            onTouchEnd={() => setBtnPressed(false)}
            onClick={handleClaim}
          >
            <span className="font-black text-xl tracking-wide uppercase">Claim Today</span>
            <i className="ph-bold ph-gift text-2xl" />
          </button>
        )}
        <p className="text-center mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Next reward in <span className="text-slate-800">14:22:05</span>
        </p>
      </div>

      {/* Bottom Green Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-green-500" style={{ zIndex: 60 }} />
    </div>
  );
};

export default DailyRewardsScreen;
