import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import useGameStore from "../store/useGameStore";

/* ---- Tier config ---- */
const tierBgColors: Record<string, string> = {
  easy: "bg-green-50",
  medium: "bg-blue-50",
  hard: "bg-yellow-50",
};

/* ---- Asset Card ---- */
const AssetCard = ({ bgColor, icon, emoji, badge, name, location, onDetails }: {
  bgColor: string; icon?: string; emoji?: string; badge: number; name: string; location: string; onDetails: () => void;
}) => (
  <div className="bg-white rounded-[24px] p-3 border border-slate-100 flex flex-col items-center card-soft-shadow">
    <div className={`w-full h-28 ${bgColor} rounded-xl mb-3 flex items-center justify-center relative overflow-hidden`}>
      <span className="text-4xl">{emoji || icon || "🏢"}</span>
      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
        +{badge}
      </div>
      <div className="absolute top-2 left-2 text-base">👑</div>
    </div>
    <p className="font-black text-slate-800 text-sm uppercase truncate w-full text-center">{name}</p>
    <p className="text-[10px] text-slate-400 font-bold mb-2">{location}</p>
    <button
      className="w-full bg-slate-50 py-2 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
      onClick={onDetails}
    >
      Details
    </button>
  </div>
);

/* ---- Details Modal ---- */
const DetailsModal = ({ asset, onClose }: { asset: any | null; onClose: () => void }) => {
  if (!asset) return null;
  const capturedDate = new Date(asset.capturedAt).toLocaleDateString();
  return (
    <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{asset.icon}</span>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase">{asset.name}</h2>
            <p className="text-sm text-slate-400 font-bold">{asset.category} • {asset.tier?.toUpperCase()}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-green-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Yield</p>
            <p className="font-extrabold text-green-600">+{asset.dailyYield} GEO</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Captured</p>
            <p className="font-extrabold text-slate-700 text-xs">{capturedDate}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
            <p className="font-extrabold text-green-600">Active</p>
          </div>
        </div>
        {asset.txHash && (
          <a
            href={`https://evm-testnet.flowscan.io/tx/${asset.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-50 text-blue-600 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider mb-3 hover:bg-blue-100 transition-colors"
          >
            View on Flowscan ↗
          </a>
        )}
        <button className="w-full bg-green-500 text-white py-3 rounded-2xl font-black uppercase tracking-wider hover:bg-green-600 transition-colors" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

/* ---- Main Page ---- */
const ProfileScreen = () => {
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const navigate = useNavigate();
  
  const ownedLocations = useGameStore(s => s.ownedLocations);
  const balance = useGameStore(s => s.balance);
  const totalEarned = useGameStore(s => s.totalEarned);
  const totalCaptures = useGameStore(s => s.totalCaptures);

  // Calculate total daily yield from all properties
  const totalDailyYield = ownedLocations.reduce((sum, loc) => sum + loc.dailyYield, 0);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#F8FAFC", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="pt-[max(2.5rem,env(safe-area-inset-top))] px-6 pb-6 bg-white border-b border-slate-100">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MY EMPIRE</h1>
        </div>

        {/* Earnings Card */}
        <div className="rounded-3xl p-5 text-white shadow-lg relative overflow-hidden gradient-earnings">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Total Earnings</p>
            <div className="flex items-center gap-2 mb-4">
              <i className="ph-fill ph-sparkle text-yellow-400 text-2xl" />
              <span className="text-4xl font-black">
                {Math.floor(balance).toLocaleString()} <span className="text-lg opacity-70">GEO</span>
              </span>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold opacity-80 uppercase">Daily Yield</p>
                <p className="font-extrabold">+{totalDailyYield} GEO</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold opacity-80 uppercase">Assets</p>
                <p className="font-extrabold">{ownedLocations.length} Owned</p>
              </div>
            </div>
          </div>
          <i className="ph-fill ph-chart-line-up absolute -right-4 -bottom-4 text-white/10 text-9xl transform -rotate-12" />
        </div>
      </div>

      {/* Asset Portfolio */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Asset Portfolio</h3>
          <span className="text-xs font-bold text-green-500">{totalCaptures} Captured</span>
        </div>

        {ownedLocations.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-6xl mb-4">🏗️</span>
            <p className="font-black text-slate-700 text-lg mb-2">No Properties Yet</p>
            <p className="text-slate-400 text-sm text-center mb-6 max-w-[240px]">
              Start capturing businesses on the map to build your empire!
            </p>
            <button
              onClick={() => navigate("/map")}
              className="bg-green-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-wider hover:bg-green-600 transition-colors"
              style={{ boxShadow: "0 6px 0 #15803D" }}
            >
              Explore Map
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-28">
            {ownedLocations.map((loc) => (
              <AssetCard
                key={loc.id}
                bgColor={tierBgColors[loc.tier] || "bg-slate-50"}
                emoji={loc.icon}
                badge={loc.dailyYield}
                name={loc.name}
                location={loc.category}
                onDetails={() => setSelectedAsset(loc)}
              />
            ))}

            {/* Explore more CTA */}
            <div
              className="bg-slate-100 rounded-[24px] p-3 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/map")}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                <i className="ph ph-plus text-green-500 text-2xl font-bold" />
              </div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Capture More</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* Modal */}
      {selectedAsset && <DetailsModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
    </div>
  );
};

export default ProfileScreen;
