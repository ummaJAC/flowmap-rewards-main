import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  Level System Utilities                                             */
/* ------------------------------------------------------------------ */
export const getPlayerLevelStats = (businessCount: number) => {
  const levels = [
    { target: 0, level: 1 },
    { target: 10, level: 2 },
    { target: 25, level: 3 },
    { target: 50, level: 4 },
    { target: 100, level: 5 },
    { target: 200, level: 6 },
    { target: 400, level: 7 },
    { target: 800, level: 8 },
  ];

  let currentLevel = 1;
  let nextTarget = 10;
  let prevTarget = 0;

  for (let i = 0; i < levels.length; i++) {
    if (businessCount >= levels[i].target) {
      currentLevel = levels[i].level;
      prevTarget = levels[i].target;
      nextTarget = levels[i + 1] ? levels[i + 1].target : levels[i].target;
    } else {
      break;
    }
  }

  const isMaxed = currentLevel === levels[levels.length - 1].level;
  const progressPercent = isMaxed 
    ? 100 
    : Math.min(100, Math.max(0, ((businessCount - prevTarget) / (nextTarget - prevTarget)) * 100));

  return {
    level: currentLevel,
    nextTarget: isMaxed ? 'Max' : nextTarget,
    progressPercent: progressPercent
  };
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface OwnedLocation {
  id: string;
  name: string;
  category: string;
  icon: string;
  tier: 'easy' | 'medium' | 'hard';
  reward: number;      
  dailyYield: number;  
  lat: number;
  lng: number;
  capturedAt: number;  
  txHash?: string;     
  ipfsUri?: string;    
}

export interface User {
  id: number;
  email: string;
  username: string;
  evm_address: string;
  evm_private_key?: string; // Only for MVP display
  energy: number;
}

export interface Transaction {
  id: number;
  type: 'mint' | 'yield' | 'purchase' | 'reward';
  amount: number;
  description: string;
  business_name?: string;
  created_at: string;
}

interface GameState {
  // --- Auth ---
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;

  // --- Owned locations ---
  ownedLocations: OwnedLocation[];
  addOwnedLocation: (loc: OwnedLocation) => void;
  isOwned: (locationId: string) => boolean;

  // --- Balance ---
  balance: number;
  addBalance: (amount: number) => void;

  // --- Transactions ---
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;

  // --- Daily reward ---
  lastDailyClaimTimestamp: number;
  claimDailyReward: () => number;

  // --- Stats ---
  totalEarned: number;
  totalCaptures: number;

  // --- Sync flags ---
  _isSyncing: boolean;
  _capturePending: number;

  // --- Map Settings ---
  lastKnownLocation: { lat: number; lng: number } | null;
  setLastKnownLocation: (lat: number, lng: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Store (persisted to localStorage)                                  */
/* ------------------------------------------------------------------ */
const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      ownedLocations: [],
      balance: 0,
      totalEarned: 0,
      totalCaptures: 0,
      lastDailyClaimTimestamp: 0,
      transactions: [],
      _isSyncing: false,
      _capturePending: 0,
      lastKnownLocation: null,

      login: (token, user) => {
        set({ token, user });
        get().fetchProfile();
      },

      logout: () => {
        set({ user: null, token: null, ownedLocations: [], balance: 0, totalEarned: 0, totalCaptures: 0, transactions: [], lastKnownLocation: null });
      },

      setLastKnownLocation: (lat, lng) => set({ lastKnownLocation: { lat, lng } }),

      fetchProfile: async () => {
        const { token, _isSyncing, _capturePending } = get();
        if (!token || _isSyncing || _capturePending > 0) return;
        set({ _isSyncing: true });
        try {
          const res = await fetch(`/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({
              user: data.user,
              ownedLocations: data.businesses.map((b: any) => {
                // Map category string to correct emoji icon
                const categoryIconMap: Record<string, string> = {
                  'Café': '☕', 'cafe': '☕', 'coffee': '☕', 'Bakery': '🥐', 'bakery': '🥐',
                  'Restaurant': '🍽', 'restaurant': '🍽', 'Pizzeria': '🍕',
                  'Bar': '🍺', 'bar': '🍺', 'Fast Food': '🍔',
                  'Ice Cream': '🍦', 'Grocery': '🛒', 'grocery': '🛒',
                  'Store': '🏪', 'Pharmacy': '💊', 'pharmacy': '💊',
                  'Shop': '🛍', 'shop': '🛍', 'Fashion': '👕', 'Shoes': '👟',
                  'Optician': '👓', 'Jewelry': '💎', 'Dept Store': '🏬',
                  'Hotel': '🏨', 'hotel': '🏨', 'lodging': '🏨',
                  'Cinema': '🎬', 'Theatre': '🎭', 'Entertainment': '🎭',
                  'Gym': '🏋', 'Fitness': '🏋',
                  'Hospital': '🏥', 'Medical': '🏥', 'medical': '🏥',
                  'Bank': '🏦', 'bank': '🏦',
                  'University': '🎓', 'education': '🎓',
                  'Museum': '🏛', 'Embassy': '🏛', 'Stadium': '🏟',
                  'Airport': '✈️', 'Auto': '🚗', 'Car Rental': '🚗',
                  'Gas Station': '⛽', 'Services': '🏢', 'Business': '📍',
                  'Seafood': '🐟',
                };
                const icon = categoryIconMap[b.category] || '📍';
                return {
                  id: `${b.name}-${parseFloat(b.lng).toFixed(4)}-${parseFloat(b.lat).toFixed(4)}`,
                  name: b.name,
                  category: b.category,
                  icon,
                  tier: b.yield_rate > 5 ? 'hard' : b.yield_rate > 2 ? 'medium' : 'easy' as const,
                  reward: 0,
                  dailyYield: b.yield_rate,
                  lat: b.lat,
                  lng: b.lng,
                  capturedAt: new Date(b.created_at).getTime(),
                  ipfsUri: b.image_cid ? `ipfs://${b.image_cid}` : undefined,
                };
              }),
              balance: data.user.balance,
              totalCaptures: data.metrics.propertiesOwned,
              totalEarned: data.user.balance,
              _isSyncing: false,
            });
            // Also fetch latest transactions
            get().fetchTransactions();
          } else {
            set({ _isSyncing: false });
            if (res.status === 401) get().logout();
          }
        } catch (err) {
          set({ _isSyncing: false });
          console.error("Failed to fetch profile:", err);
        }
      },

      addOwnedLocation: async (loc) => {
        const state = get();
        if (state.ownedLocations.some(l => l.id === loc.id)) return;

        // Mark capture as pending (blocks fetchProfile from overwriting)
        set(s => ({ _capturePending: s._capturePending + 1 }));

        // Optimistic UI update
        set({
          ownedLocations: [...state.ownedLocations, loc],
          balance: state.balance + loc.reward,
          totalEarned: state.totalEarned + loc.reward,
          totalCaptures: state.totalCaptures + 1,
        });

        // Persist to backend
        const { token } = get();
        if (token) {
          try {
            const res = await fetch(`/api/capture`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                lat: loc.lat,
                lng: loc.lng,
                name: loc.name,
                category: loc.category,
                reward: loc.reward,
                txHash: loc.txHash,
                ipfsCid: loc.ipfsUri?.replace('ipfs://', '')
              })
            });
            if (res.ok) {
              const data = await res.json();
              // Sync backend balance
              set({ balance: data.newBalance });
              // Refresh transactions
              get().fetchTransactions();
            } else {
              console.error("Capture API returned error:", res.status, await res.text());
            }
          } catch (err) {
            console.error("Failed to persist capture:", err);
          }
        }

        // Unmark capture pending, then re-sync from backend
        set(s => ({ _capturePending: s._capturePending - 1 }));
        // Fetch fresh profile data now that capture is persisted
        setTimeout(() => get().fetchProfile(), 500);
      },

      isOwned: (locationId) => {
        const locs = get().ownedLocations;
        const idLower = locationId.toLowerCase();
        return locs.some(l => 
          l.id === locationId || 
          l.name.toLowerCase() === idLower ||
          idLower.startsWith(l.name.toLowerCase())
        );
      },

      addBalance: (amount) => {
        set(s => ({
          balance: s.balance + amount,
          totalEarned: s.totalEarned + amount,
        }));
      },

      fetchTransactions: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`/api/transactions?limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const txs = await res.json();
            set({ transactions: txs });
          }
        } catch (err) {
          console.error("Failed to fetch transactions:", err);
        }
      },

      claimDailyReward: () => {
        const state = get();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (now - state.lastDailyClaimTimestamp < oneDayMs) return 0;

        const dailyTotal = state.ownedLocations.reduce((sum, loc) => sum + loc.dailyYield, 0);
        if (dailyTotal === 0) return 0;

        set({
          balance: state.balance + dailyTotal,
          totalEarned: state.totalEarned + dailyTotal,
          lastDailyClaimTimestamp: now,
        });
        return dailyTotal;
      },
    }),
    {
      name: 'geocorp-game-state',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        balance: state.balance,
        ownedLocations: state.ownedLocations,
        totalEarned: state.totalEarned,
        totalCaptures: state.totalCaptures,
        lastDailyClaimTimestamp: state.lastDailyClaimTimestamp,
        lastKnownLocation: state.lastKnownLocation,
      }),
    }
  )
);

// Auto-fetch profile on app load when a token exists in localStorage
// This runs once after the store is created and rehydrated
setTimeout(() => {
  const { token } = useGameStore.getState();
  if (token) {
    useGameStore.getState().fetchProfile();
  }
}, 800);

export default useGameStore;
