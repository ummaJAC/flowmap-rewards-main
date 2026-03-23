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
  mapGrid: {
    backgroundImage: 'linear-gradient(#bae6fd 2px, transparent 2px), linear-gradient(90deg, #bae6fd 2px, transparent 2px)',
    backgroundSize: '60px 60px',
    transform: 'skewY(-10deg) scale(1.2)',
    position: 'absolute',
    inset: '-20%',
  },
  districtOverlay: {
    mixBlendMode: 'multiply',
    opacity: 0.15,
  },
  bottomPanel: {
    boxShadow: '0 -20px 40px rgba(0,0,0,0.1)',
  },
};

const MapPin = ({ top, left, right, delay, bgColor, icon, label }) => {
  return (
    <div
      className="absolute z-20"
      style={{
        top,
        left,
        right,
        animation: `float-pin 3s ease-in-out infinite`,
        animationDelay: delay || '0s',
      }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="text-white p-2 rounded-xl border-2 border-white"
          style={{
            backgroundColor: bgColor,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          <i className={`ph-fill ${icon} text-xl`}></i>
        </div>
        <div
          className="w-2 h-4 bg-white"
          style={{
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            marginTop: '-2px',
          }}
        ></div>
      </div>
    </div>
  );
};

const LocationCard = ({ icon, iconBg, name, distance, street, reward }) => (
  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
      style={{ backgroundColor: iconBg }}
    >
      <i className={`ph-fill ${icon} text-white text-2xl`}></i>
    </div>
    <div className="flex-1">
      <div className="text-slate-800 font-black">{name}</div>
      <div className="text-slate-400 text-xs font-bold">
        {distance} • {street}
      </div>
    </div>
    <div className="text-right">
      <div className="font-black text-lg" style={{ color: '#22C55E' }}>
        +{reward}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase">GEO / DAY</div>
    </div>
  </div>
);

const MapBackground = () => (
  <div className="absolute inset-0" style={{ backgroundColor: '#E0F2FE' }}>
    <div style={{ ...customStyles.mapGrid, opacity: 0.3 }}></div>

    <div
      className="absolute rounded-[40%] rotate-12"
      style={{
        ...customStyles.districtOverlay,
        top: '10%',
        left: '-20%',
        width: '80%',
        height: '40%',
        backgroundColor: '#22C55E',
      }}
    ></div>
    <div
      className="absolute rounded-[30%] -rotate-12"
      style={{
        ...customStyles.districtOverlay,
        top: '40%',
        right: '-10%',
        width: '70%',
        height: '30%',
        backgroundColor: '#38BDF8',
      }}
    ></div>

    <div
      className="absolute"
      style={{
        width: '64px',
        height: '96px',
        top: '15%',
        left: '20%',
        backgroundColor: '#cbd5e1',
        border: '2px solid #94a3b8',
        borderRadius: '4px',
      }}
    ></div>
    <div
      className="absolute"
      style={{
        width: '80px',
        height: '64px',
        top: '35%',
        right: '25%',
        backgroundColor: '#cbd5e1',
        border: '2px solid #94a3b8',
        borderRadius: '4px',
      }}
    ></div>
    <div
      className="absolute"
      style={{
        width: '48px',
        height: '128px',
        top: '55%',
        left: '15%',
        backgroundColor: '#cbd5e1',
        border: '2px solid #94a3b8',
        borderRadius: '4px',
      }}
    ></div>
    <div
      className="absolute"
      style={{
        width: '96px',
        height: '80px',
        top: '48%',
        left: '45%',
        backgroundColor: '#cbd5e1',
        border: '2px solid #94a3b8',
        borderRadius: '4px',
      }}
    ></div>

    <MapPin top="18%" left="23%" bgColor="#22C55E" icon="ph-coffee" delay="0s" />
    <MapPin top="38%" right="28%" bgColor="#38BDF8" icon="ph-shopping-cart" delay="0.5s" />
    <MapPin top="52%" left="52%" bgColor="#FACC15" icon="ph-star" delay="1.2s" />
  </div>
);

const Header = () => (
  <div className="absolute top-8 left-5 right-5 flex justify-between items-start z-30">
    <div className="flex items-center bg-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-100">
      <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden" style={{ backgroundColor: '#38BDF8' }}>
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=38BDF8"
          alt="Avatar"
          className="w-full h-full"
        />
      </div>
      <div className="ml-2">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Level 12</div>
        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="w-[70%] h-full rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-100">
      <i className="ph-fill ph-coins text-lg" style={{ color: '#FACC15' }}></i>
      <span className="font-black text-slate-800 text-sm">
        1,450 <span className="text-slate-400 font-bold ml-0.5">GEO</span>
      </span>
    </div>
  </div>
);

const SearchBar = () => (
  <div className="absolute top-24 left-5 right-5 z-30">
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white flex items-center gap-3">
      <i className="ph-bold ph-magnifying-glass text-slate-400 text-xl"></i>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#22C55E' }}>
          Current Location
        </div>
        <div className="text-slate-800 font-bold">5th Avenue District</div>
      </div>
    </div>
  </div>
);

const BottomPanel = ({ activeTab, setActiveTab }) => (
  <div
    className="absolute bottom-0 left-0 w-full bg-white rounded-t-[40px] z-40 px-6 pt-3 pb-8"
    style={customStyles.bottomPanel}
  >
    <div className="w-12 h-1.5 bg-gray-200 rounded-full self-center mx-auto mb-6"></div>

    <div className="flex justify-between items-end mb-4">
      <h3 className="text-xl font-black text-slate-800">NEARBY TO CLAIM</h3>
      <span className="font-bold text-sm" style={{ color: '#22C55E' }}>
        View All
      </span>
    </div>

    <div className="space-y-3">
      <LocationCard
        icon="ph-coffee"
        iconBg="#22C55E"
        name="Starbucks Coffee"
        distance="0.2 mi"
        street="5th Ave"
        reward="50"
      />
      <LocationCard
        icon="ph-shopping-bag"
        iconBg="#38BDF8"
        name="Apple Store"
        distance="0.4 mi"
        street="Broadway"
        reward="120"
      />
    </div>

    <div className="mt-8 bg-slate-100/50 rounded-full p-2 flex justify-between items-center">
      <button
        className="flex-1 flex flex-col items-center py-1"
        style={{ color: activeTab === 'home' ? '#22C55E' : '#94a3b8' }}
        onClick={() => setActiveTab('home')}
      >
        <i className="ph-fill ph-house text-2xl"></i>
        {activeTab === 'home' && (
          <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#22C55E' }}></div>
        )}
      </button>
      <button
        className="flex-1 flex flex-col items-center py-1"
        style={{ color: activeTab === 'map' ? '#22C55E' : '#94a3b8' }}
        onClick={() => setActiveTab('map')}
      >
        <i className="ph-fill ph-map-trifold text-2xl"></i>
        {activeTab === 'map' && (
          <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#22C55E' }}></div>
        )}
      </button>
      <div
        className="w-16 h-16 rounded-full -mt-12 border-4 border-white shadow-xl flex items-center justify-center text-white"
        style={{ backgroundColor: '#22C55E' }}
      >
        <i className="ph-bold ph-plus text-3xl"></i>
      </div>
      <button
        className="flex-1 flex flex-col items-center py-1"
        style={{ color: activeTab === 'buildings' ? '#22C55E' : '#94a3b8' }}
        onClick={() => setActiveTab('buildings')}
      >
        <i className="ph-fill ph-buildings text-2xl"></i>
        {activeTab === 'buildings' && (
          <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#22C55E' }}></div>
        )}
      </button>
      <button
        className="flex-1 flex flex-col items-center py-1"
        style={{ color: activeTab === 'profile' ? '#22C55E' : '#94a3b8' }}
        onClick={() => setActiveTab('profile')}
      >
        <i className="ph-fill ph-user-circle text-2xl"></i>
        {activeTab === 'profile' && (
          <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#22C55E' }}></div>
        )}
      </button>
    </div>
  </div>
);

const MapPage = () => {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div style={customStyles.appContainer} className="rounded-[20px]">
      <MapBackground />
      <Header />
      <SearchBar />
      <BottomPanel activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      body {
        font-family: 'Nunito', sans-serif;
        background-color: #f0fdfa;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
      }
      @keyframes float-pin {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-8px) scale(1.05); }
      }
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0fdfa',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <Routes>
          <Route path="/" element={<MapPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;