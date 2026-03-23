import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const RejectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const business = location.state?.business || null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Ambient red glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(0 72% 55% / 0.06), transparent 65%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-sm px-6"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
      >
        <motion.div
          className="h-[88px] w-[88px] rounded-full bg-destructive flex items-center justify-center mb-7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 250, damping: 18 }}
          style={{ boxShadow: "0 0 40px hsl(0 72% 55% / 0.3), 0 8px 32px hsl(0 72% 55% / 0.15)" }}
        >
          <X size={44} className="text-destructive-foreground" strokeWidth={3} />
        </motion.div>

        <motion.h2 className="text-[24px] font-bold text-foreground mb-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Proof Rejected
        </motion.h2>
        <motion.p className="text-[13px] text-muted-foreground mb-7 text-center leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          AI analysis could not verify this photo matches the mission location.
        </motion.p>

        {/* Reason card — sharp 4px */}
        <motion.div
          className="w-full p-5 relative overflow-hidden"
          style={{ borderRadius: "4px", background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 72% 55% / 0.15)" }}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-[13px] text-foreground leading-relaxed">
              The storefront in your photo does not match the required location.
            </p>
          </div>
        </motion.div>

        <motion.p className="text-[12px] text-destructive mt-4 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Your Trust Score has been reduced by 2%
        </motion.p>

        {/* Try Again */}
        <motion.button
          onClick={() => navigate("/camera", { state: { business } })}
          className="w-full mt-7 py-[15px] text-[15px] font-semibold text-primary transition-all active:scale-[0.98]"
          whileTap={{ scale: 0.97 }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ borderRadius: "20px", border: "1px solid hsl(142 72% 50% / 0.3)" }}
        >
          Retry Mission
        </motion.button>

        <motion.button
          onClick={() => navigate("/map")}
          className="mt-3 text-[13px] text-muted-foreground font-medium hover:text-foreground transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Find Next Mission
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RejectionScreen;
