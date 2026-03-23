import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useGameStore from "./store/useGameStore";

import WelcomeScreen from "./pages/WelcomeScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import MapScreen from "./pages/MapScreen";
import CameraScreen from "./pages/CameraScreen";
import ValidationScreen from "./pages/ValidationScreen";
import RejectionScreen from "./pages/RejectionScreen";
import WalletScreen from "./pages/WalletScreen";
import HistoryScreen from "./pages/HistoryScreen";
import StoreScreen from "./pages/StoreScreen";
import ProfileScreen from "./pages/ProfileScreen";
import LeaderboardScreen from "./pages/LeaderboardScreen";
import DailyRewardsScreen from "./pages/DailyRewardsScreen";
import PropertyDetailScreen from "./pages/PropertyDetailScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Live Balance Updates: fetch profile (and compute passive yield) every 15 seconds
  useEffect(() => {
    const minterval = setInterval(() => {
      const { token, fetchProfile } = useGameStore.getState();
      if (token) {
        fetchProfile();
      }
    }, 15000); // 15 seconds

    return () => clearInterval(minterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/camera" element={<CameraScreen />} />
          <Route path="/validation" element={<ValidationScreen />} />
          <Route path="/rejected" element={<RejectionScreen />} />
          <Route path="/wallet" element={<WalletScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/store" element={<StoreScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/rewards" element={<DailyRewardsScreen />} />
          <Route path="/property/:id" element={<PropertyDetailScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
