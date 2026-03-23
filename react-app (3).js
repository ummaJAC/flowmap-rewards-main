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
    fontFamily: "'Nunito', sans-serif",
  },
  backgroundGrid: {
    backgroundImage: 'linear-gradient(#bae6fd 2px, transparent 2px), linear-gradient(90deg, #bae6fd 2px, transparent 2px)',
    backgroundSize: '50px 50px',
  },
  gameBtn: {
    boxShadow: '0 6px 0 #15803D',
  },
  rowShadow: {
    boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
  },
};

const leaderboardData = [
  {
    rank: 1,
    username: 'EmpireTycoon',
    assets: 842,
    geoPerDay: '+12,450',
    seed: 'Alex',
    bgColor: '38BDF8',
    borderColor: '#FACC15',
    rankBg: '#FACC15',
    rankTextColor: 'text-white',
    cardBorder: 'border-yellow-400',
  },
  {
    rank: 2,
    username: 'Landlord_X',
    assets: 612,
    geoPerDay: '+9,820',
    seed: 'Jordan',
    bgColor: 'bbf7d0',
    borderColor: '#CBD5E1',
    rankBg: '#CBD5E1',
    rankTextColor: 'text-white',
    cardBorder: 'border-slate-300',
  },
  {
    rank: 3,
    username: 'GeoQueen',
    assets: 580,
    geoPerDay: '+8,910',
    seed: 'Sam',
    bgColor: 'fed7aa',
    borderColor: '#D97706',
    rankBg: '#D97706',
    rankTextColor: 'text-white',
    cardBorder: 'border-amber-600/40',
  },
];

const nearbyData = [
  {
    rank: 43,
    username: 'Casey_Runs',
    assets: 11,
    geoPerDay: '+1,320',
    seed: 'Casey',
    bgColor: 'bae6fd',
    isYou: false,
  },
];

