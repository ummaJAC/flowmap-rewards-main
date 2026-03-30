import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  appContainer: {
    width: '400px',
    height: '867px',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  gridBg: {
    backgroundImage: 'linear-gradient(#bbf7d0 2px, transparent 2px), linear-gradient(90deg, #bbf7d0 2px, transparent 2px)',
    backgroundSize: '40px 40px',
  },
  conicRays: {
    background: 'conic-gradient(from 0deg, #FACC15 0deg 10deg, transparent 10deg 30deg, #22C55E 30deg 40deg, transparent 40deg 60deg, #FACC15 60deg 70deg, transparent 70deg 90deg, #22C55E 90deg 100deg, transparent 100deg 120deg, #FACC15 120deg 130deg, transparent 130deg 150deg, #22C55E 150deg 160deg, transparent 160deg 180deg)',
  },
  rewardTileActive: {
    border: '2px solid #22C55E',
    background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
  },
  rewardTileLocked: {
    backgroundColor: '#F8FAFC',
    border: '2px solid #E2E8F0',
  },
  rewardTileClaimed: {
    backgroundColor: '#F1F5F9',
    border: '2px solid #CBD5E1',
    opacity: 0.7,
  },
  gameBtn: {
    boxShadow: '0 6px 0 #15803D',
  },
  gameBtnActive: {
    boxShadow: '0 0px 0 #15803D',
  },
};

