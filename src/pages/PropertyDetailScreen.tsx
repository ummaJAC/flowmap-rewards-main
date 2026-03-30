import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PropertyDetailScreen = () => {
  const navigate = useNavigate();
  const [upgraded, setUpgraded] = useState(false);
  const [collected, setCollected] = useState(false);
  const [mapClicked, setMapClicked] = useState(false);

  const handleUpgrade = () => { setUpgraded(true); setTimeout(() => setUpgraded(false), 2000); };
  const handleCollect = () => { setCollected(true); setTimeout(() => setCollected(false), 2000); };
  const handleMapClick = () => { setMapClicked(true); setTimeout(() => setMapClicked(false), 200); };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: "#F8FAFC" }}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <i className="ph-bold ph-caret-left text-xl" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property Detail</p>
            <h1 className="font-black text-slate-800">STARBUCKS #142</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <i className="ph-bold ph-dots-three-outline-fill text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Visual */}
          <div className="relative w-full h-56 bg-gradient-to-b from-blue-50 to-white rounded-3xl flex flex-col items-center justify-center overflow-hidden border border-slate-100">
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-slate-100 z-10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Active Earning</span>
            </div>

            <div className="relative z-10 flex flex-col items-center animate-float-slow">
              <div className="absolute -top-6 z-30 w-12 h-12 bg-white rounded-full border-[3px] border-green-500 shadow-lg flex items-center justify-center transform rotate-[-5deg]">
                <i className="ph-fill ph-coffee text-green-500 text-xl" />
              </div>
              <div className="w-36 h-28 bg-white rounded-xl relative shadow-xl border-2 border-white flex flex-col items-center">
                <div className="w-[110%] h-8 rounded-t-xl rounded-b-md shadow-md z-20 absolute -top-1 border-b-2 border-green-700 awning-green" style={{ left: "-5%" }} />
                <div className="w-full px-4 pt-10 flex justify-between relative z-10">
                  <div className="w-10 h-12 bg-blue-50 rounded-lg border border-white shadow-inner relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white" />
                  </div>
                  <div className="w-10 h-16 bg-slate-400 rounded-t-lg border border-slate-300 border-b-0 relative self-end" style={{ marginBottom: "-2px" }}>
                    <div className="absolute top-1/2 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>
              <div className="w-40 h-3 bg-black/5 rounded-[100%] mt-2" style={{ filter: "blur(4px)" }} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Upgrade level</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-sky-400">LVL 08</span>
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-3 bg-sky-400 rounded-full" />
                  <div className="w-1.5 h-3 bg-sky-400 rounded-full" />
                  <div className="w-1.5 h-3 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">District</p>
              <div className="flex items-center gap-1 text-slate-700 font-bold">
                <i className="ph-fill ph-map-pin text-yellow-400" />
                <span>5th Ave</span>
              </div>
            </div>
          </div>

          {/* Weekly Revenue Chart */}
          <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-slate-800">Weekly Revenue</h3>
                <p className="text-xs font-bold text-slate-400">Past 7 days performance</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-green-500 leading-none">+342</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">GEO Total</p>
              </div>
            </div>

            <div className="flex items-end justify-between h-32 gap-2">
              {[
                { day: "M", height: "40%", opacity: "bg-green-500/20" },
                { day: "T", height: "65%", opacity: "bg-green-500/40" },
                { day: "W", height: "50%", opacity: "bg-green-500/30" },
                { day: "T", height: "90%", opacity: "bg-green-500" },
                { day: "F", height: "75%", opacity: "bg-green-500/60" },
                { day: "S", height: "30%", opacity: "bg-green-500/20" },
                { day: "S", height: "15%", opacity: "bg-green-500/10" },
              ].map((bar, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full ${bar.opacity} rounded-t-lg`} style={{ height: bar.height }} />
                  <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-4">
            {/* Upgrade Store */}
            <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-1 relative border-[1.5px] border-green-500 border-dashed">
              <div className="absolute w-4 h-4 bg-[#F8FAFC] rounded-full transform -translate-y-1/2 border-r-[1.5px] border-green-500 border-dashed" style={{ top: "50%", left: "-8px" }} />
              <div className="absolute w-4 h-4 bg-[#F8FAFC] rounded-full transform -translate-y-1/2 border-l-[1.5px] border-green-500 border-dashed" style={{ top: "50%", right: "-8px" }} />
              <div className="bg-white/60 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-800 text-base">UPGRADE STORE</p>
                  <p className="text-xs font-bold text-slate-500">+12 GEO Daily Yield</p>
                </div>
                <button onClick={handleUpgrade} className="bg-green-500 text-white font-black px-4 py-2 rounded-xl text-sm flex items-center gap-1 transition-all active:translate-y-1" style={{ boxShadow: "0 4px 0 #15803D" }}>
                  <i className="ph-fill ph-sparkle text-yellow-400" />
                  {upgraded ? "Upgrading..." : "250"}
                </button>
              </div>
            </div>

            {/* Collect Earnings */}
            <div className="w-full bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-1 relative border-[1.5px] border-sky-400 border-dashed">
              <div className="absolute w-4 h-4 bg-[#F8FAFC] rounded-full transform -translate-y-1/2 border-r-[1.5px] border-sky-400 border-dashed" style={{ top: "50%", left: "-8px" }} />
              <div className="absolute w-4 h-4 bg-[#F8FAFC] rounded-full transform -translate-y-1/2 border-l-[1.5px] border-sky-400 border-dashed" style={{ top: "50%", right: "-8px" }} />
              <button onClick={handleCollect} className="w-full bg-white/60 rounded-xl px-5 py-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="font-black text-slate-800 text-base">COLLECT EARNINGS</p>
                  <p className="text-xs font-bold text-slate-500">{collected ? "Collected!" : "Ready to claim"}</p>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-black text-lg">
                  {collected ? (
                    <span className="text-green-500 text-sm font-black">✓ Done</span>
                  ) : (
                    <>+42 <span className="text-xs text-slate-400">GEO</span></>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* View on Map Button */}
          <button
            onClick={handleMapClick}
            className="w-full bg-slate-900 text-white rounded-[20px] py-4 transition-all flex justify-center items-center gap-2"
            style={mapClicked ? { boxShadow: "none", transform: "translateY(6px)" } : { boxShadow: "0 6px 0 #000000" }}
          >
            <span className="font-black text-lg tracking-wide">VIEW ON MAP</span>
            <i className="ph-bold ph-map-trifold text-xl" />
          </button>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-8">Owner ID: 0x82f...a9c4</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailScreen;
