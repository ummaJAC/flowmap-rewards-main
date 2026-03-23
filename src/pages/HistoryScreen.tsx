import { motion } from "framer-motion";
import { ArrowLeft, Map, Clock, Wallet, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const historyItems = [
  { title: "Blue Bottle Cafe — Storefront", reward: 50, date: "Today, 2:30 PM", status: "approved" },
  { title: "Map New Bike Lane — Rosenthaler", reward: 35, date: "Today, 11:15 AM", status: "approved" },
  { title: "Photograph Street Sign", reward: 15, date: "Yesterday", status: "approved" },
  { title: "Document Road Damage", reward: 80, date: "Mar 5", status: "pending" },
  { title: "Verify Park Bench Install", reward: 25, date: "Mar 4", status: "approved" },
  { title: "Restaurant Entrance Photo", reward: 20, date: "Mar 3", status: "approved" },
];

const HistoryScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <div className="glass-strong">
        <div className="flex items-center gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl surface-2 subtle-border transition-colors hover:bg-[hsl(var(--surface-3))]">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <h1 className="text-[17px] font-semibold text-foreground">Mission History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <div className="space-y-2">
          {historyItems.map((item, i) => (
            <motion.div
              key={i}
              className="p-4 flex items-center justify-between"
              style={{ borderRadius: "4px", background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.date}</p>
              </div>
              <div className="text-right ml-3 shrink-0">
                <p className="font-mono text-[15px] font-extrabold text-primary tracking-tight">+{item.reward}</p>
                <p className={`text-[10px] font-medium mt-0.5 ${item.status === "approved" ? "text-primary" : "text-[hsl(var(--electric-yellow))]"}`}>
                  {item.status === "approved" ? "✓ Verified" : "⏳ Pending"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 glass-strong border-t border-border">
        <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { icon: Map, label: "Map", active: false, route: "/map" },
            { icon: Clock, label: "History", active: true, route: "/history" },
            { icon: Wallet, label: "Wallet", active: false, route: "/wallet" },
            { icon: Store, label: "Store", active: false, route: "/store" },
          ].map((tab) => (
            <button key={tab.label} onClick={() => navigate(tab.route)}
              className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-lg transition-colors"
            >
              <tab.icon size={20} strokeWidth={tab.active ? 2.5 : 1.5} className={tab.active ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[10px] font-medium ${tab.active ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
