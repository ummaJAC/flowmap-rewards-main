import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  className?: string;
}

const navItems = [
  { id: "empire", label: "Empire", iconClass: "ph-fill ph-buildings", route: "/profile" },
  { id: "ranking", label: "Ranking", iconClass: "ph-fill ph-chart-bar", route: "/leaderboard" },
  { id: "map", label: "Map", iconClass: "ph-fill ph-map-trifold", route: "/map", isCenter: true },
  { id: "store", label: "Store", iconClass: "ph-fill ph-shopping-cart-simple", route: "/store" },
  { id: "wallet", label: "Wallet", iconClass: "ph-fill ph-wallet", route: "/wallet" },
];

const routeToId: Record<string, string> = {
  "/profile": "empire",
  "/leaderboard": "ranking",
  "/map": "map",
  "/store": "store",
  "/wallet": "wallet",
};

const BottomNav = ({ className = "" }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = routeToId[location.pathname] || "map";

  return (
    <div className={`bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pb-[env(safe-area-inset-bottom,0.5rem)] pt-2 ${className}`}>
      <div className="flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = activeId === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="flex flex-col items-center -mt-6 relative"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-transform hover:scale-105 ${
                    isActive ? "bg-green-500" : "bg-green-400"
                  }`}
                  style={{ boxShadow: "0 4px 12px rgba(34,197,94,0.4)" }}
                >
                  <i className={`${item.iconClass} text-white text-2xl`} />
                </div>
                <span className={`text-[9px] font-black uppercase mt-1 ${isActive ? "text-green-500" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center py-1.5 px-2 min-w-[52px] transition-colors"
            >
              <i className={`${item.iconClass} text-xl ${isActive ? "text-green-500" : "text-slate-400"}`} />
              <span className={`text-[9px] font-black uppercase mt-0.5 ${isActive ? "text-green-500" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
