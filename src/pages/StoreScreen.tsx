import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import useGameStore from "../store/useGameStore";

interface StoreItem {
  id: number;
  name: string;
  description: string;
  price: number;
  iconClass: string;
  iconBg: string;
  iconColor: string;
  tag?: string;
}

const storeItems: StoreItem[] = [
  { id: 1, name: "Speed Booster", description: "x2 yield for 1 hour", price: 300, iconClass: "ph-lightning", iconBg: "bg-yellow-50", iconColor: "text-yellow-500", tag: "Popular" },
  { id: 2, name: "Area Shield", description: "Protects area from raids", price: 750, iconClass: "ph-shield-check", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { id: 3, name: "Coin Magnet", description: "Auto-collect nearby earnings", price: 450, iconClass: "ph-magnet", iconBg: "bg-green-50", iconColor: "text-green-500" },
  { id: 4, name: "XP Doubler", description: "Double XP for 24 hours", price: 500, iconClass: "ph-star", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { id: 5, name: "Radar Sweep", description: "Reveal hidden businesses", price: 200, iconClass: "ph-radar", iconBg: "bg-red-50", iconColor: "text-red-500", tag: "New" },
  { id: 6, name: "Premium Skin", description: "Exclusive building look", price: 1200, iconClass: "ph-paint-brush", iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

const StoreScreen = () => {
  const navigate = useNavigate();
  const balance = useGameStore(s => s.balance);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#F0FDF4", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <i className="ph-bold ph-caret-left text-xl" />
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Geo Store</h1>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 cursor-pointer" onClick={() => navigate("/wallet")}>
            <i className="ph-fill ph-coins text-lg" style={{ color: "#FACC15" }} />
            <span className="font-black text-slate-800 text-sm">{balance.toLocaleString()} <span className="text-slate-400 font-bold ml-0.5">GEO</span></span>
          </div>
        </div>

        {/* Deal of the Day Banner */}
        <div className="mx-6 mb-4 rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #22C55E, #059669)" }}>
          <div className="relative z-10">
            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Deal of the Day</p>
            <h2 className="text-lg font-black mt-1">Super Tycoon Pack</h2>
            <p className="text-xs font-bold opacity-70 mt-1">Speed Booster + Shield • Save 30%</p>
            <button className="mt-3 bg-white text-green-600 font-black text-sm px-4 py-2 rounded-xl" style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.1)" }}>
              BUY 699 GEO
            </button>
          </div>
          <i className="ph-fill ph-sparkle absolute -right-4 -top-4 text-white/10 text-8xl transform rotate-12" />
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-4">Boosters & Items</h3>
        <div className="space-y-3">
          {storeItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`ph-fill ${item.iconClass} ${item.iconColor} text-2xl`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-800">{item.name}</p>
                  {item.tag && (
                    <span className="bg-green-100 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">{item.tag}</span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-400">{item.description}</p>
              </div>
              <button
                className="bg-green-500 text-white font-black px-4 py-2 rounded-xl text-sm flex items-center gap-1 flex-shrink-0 transition-all active:translate-y-0.5"
                style={{ boxShadow: "0 3px 0 #15803D" }}
              >
                {item.price} GEO
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default StoreScreen;
