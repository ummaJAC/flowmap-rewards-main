import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import useGameStore from "../store/useGameStore";

const LeaderboardRow = ({ rank, username, assets, geoPerDay, seed, bgColor, rankBg, cardBorder, isYou = false, isNearby = false }: {
  rank: number; username: string; assets: number; geoPerDay: string; seed: string; bgColor: string; rankBg?: string; cardBorder?: string; isYou?: boolean; isNearby?: boolean;
}) => {
  const cardClass = isYou
    ? "flex items-center bg-green-50 p-3 rounded-2xl border-2 border-green-500"
    : isNearby
    ? "flex items-center bg-white p-3 rounded-2xl border-2 border-slate-100"
    : `flex items-center bg-white p-3 rounded-2xl border-2 ${cardBorder || 'border-transparent'}`;

  return (
    <div className={cardClass} style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.05)" }}>
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full mr-3 border-2 border-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: isYou ? "#1e293b" : isNearby ? "#f1f5f9" : rankBg || '#CBD5E1' }}
      >
        <span className={`font-black text-lg ${isNearby ? "text-slate-400" : "text-white"} ${rank >= 10 ? "text-sm" : ""}`}>{rank}</span>
      </div>
      <div className="relative mr-3 flex-shrink-0">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bgColor}`}
          className={`w-12 h-12 rounded-full border-2 ${isYou ? "border-white" : "border-slate-100"}`}
          alt="Avatar"
        />
        {isYou && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">YOU</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-black text-slate-800 ${isYou ? "uppercase tracking-tight" : ""}`}>{username}</p>
        <p className={`text-xs font-bold uppercase tracking-wide ${isYou ? "text-green-700" : "text-slate-400"}`}>{assets} Assets</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-black text-green-500 text-lg leading-none">{geoPerDay}</p>
        <p className="text-[10px] font-bold text-slate-400">GEO</p>
      </div>
    </div>
  );
};

const bgColors = ["38BDF8", "bbf7d0", "fed7aa", "fbcfe8", "e9d5ff"];
const rankColors = ["#FACC15", "#CBD5E1", "#D97706", "#94A3B8", "#94A3B8"];
const borderColors = ["border-yellow-400", "border-slate-300", "border-amber-600/40", "border-slate-200", "border-slate-200"];

const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Global");
  const tabs = ["Global", "Friends", "Local"];
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const currentUser = useGameStore(s => s.user);

  useEffect(() => {
    fetch(`/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(console.error);
  }, []);

  let myRankItem = null;
  let myRankIndex = -1;
  const topPlayers = leaderboard.map((user, index) => {
      const isMe = currentUser?.id === user.id;
      if (isMe) {
          myRankItem = user;
          myRankIndex = index + 1;
      }
      return {
          id: user.id,
          rank: index + 1,
          username: user.username,
          assets: user.properties_owned,
          geoPerDay: parseFloat((user.geo_balance || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 }),
          seed: user.username,
          bgColor: bgColors[index % bgColors.length],
          rankBg: rankColors[index] || "#CBD5E1",
          cardBorder: borderColors[index] || "border-slate-100",
          isYou: isMe
      };
  });

  // Only show top 20
  const displayedPlayers = topPlayers.slice(0, 20);
  const amInTop20 = myRankIndex !== -1 && myRankIndex <= 20;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#FFFFFF", fontFamily: "'Nunito', sans-serif" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#E0F2FE", zIndex: 0 }}>
        <div className="absolute w-full h-full opacity-40" style={{ backgroundImage: "linear-gradient(#bae6fd 2px, transparent 2px), linear-gradient(90deg, #bae6fd 2px, transparent 2px)", backgroundSize: "50px 50px" }} />
        <div className="absolute bg-green-100 rounded-[100%] blur-sm opacity-60" style={{ width: "120%", height: "60%", top: "40%", left: "-10%" }} />
      </div>

      {/* Header */}
      <div className="px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-6 bg-white/80 backdrop-blur-md border-b-2 border-slate-100" style={{ position: "relative", zIndex: 10 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">LEADERBOARD</h1>
          <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
            <i className="ph-fill ph-trophy text-yellow-500" />
            <span className="font-black text-yellow-700 text-xs">SEASON 1</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"}`}
              style={activeTab === tab ? { boxShadow: "0 6px 0 #15803D" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-3 pb-[calc(8rem+env(safe-area-inset-bottom))]" style={{ position: "relative", zIndex: 10 }}>
        
        {displayedPlayers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-bold uppercase text-sm">Loading Rankings...</div>
        ) : (
            displayedPlayers.map((item) => (
              <LeaderboardRow key={item.id} {...item} />
            ))
        )}

        {/* Current user pinned to bottom if not in top 20 */}
        {!amInTop20 && currentUser && myRankItem && (
            <>
                {/* Dots separator */}
                <div className="py-2 flex justify-center opacity-30">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
                <LeaderboardRow 
                    rank={myRankIndex} 
                    username={myRankItem.username} 
                    assets={myRankItem.properties_owned} 
                    geoPerDay={parseFloat((myRankItem.geo_balance || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                    seed={myRankItem.username} 
                    bgColor="38BDF8" 
                    rankBg="#1e293b" 
                    cardBorder="border-green-500" 
                    isYou 
                />
            </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="relative z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default LeaderboardScreen;
