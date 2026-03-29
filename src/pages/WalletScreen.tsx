import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import useGameStore from "../store/useGameStore";

/* ------------------------------------------------------------------ */
/*  Helper: format a UTC timestamp into relative time                  */
/* ------------------------------------------------------------------ */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr + 'Z').getTime();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Map transaction type → visual style                                */
/* ------------------------------------------------------------------ */
function txStyle(type: string) {
  switch (type) {
    case 'mint':    return { colorBg: '#22C55E', iconClass: 'ph-storefront', label: 'MINTED' };
    case 'yield':   return { colorBg: '#FACC15', iconClass: 'ph-chart-line-up', label: 'YIELD' };
    case 'purchase': return { colorBg: '#38BDF8', iconClass: 'ph-shopping-cart', label: 'PURCHASED' };
    case 'reward':  return { colorBg: '#A855F7', iconClass: 'ph-gift', label: 'REWARD' };
    default:        return { colorBg: '#94A3B8', iconClass: 'ph-swap', label: 'TX' };
  }
}

const WalletScreen = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const user = useGameStore(s => s.user);
  const balance = useGameStore(s => s.balance);
  const transactions = useGameStore(s => s.transactions);
  const fetchTransactions = useGameStore(s => s.fetchTransactions);

  useEffect(() => { fetchTransactions(); }, []);

  const walletAddress = user?.evm_address || "0xGenerating...";
  const shortAddress = walletAddress.length > 20 ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : walletAddress;
  const privateKey = user?.evm_private_key || "Generating...";

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#F0FDF4", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-slate-800">MY WALLET</h1>
          <button
            onClick={() => {
                useGameStore.getState().logout();
                navigate("/");
            }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-red-400 hover:bg-red-50 transition-colors border border-red-100"
          >
            <i className="ph-bold ph-sign-out text-xl" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden card-strong-shadow">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.05)" }} />
          <div className="relative z-10">
            {/* Wallet Address & Email */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-green-700 uppercase">Flow Blockchain</span>
              </div>
              <div className="px-2 py-1 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500">{user?.email || "No Email"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-500 font-mono">{shortAddress}</span>
              <button onClick={() => handleCopy(walletAddress)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100">
                <i className={`ph-bold ${copied ? "ph-check text-green-500" : "ph-copy text-slate-400"} text-sm`} />
              </button>
            </div>

            {/* Private Key Reveal */}
            <div className="flex flex-col gap-1 mb-4 p-2 bg-slate-50 border border-red-100 rounded-xl relative">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-500 uppercase">Private Key</span>
                    <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="text-[10px] text-slate-400 underline">
                        {showPrivateKey ? "Hide" : "Reveal"}
                    </button>
                </div>
                {showPrivateKey && (
                    <div className="text-[9px] font-mono text-slate-600 break-all bg-white border border-slate-200 p-1.5 rounded">{privateKey}</div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Balance</span>
              <i className="ph-fill ph-sparkle text-sm animate-pulse" style={{ color: "#FACC15" }} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="font-black text-xl" style={{ color: "#22C55E" }}>GEO</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 relative z-10">
            <div className="flex-1 relative">
              <button
                disabled
                className="w-full text-slate-400 font-black py-3 rounded-2xl flex items-center justify-center gap-2 bg-slate-100 cursor-not-allowed"
              >
                <i className="ph-bold ph-arrow-up-right" />
                WITHDRAW
              </button>
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-sm border border-white">
                SOON
              </div>
            </div>
            <button
              className="flex-1 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1"
              style={{ backgroundColor: "#22C55E", boxShadow: "0 4px 0 #15803D" }}
            >
              <i className="ph-bold ph-arrows-clockwise" />
              REINVEST
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 overflow-hidden flex flex-col" style={{ boxShadow: "0 -10px 30px -5px rgba(0, 0, 0, 0.05)" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Recent Activity</h3>
          <span className="font-extrabold text-sm text-slate-300">{transactions.length} TX</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <i className="ph-bold ph-receipt text-5xl text-slate-200 mb-3" />
              <p className="font-black text-slate-300 text-sm uppercase">No transactions yet</p>
              <p className="text-xs text-slate-300 font-bold mt-1">Capture businesses to start earning GEO!</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const style = txStyle(tx.type);
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-x-0 top-0 h-3 opacity-80" style={{ backgroundColor: style.colorBg }} />
                    <i className={`ph-fill ${style.iconClass} text-2xl text-slate-300 mt-2`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-slate-800 text-base leading-tight">
                      {tx.business_name || tx.description}
                    </div>
                    <div className="text-slate-400 font-bold text-xs uppercase">
                      {timeAgo(tx.created_at)} • {style.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black ${isPositive ? 'text-green-500' : 'text-slate-400'}`}>
                      {isPositive ? '+' : ''}{tx.amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-black text-slate-300">GEO</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* Settings Sheet */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-end" onClick={() => setShowSettings(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-black text-slate-800 uppercase mb-5">Wallet Settings</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-slate-700 flex-1 break-all">{walletAddress}</p>
                  <button onClick={() => handleCopy(walletAddress)} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-500 border border-slate-200">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <a
                href={`https://evm.flowscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <i className="ph-bold ph-globe text-slate-500 text-xl" />
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-sm">View on Flow Explorer</p>
                    <p className="text-[10px] font-bold text-slate-400">See transactions on-chain</p>
                  </div>
                </div>
                <i className="ph-bold ph-arrow-square-out text-slate-400" />
              </a>
            </div>
            <button
              className="w-full mt-6 bg-slate-100 text-slate-500 py-3 rounded-2xl font-black uppercase hover:bg-slate-200 transition-colors"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletScreen;