const DailyRewardsPage = () => {
  const [claimed, setClaimed] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [floatY, setFloatY] = useState(0);
  const [rayRotation, setRayRotation] = useState(0);
  const [bounceActive, setBounceActive] = useState(true);

  useEffect(() => {
    let start = null;
    let animId;
    const floatAnim = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      setFloatY(Math.sin((elapsed / 3) * 2 * Math.PI) * 10);
      animId = requestAnimationFrame(floatAnim);
    };
    animId = requestAnimationFrame(floatAnim);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    let start = null;
    let animId;
    const rayAnim = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      setRayRotation((elapsed / 25) * 360 % 360);
      animId = requestAnimationFrame(rayAnim);
    };
    animId = requestAnimationFrame(rayAnim);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleClaim = () => {
    setClaimed(true);
  };

  const handleBtnDown = () => setBtnPressed(true);
  const handleBtnUp = () => setBtnPressed(false);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", backgroundColor: '#f0fdfa', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', margin: 0 }}>
      <div style={customStyles.appContainer} className="rounded-[20px] flex flex-col">

        {/* Background */}
        <div className="absolute inset-0 bg-[#F0FDF4] overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute w-full h-full opacity-30" style={customStyles.gridBg}></div>
          <div className="absolute w-[120%] h-[60%] bg-yellow-400/10 rounded-[100%] top-[-20%] left-[-10%] blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="px-6 pt-12 pb-4 flex justify-between items-center" style={{ zIndex: 10 }}>
          <button className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-600">
            <i className="ph ph-caret-left font-bold text-xl"></i>
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">DAILY REWARDS</h1>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            <i className="ph-fill ph-coin text-yellow-400 text-lg"></i>
            <span className="font-bold text-slate-800 text-sm">1,450</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-6 overflow-y-auto pb-32" style={{ zIndex: 10 }}>

          {/* Chest Hero */}
          <div className="relative w-full h-64 flex justify-center items-center my-4">
            {/* Spinning Rays */}
            <div
              className="absolute opacity-30 pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                width: '320px',
                height: '320px',
                transform: `translate(-50%, -50%) rotate(${rayRotation}deg)`,
                zIndex: 0,
              }}
            >
              <div className="absolute inset-0" style={customStyles.conicRays}></div>
            </div>

            {/* Floating Chest */}
            <div
              className="relative flex flex-col items-center"
              style={{ zIndex: 10, transform: `translateY(${floatY}px)`, transition: 'none' }}
            >
              <div className="w-48 h-40 relative">
                {/* Chest Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-yellow-400 rounded-xl border-b-8 border-yellow-600 shadow-xl">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-6 bg-yellow-600 rounded-md"></div>
                </div>
                {/* Chest Lid */}
                <div className="absolute top-4 left-[-4%] w-[108%] h-20 bg-yellow-400 rounded-t-2xl border-b-4 border-yellow-600 shadow-md flex items-center justify-center">
                  <i className="ph-fill ph-sparkle text-white text-4xl opacity-50"></i>
                </div>
                {/* Sparkle */}
                <div className="absolute -top-4 -right-2 transform rotate-12">
                  <i className="ph-fill ph-sparkle text-yellow-400 text-4xl animate-pulse"></i>
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div className="absolute bottom-8 w-40 h-4 bg-black/10 rounded-[100%] blur-md"></div>
          </div>

          {/* Streak Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">7 DAY STREAK</h2>
            <p className="text-slate-500 font-bold">Claim every day to win the Mega Chest!</p>
          </div>

          {/* Reward Tiles Grid */}
          <div className="grid grid-cols-4 gap-3 mb-8">

            {/* Day 1 - Claimed */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center relative"
              style={{ ...customStyles.rewardTileClaimed, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase">Day 1</span>
              <i className="ph-fill ph-coin text-yellow-400 text-xl my-1"></i>
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                <i className="ph ph-check font-bold text-xs"></i>
              </div>
            </div>

            {/* Day 2 - Claimed */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center relative"
              style={{ ...customStyles.rewardTileClaimed, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase">Day 2</span>
              <i className="ph-fill ph-sparkle text-sky-400 text-xl my-1"></i>
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                <i className="ph ph-check font-bold text-xs"></i>
              </div>
            </div>

            {/* Day 3 - Active */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center shadow-md"
              style={{ ...customStyles.rewardTileActive, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-green-500 uppercase">Day 3</span>
              <i className="ph-fill ph-coin text-yellow-400 text-2xl my-1 animate-bounce"></i>
              <span className="text-[10px] font-bold text-slate-600">+100 GEO</span>
            </div>

            {/* Day 4 - Locked */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center"
              style={{ ...customStyles.rewardTileLocked, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase">Day 4</span>
              <i className="ph-fill ph-coin text-slate-300 text-xl my-1"></i>
            </div>

            {/* Day 5 - Locked */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center"
              style={{ ...customStyles.rewardTileLocked, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase">Day 5</span>
              <i className="ph-fill ph-sparkle text-slate-300 text-xl my-1"></i>
            </div>

            {/* Day 6 - Locked */}
            <div
              className="rounded-2xl p-2 flex flex-col items-center justify-center"
              style={{ ...customStyles.rewardTileLocked, aspectRatio: '1/1' }}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase">Day 6</span>
              <i className="ph-fill ph-coin text-slate-300 text-xl my-1"></i>
            </div>

            {/* Day 7 - Mega Chest (col-span-2) */}
            <div
              className="col-span-2 bg-gradient-to-br from-yellow-400/20 to-orange-100 border-2 border-yellow-400 rounded-2xl p-2 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-1">
                <i className="ph-fill ph-crown text-yellow-400 text-xs"></i>
              </div>
              <span className="text-[10px] font-black text-orange-600 uppercase">Day 7 Bonus</span>
              <div className="flex gap-1 items-center my-1">
                <i className="ph-fill ph-treasure-chest text-orange-500 text-2xl"></i>
              </div>
              <span className="text-[10px] font-bold text-orange-600">MEGA CHEST</span>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="absolute bottom-0 left-0 w-full p-6 pb-10 bg-white/80 backdrop-blur-md rounded-t-[32px] border-t border-slate-100"
          style={{ zIndex: 50 }}
        >
          {claimed ? (
            <div className="w-full bg-slate-100 text-slate-500 rounded-[20px] py-4 flex justify-center items-center gap-2">
              <span className="font-black text-xl tracking-wide uppercase">Claimed!</span>
              <i className="ph-bold ph-check-circle text-2xl text-green-500"></i>
            </div>
          ) : (
            <button
              className="w-full bg-green-500 hover:bg-green-700 text-white rounded-[20px] py-4 transition-all flex justify-center items-center gap-2 group"
              style={btnPressed ? { ...customStyles.gameBtnActive, transform: 'translateY(6px)' } : customStyles.gameBtn}
              onMouseDown={handleBtnDown}
              onMouseUp={handleBtnUp}
              onMouseLeave={handleBtnUp}
              onTouchStart={handleBtnDown}
              onTouchEnd={handleBtnUp}
              onClick={handleClaim}
            >
              <span className="font-black text-xl tracking-wide uppercase">Claim Today</span>
              <i className="ph-bold ph-gift text-2xl"></i>
            </button>
          )}
          <p className="text-center mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Next reward in <span className="text-slate-800">14:22:05</span>
          </p>
        </div>

        {/* Bottom Green Bar */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-green-500" style={{ zIndex: 60 }}></div>

      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
    `;
    document.head.appendChild(style);

    const phosphorScript = document.createElement('script');
    phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(phosphorScript);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<DailyRewardsPage />} />
      </Routes>
    </Router>
  );
};

export default App;