const LeaderboardRow = ({ rank, username, assets, geoPerDay, seed, bgColor, rankBg, cardBorder, animDelay, isYou = false, isNearby = false }) => {
  const cardClass = isYou
    ? 'flex items-center bg-green-50 p-3 rounded-2xl border-2 border-green-500'
    : isNearby
    ? 'flex items-center bg-white p-3 rounded-2xl border-2 border-slate-100'
    : `flex items-center bg-white p-3 rounded-2xl border-2 ${cardBorder}`;

  return (
    <div
      className={cardClass}
      style={{ ...customStyles.rowShadow, animationDelay: animDelay }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full mr-3 border-2 border-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: isYou ? '#1e293b' : isNearby ? '#f1f5f9' : rankBg }}
      >
        <span className={`font-black text-lg ${isNearby ? 'text-slate-400' : 'text-white'} ${rank >= 10 ? 'text-sm' : ''}`}>{rank}</span>
      </div>
      <div className="relative mr-3 flex-shrink-0">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bgColor}`}
          className={`w-12 h-12 rounded-full border-2 ${isYou ? 'border-white' : 'border-slate-100'}`}
          alt="Avatar"
        />
        {isYou && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">
            YOU
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-black text-slate-800 ${isYou ? 'uppercase tracking-tight' : ''}`}>{username}</p>
        <p className={`text-xs font-bold uppercase tracking-wide ${isYou ? 'text-green-700' : 'text-slate-400'}`}>
          {assets} Assets
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-black text-green-500 text-lg leading-none">{geoPerDay}</p>
        <p className="text-[10px] font-bold text-slate-400">GEO / DAY</p>
      </div>
    </div>
  );
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('Global');
  const tabs = ['Global', 'Friends', 'Local'];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      .leaderboard-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      .leaderboard-scroll::-webkit-scrollbar { display: none; }
      @keyframes slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0fdfa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div className="rounded-[20px] flex flex-col" style={customStyles.appContainer}>

        {/* Background */}
        <div className="absolute inset-0 bg-[#E0F2FE] overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute w-full h-full opacity-40" style={customStyles.backgroundGrid}></div>
          <div
            className="absolute bg-green-100 rounded-[100%] blur-sm opacity-60"
            style={{ width: '120%', height: '60%', top: '40%', left: '-10%' }}
          ></div>
        </div>

        {/* Header */}
        <div className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-md border-b-2 border-slate-100" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">LEADERBOARD</h1>
            <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FACC15" viewBox="0 0 256 256">
                <path d="M197.58,129.06l-51.61-19.63L126.34,58.17a8,8,0,0,0-14.86.62L93.79,109.43,42.42,129.06a8,8,0,0,0,0,14.91l51.37,19.63,17.69,51.26a8,8,0,0,0,15.14,0l17.69-51.26,51.37-19.63a8,8,0,0,0-.1-14.91Z"/>
              </svg>
              <span className="font-black text-yellow-700 text-xs">SEASON 1</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
                style={activeTab === tab ? customStyles.gameBtn : {}}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div
          className="flex-1 overflow-y-auto leaderboard-scroll px-6 py-4 space-y-3"
          style={{ position: 'relative', zIndex: 10 }}
        >
          {leaderboardData.map((item, index) => (
            <LeaderboardRow
              key={item.rank}
              rank={item.rank}
              username={item.username}
              assets={item.assets}
              geoPerDay={item.geoPerDay}
              seed={item.seed}
              bgColor={item.bgColor}
              rankBg={item.rankBg}
              cardBorder={item.cardBorder}
              animDelay={`${0.1 + index * 0.05}s`}
            />
          ))}

          {/* Dots separator */}
          <div className="py-2 flex justify-center opacity-30">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>

          {/* Current user (YOU) */}
          <LeaderboardRow
            rank={42}
            username="FELIX_02"
            assets={12}
            geoPerDay="+1,450"
            seed="Felix"
            bgColor="38BDF8"
            rankBg="#1e293b"
            cardBorder="border-green-500"
            animDelay="0.25s"
            isYou={true}
          />

          {/* Nearby player */}
          <LeaderboardRow
            rank={43}
            username="Casey_Runs"
            assets={11}
            geoPerDay="+1,320"
            seed="Casey"
            bgColor="bae6fd"
            rankBg="#f1f5f9"
            cardBorder="border-slate-100"
            animDelay="0.3s"
            isNearby={true}
          />
        </div>

        {/* Bottom Nav */}
        <div className="px-6 py-6 bg-white border-t-2 border-slate-100" style={{ zIndex: 20 }}>
          <div className="bg-slate-50 rounded-[2rem] p-2 flex justify-between items-center shadow-inner">
            <button className="flex-1 flex flex-col items-center py-2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.44L28.06,50.62A8,8,0,0,0,22,58.38V208a8,8,0,0,0,9.92,7.76l61.13-15.28,61.35,30.68a8.15,8.15,0,0,0,3.6.84,8,8,0,0,0,1.92-.24l66-16.52A8,8,0,0,0,232,207V56A8,8,0,0,0,228.92,49.69ZM96,176.43,38,191.57V65.43l58-14.5Zm64,15.14L160,160.5V79.57l16,8V176.43c0,.33,0,.66,0,1l-16,4ZM216,198.57l-40,10V80.69l40-8Z"/>
              </svg>
              <span className="text-[10px] font-black uppercase">Map</span>
            </button>
            <div className="w-16 h-16 bg-green-500 rounded-full -mt-10 border-4 border-white flex items-center justify-center shadow-lg cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
              </svg>
            </div>
            <button className="flex-1 flex flex-col items-center py-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232,216H208V56a16,16,0,0,0-16-16H160a16,16,0,0,0-16,16V216H112V120a16,16,0,0,0-16-16H64a16,16,0,0,0-16,16V216H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM64,120h32V216H64Zm96-64h32V216H160Z"/>
              </svg>
              <span className="text-[10px] font-black uppercase">Ranks</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
};

export default App;