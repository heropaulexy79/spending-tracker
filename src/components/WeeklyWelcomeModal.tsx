"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { getWeekKey } from "@/lib/dateUtils";

export default function WeeklyWelcomeModal({ previousStreak = 0 }: { previousStreak?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only run on client
    const currentWeekKey = getWeekKey();
    const isMonday = new Date().getDay() === 1;
    
    if (isMonday) {
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${currentWeekKey}`);
      if (!hasSeenWelcome) {
        setIsOpen(true);
        localStorage.setItem(`welcome_seen_${currentWeekKey}`, "true");
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          className="w-full max-w-lg bg-background border border-primary/20 rounded-[2rem] overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>
          
          <div className="flex items-center justify-between p-6 border-b border-primary/10 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Monday Welcome</p>
              <h2 className="text-2xl font-serif">Happy New Week</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-6 relative z-10 text-center">
            <div className="space-y-2">
              <p className="text-lg font-serif">Log your spending. Track your urges.</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Keep discovering your spending patterns. Keep growing.
              </p>
            </div>
            
            {previousStreak > 0 && (
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <p className="text-sm font-bold text-primary">
                  🔥 You carried over a {previousStreak}-day streak!
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-4 mt-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Start this week's story
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
