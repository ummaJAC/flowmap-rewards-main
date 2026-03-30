import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  appContainer: {
    width: '400px',
    height: '867px',
    backgroundColor: '#F0FDF4',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  },
  cardShadow: {
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
  },
  gameBtnShadow: {
    boxShadow: '0 4px 0 #15803D',
  },
  bottomShadow: {
    boxShadow: '0 -10px 30px -5px rgba(0, 0, 0, 0.05)',
  },
};

const ActivityItem = ({ colorClass, iconClass, title, subtitle, amount, amountColor }) => {
  const colorMap = {
    'bg-brand-green': '#22C55E',
    'bg-brand-blue': '#38BDF8',
    'bg-brand-yellow': '#FACC15',
  };
  const amountColorMap = {
    'text-brand-green': '#22C55E',
    'text-slate-400': '#94a3b8',
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden" style={{ flexShrink: 0 }}>
        <div className="absolute inset-x-0 top-0 h-3 opacity-80" style={{ backgroundColor: colorMap[colorClass] }}></div>
        <i className={`ph-fill ${iconClass} text-2xl text-slate-300 mt-2`}></i>
      </div>
      <div className="flex-1">
        <div className="font-extrabold text-slate-800 text-base leading-tight">{title}</div>
        <div className="text-slate-400 font-bold text-xs uppercase">{subtitle}</div>
      </div>
      <div className="text-right">
        <div className="font-black" style={{ color: amountColorMap[amountColor] }}>{amount}</div>
        <div className="text-[10px] font-black text-slate-300">GEO</div>
      </div>
    </div>
  );
};

const NavButton = ({ iconClass, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}
  >
    <i className={`ph-fill ${iconClass} text-xl`}></i>
  </button>
);

const WalletPage = () => {
  const [activeNav, setActiveNav] = useState('wallet');
  const [withdrawPressed, setWithdrawPressed] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      .animate-float { animation: float 4s ease-in-out infinite; }
      .custom-scrollbar::-webkit-scrollbar { width: 0px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const activities = [
    {
      colorClass: 'bg-brand-green',
      iconClass: 'ph-storefront',
      title: 'Starbucks Yield',
      subtitle: '2 hours ago • Minted',
      amount: '+50.00',
      amountColor: 'text-brand-green',
    },
    {
      colorClass: 'bg-brand-blue',
      iconClass: 'ph-buildings',
      title: 'Central Mall Mint',
      subtitle: 'Yesterday • Asset',
      amount: '-850.00',
      amountColor: 'text-slate-400',
    },
    {
      colorClass: 'bg-brand-yellow',
      iconClass: 'ph-coffee',
      title: 'Blue Bottle Yield',
      subtitle: 'Oct 24 • Minted',
      amount: '+24.50',
      amountColor: 'text-brand-green',
    },
    {
      colorClass: 'bg-brand-green',
      iconClass: 'ph-house-line',
      title: 'Apartment #42',
      subtitle: 'Oct 23 • Minted',
      amount: '+12.00',
      amountColor: 'text-brand-green',
    },
  ];

  const extraActivities = [
    {
      colorClass: 'bg-brand-blue',
      iconClass: 'ph-building-office',
      title: 'Office Tower Yield',
      subtitle: 'Oct 22 • Minted',
      amount: '+30.00',
      amountColor: 'text-brand-green',
    },
    {
      colorClass: 'bg-brand-yellow',
      iconClass: 'ph-storefront',
      title: 'Nike Store Yield',
      subtitle: 'Oct 21 • Minted',
      amount: '+18.75',
      amountColor: 'text-brand-green',
    },
  ];

  const displayedActivities = viewAll ? [...activities, ...extraActivities] : activities;

  return (
    <div
      className="rounded-[20px] flex flex-col"
      style={{ ...customStyles.appContainer, fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-slate-800">MY WALLET</h1>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:bg-slate-50 transition-colors">
            <i className="ph-bold ph-gear-six text-xl"></i>
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden" style={customStyles.cardShadow}>
          <div
            className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.05)' }}
          ></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Balance</span>
              <i className="ph-fill ph-sparkle text-sm animate-pulse" style={{ color: '#FACC15' }}></i>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">12,450</span>
              <span className="font-black text-xl" style={{ color: '#22C55E' }}>GEO</span>
            </div>
            <div className="mt-2 text-slate-400 font-bold text-sm">≈ $432.25 USD</div>
          </div>

          <div className="flex gap-3 mt-6 relative z-10">
            <button
              onMouseDown={() => setWithdrawPressed(true)}
              onMouseUp={() => setWithdrawPressed(false)}
              onMouseLeave={() => setWithdrawPressed(false)}
              className="flex-1 text-white font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#22C55E',
                boxShadow: withdrawPressed ? '0 0px 0 #15803D' : '0 4px 0 #15803D',
                transform: withdrawPressed ? 'translateY(4px)' : 'translateY(0)',
              }}
            >
              <i className="ph-bold ph-arrow-up-right"></i>
              WITHDRAW
            </button>
            <button className="flex-1 bg-white border-2 border-slate-100 font-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors" style={{ color: '#22C55E' }}>
              <i className="ph-bold ph-arrows-clockwise"></i>
              REINVEST
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div
        className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 overflow-hidden flex flex-col"
        style={customStyles.bottomShadow}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Recent Activity</h3>
          <button
            onClick={() => setViewAll(!viewAll)}
            className="font-extrabold text-sm transition-opacity hover:opacity-70"
            style={{ color: '#38BDF8' }}
          >
            {viewAll ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-20">
          {displayedActivities.map((item, index) => (
            <ActivityItem key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6"
        style={{ background: 'linear-gradient(to top, white, white, transparent)' }}
      >
        <div
          className="rounded-full p-2 flex justify-between items-center shadow-lg"
          style={{ backgroundColor: '#0F172A' }}
        >
          <NavButton
            iconClass="ph-map-trifold"
            isActive={activeNav === 'map'}
            onClick={() => setActiveNav('map')}
          />
          <NavButton
            iconClass="ph-storefront"
            isActive={activeNav === 'store'}
            onClick={() => setActiveNav('store')}
          />
          <button
            onClick={() => setActiveNav('wallet')}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 transition-transform hover:scale-105"
            style={{
              backgroundColor: '#22C55E',
              borderColor: '#F0FDF4',
            }}
          >
            <i className="ph-fill ph-wallet text-2xl"></i>
          </button>
          <NavButton
            iconClass="ph-users-three"
            isActive={activeNav === 'users'}
            onClick={() => setActiveNav('users')}
          />
          <NavButton
            iconClass="ph-trophy"
            isActive={activeNav === 'trophy'}
            onClick={() => setActiveNav('trophy')}
          />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <div
        style={{
          fontFamily: "'Nunito', sans-serif",
          backgroundColor: '#f8fafc',
          margin: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<WalletPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;