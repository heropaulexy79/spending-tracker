"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, Timer } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

export default function UrgeSavingsResolver() {
  const { urges, resolveUrge, loading, plan } = useTracking();
  const [activeUrge, setActiveUrge] = useState<any>(null);

  useEffect(() => {
    if (loading) return;

    // Find first "Delayed" urge older than 24h
    const now = new Date().getTime();
    const delayedUrge = urges.find(u => {
      if (u.action !== "Delayed") return false;
      
      let createdAt: number;
      if (u.createdAt && typeof u.createdAt === "object" && "seconds" in u.createdAt) {
        createdAt = u.createdAt.seconds * 1000;
      } else {
        createdAt = new Date(u.createdAt).getTime();
      }
      
      const hoursPassed = (now - createdAt) / (1000 * 60 * 60);
      return hoursPassed >= 24;
    });

    if (delayedUrge) {
      setActiveUrge(delayedUrge);
    } else {
      setActiveUrge(null);
    }
  }, [urges, loading]);

  if (!activeUrge) return null;

  const handleResolve = async (action: "Resisted" | "Purchased", shouldSave: boolean) => {
    await resolveUrge(activeUrge.id, action, shouldSave);
    setActiveUrge(null);
  };

  return (
    <AnimatePresence>
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="animate-in slide-in-from-bottom-4 duration-700"
      >
        <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Timer className="w-16 h-16 text-emerald-500" />
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Awareness Bonus</p>
            </div>
            <h2 className="text-2xl font-serif text-foreground">You resisted the urge.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              24 hours ago, you paused on buying <span className="font-bold text-foreground">{activeUrge.item}</span>. 
              Would you like to move {plan?.currency || "₦"}{Number(activeUrge.amount).toLocaleString()} into your Growth Goal?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => handleResolve("Resisted", true)}
              className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Yes, Save it!
            </button>
            <button 
              onClick={() => handleResolve("Resisted", false)}
              className="px-6 py-4 bg-background border border-border text-foreground rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              Maybe Later
            </button>
          </div>
          
          <button 
            onClick={() => handleResolve("Resisted", false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
