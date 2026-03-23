import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  appContainer: {
    width: '400px',
    height: '867px',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  body: {
    fontFamily: "'Nunito', sans-serif",
    backgroundColor: '#f0fdfa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    margin: 0,
  },
  awningGreen: {
    background: 'repeating-linear-gradient(90deg, #22C55E, #22C55E 10px, #16A34A 10px, #16A34A 20px)',
  },
  awningBlue: {
    background: 'repeating-linear-gradient(90deg, #38BDF8, #38BDF8 10px, #0EA5E9 10px, #0EA5E9 20px)',
  },
  awningYellow: {
    background: 'repeating-linear-gradient(90deg, #FACC15, #FACC15 10px, #EAB308 10px, #EAB308 20px)',
  },
  scrollbarHide: {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  gradientCard: {
    background: 'linear-gradient(135deg, #22C55E, #059669)',
  },
  gameBtnShadow: {
    boxShadow: '0 4px 0 #15803D',
  },
  cardSoftShadow: {
    boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
  },
};

const AssetCard = ({ bgColor, children, badge, name, location, onDetails }) => (
  <div className="bg-white rounded-[24px] p-3 border border-slate-100 flex flex-col items-center" style={customStyles.cardSoftShadow}>
    <div className={`w-full h-28 ${bgColor} rounded-xl mb-3 flex items-center justify-center relative overflow-hidden`}>
      {children}
      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
        +{badge}
      </div>
    </div>
    <p className="font-black text-slate-800 text-sm uppercase">{name}</p>
    <p className="text-[10px] text-slate-400 font-bold mb-2">{location}</p>
    <button
      className="w-full bg-slate-50 py-2 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
      onClick={onDetails}
    >
      Details
    </button>
  </div>
);

const StarbucksBuilding = () => (
  <div className="w-20 h-16 bg-white rounded-lg shadow-sm relative flex flex-col items-center">
    <div className="w-[110%] h-4 rounded-t-md absolute -top-1" style={customStyles.awningGreen}></div>
    <div className="mt-5 w-6 h-8 bg-blue-100 rounded-sm"></div>
  </div>
);

const BankBuilding = () => (
  <div className="w-20 h-20 bg-slate-200 rounded-lg shadow-sm relative flex flex-col items-center">
    <div className="w-full h-3 bg-slate-300 rounded-t-lg"></div>
    <div className="mt-4 grid grid-cols-2 gap-1 px-2">
      <div className="w-6 h-6 bg-white/60 rounded-sm"></div>
      <div className="w-6 h-6 bg-white/60 rounded-sm"></div>
    </div>
    <i className="ph-fill ph-bank text-slate-400 text-xl mt-1"></i>
  </div>
);

const HotelBuilding = () => (
  <div className="w-16 h-24 bg-white rounded-lg shadow-sm relative flex flex-col items-center pt-2">
    <div className="w-10 h-2 bg-yellow-400 rounded-full mb-2"></div>
    <div className="grid grid-cols-2 gap-1">
      <div className="w-4 h-4 bg-blue-50 rounded-sm"></div>
      <div className="w-4 h-4 bg-blue-50 rounded-sm"></div>
      <div className="w-4 h-4 bg-blue-50 rounded-sm"></div>
      <div className="w-4 h-4 bg-blue-50 rounded-sm"></div>
    </div>
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    className={`flex flex-col items-center gap-1 cursor-pointer ${active ? 'text-green-500' : 'text-slate-400'}`}
    onClick={onClick}
  >
    <i className={`${icon} text-2xl`}></i>
    <span className="text-[10px] font-black uppercase">{label}</span>
  </div>
);

const DetailsModal = ({ asset, onClose }) => {
  if (!asset) return null;
  return (
    <div
      className="absolute inset-0 bg-black/50 flex items-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-3xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
        <h2 className="text-xl font-black text-slate-800 uppercase mb-1">{asset.name}</h2>
        <p className="text-sm text-slate-400 font-bold mb-4">{asset.location}</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Yield</p>
            <p className="font-extrabold text-green-600">+{asset.badge} GEO</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
            <p className="font-extrabold text-slate-700">Active</p>
          </div>
        </div>
        <button
          className="w-full bg-green-500 text-white py-3 rounded-2xl font-black uppercase tracking-wider hover:bg-green-600 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const BuyModal = ({ onClose }) => (
  <div
    className="absolute inset-0 bg-black/50 flex items-end z-50"
    onClick={onClose}
  >
    <div
      className="bg-white w-full rounded-t-3xl p-6"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
      <h2 className="text-xl font-black text-slate-800 uppercase mb-1">Buy Assets</h2>
      <p className="text-sm text-slate-400 font-bold mb-4">Expand your empire</p>
      <div className="space-y-3 mb-5">
        {[
          { name: 'Pizza Hut', location: 'Broadway', price: 500 },
          { name: 'Tech Hub', location: 'Silicon Alley', price: 1200 },
          { name: 'Luxury Condo', location: 'Upper East', price: 2500 },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
            <div>
              <p className="font-black text-slate-800 text-sm uppercase">{item.name}</p>
              <p className="text-[10px] text-slate-400 font-bold">{item.location}</p>
            </div>
            <button className="bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-green-600 transition-colors">
              {item.price} GEO
            </button>
          </div>
        ))}
      </div>
      <button
        className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl font-black uppercase tracking-wider hover:bg-slate-200 transition-colors"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  </div>
);

const EmpirePage = () => {
  const [activeNav, setActiveNav] = useState('empire');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');

  const assets = [
    { id: 1, name: 'Starbucks', location: '5th Avenue', badge: 50, bgColor: 'bg-blue-50' },
    { id: 2, name: 'City Bank', location: 'Financial Dist.', badge: 120, bgColor: 'bg-slate-50' },
    { id: 3, name: 'Grand Hotel', location: 'Central Park', badge: 250, bgColor: 'bg-yellow-50' },
  ];

  return (
    <div className="rounded-[20px] flex flex-col" style={{ ...customStyles.appContainer }}>
      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MY EMPIRE</h1>
          <div className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <i className="ph ph-gear-six text-slate-500 text-xl"></i>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="rounded-3xl p-5 text-white shadow-lg relative overflow-hidden" style={customStyles.gradientCard}>
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Total Earnings</p>
            <div className="flex items-center gap-2 mb-4">
              <i className="ph-fill ph-sparkle text-yellow-400 text-2xl"></i>
              <span className="text-4xl font-black">
                12,450 <span className="text-lg opacity-70">GEO</span>
              </span>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold opacity-80 uppercase">Daily Yield</p>
                <p className="font-extrabold">+420 GEO</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-2">
                <p className="text-[10px] font-bold opacity-80 uppercase">Assets</p>
                <p className="font-extrabold">12 Owned</p>
              </div>
            </div>
          </div>
          <i className="ph-fill ph-chart-line-up absolute -right-4 -bottom-4 text-white/10 text-9xl transform -rotate-12"></i>
        </div>
      </div>

      {/* Asset Portfolio */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={customStyles.scrollbarHide}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Asset Portfolio</h3>
          <button
            className="flex gap-2 text-xs font-bold text-green-500 items-center hover:text-green-600 transition-colors"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          >
            <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            <i className="ph-bold ph-caret-down"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Starbucks */}
          <AssetCard
            bgColor="bg-blue-50"
            badge={50}
            name="Starbucks"
            location="5th Avenue"
            onDetails={() => setSelectedAsset(assets[0])}
          >
            <StarbucksBuilding />
          </AssetCard>

          {/* City Bank */}
          <AssetCard
            bgColor="bg-slate-50"
            badge={120}
            name="City Bank"
            location="Financial Dist."
            onDetails={() => setSelectedAsset(assets[1])}
          >
            <BankBuilding />
          </AssetCard>

          {/* Grand Hotel */}
          <AssetCard
            bgColor="bg-yellow-50"
            badge={250}
            name="Grand Hotel"
            location="Central Park"
            onDetails={() => setSelectedAsset(assets[2])}
          >
            <HotelBuilding />
          </AssetCard>

          {/* Buy Assets */}
          <div
            className="bg-slate-100 rounded-[24px] p-3 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
            onClick={() => setShowBuyModal(true)}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
              <i className="ph ph-plus text-slate-400 text-2xl font-bold"></i>
            </div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Buy Assets</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-100 px-8 py-6 flex justify-between items-center">
        <NavItem
          icon="ph-fill ph-map-trifold"
          label="Map"
          active={activeNav === 'map'}
          onClick={() => setActiveNav('map')}
        />
        <NavItem
          icon="ph-fill ph-storefront"
          label="Empire"
          active={activeNav === 'empire'}
          onClick={() => setActiveNav('empire')}
        />
        <div
          className="w-14 h-14 bg-green-500 rounded-full -mt-12 flex items-center justify-center border-4 border-white cursor-pointer hover:bg-green-600 transition-colors"
          style={customStyles.gameBtnShadow}
          onClick={() => setActiveNav('explore')}
        >
          <i className="ph-fill ph-navigation-arrow text-white text-2xl"></i>
        </div>
        <NavItem
          icon="ph-fill ph-users-three"
          label="Social"
          active={activeNav === 'social'}
          onClick={() => setActiveNav('social')}
        />
        <NavItem
          icon="ph-fill ph-shopping-cart-simple"
          label="Shop"
          active={activeNav === 'shop'}
          onClick={() => setActiveNav('shop')}
        />
      </div>

      {/* Modals */}
      {selectedAsset && (
        <DetailsModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
      {showBuyModal && (
        <BuyModal onClose={() => setShowBuyModal(false)} />
      )}
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
      .ph, [class^="ph-"], [class*=" ph-"] {
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ fontFamily: "'Nunito', sans-serif", backgroundColor: '#f0fdfa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Routes>
          <Route path="/" element={<EmpirePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;