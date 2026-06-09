"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, Timer, CheckCircle2 } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

export default function UrgeSavingsResolver() {
  const { urges, resolveUrge, loading, plan } = useTracking();
  const [activeUrge, setActiveUrge] = useState<any>(null);
  const [step, setStep] = useState<"initial" | "purchased_feedback" | "success">("initial");
  
  // Feedback state
  const [trigger, setTrigger] = useState("");
  const [feeling, setFeeling] = useState("");
  const [timing, setTiming] = useState(""); // When did they buy
  const [set7DayCheck, setSet7DayCheck] = useState(false);

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
    if (action === "Purchased" && step === "initial") {
      setStep("purchased_feedback");
      return;
    }

    const followUpData = action === "Purchased" ? {
      purchaseTrigger: trigger,
      purchaseFeeling: feeling,
      purchaseTiming: timing,
      sevenDayReEval: set7DayCheck
    } : {};

    await resolveUrge(activeUrge.id, action, shouldSave, followUpData);
    setStep("success");
    setTimeout(() => {
      setActiveUrge(null);
      setStep("initial");
    }, 3000);
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

          <AnimatePresence mode="wait">
            {step === "initial" && (
              <motion.div 
                key="initial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Awareness Bonus</p>
                  </div>
                  <h2 className="text-2xl font-serif text-foreground">You paused.</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24 hours ago, you paused on buying <span className="font-bold text-foreground">{activeUrge.item}</span>. 
                    Did you resist or did you buy?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleResolve("Resisted", true)}
                    className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> I Resisted!
                  </button>
                  <button 
                    onClick={() => handleResolve("Purchased", false)}
                    className="px-6 py-4 bg-background border border-border text-foreground rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> I Bought it
                  </button>
                </div>
              </motion.div>
            )}

            {step === "purchased_feedback" && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif text-foreground">It&apos;s okay.</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    By buying, you missed a chance to save <span className="text-coral-300 font-bold">{plan?.currency || "₦"}{Number(activeUrge.amount).toLocaleString()}</span>. 
                    Let&apos;s learn from this.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">When did you buy it?</p>
                    <select 
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl p-3 text-xs outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Select Timing</option>
                      <option value="Almost immediately">Almost immediately</option>
                      <option value="A few hours later">A few hours later</option>
                      <option value="This morning">This morning</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">What finally triggered it?</p>
                    <input 
                      placeholder="e.g. Stress at work, social media ad..."
                      value={trigger}
                      onChange={(e) => setTrigger(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl p-3 text-xs outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">How do you feel after buying?</p>
                    <div className="flex gap-2">
                      {["Regret", "Satisfied", "Guilty", "Neutral"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFeeling(f)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border",
                            feeling === f ? "bg-emerald-500 border-emerald-500 text-white" : "bg-background border-border text-muted-foreground"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSet7DayCheck(!set7DayCheck)}
                    className={cn(
                      "w-full py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                      set7DayCheck ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-background border-border text-muted-foreground"
                    )}
                  >
                    {set7DayCheck ? <CheckCircle2 className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                    Ask me in 7 days if it was a need
                  </button>

                  <button 
                    onClick={() => handleResolve("Purchased", false)}
                    className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    Finish Reflection
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-serif text-foreground">Awareness Logged.</h2>
                <p className="text-xs text-muted-foreground">Every choice is a lesson. See you tomorrow.</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setActiveUrge(null)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
