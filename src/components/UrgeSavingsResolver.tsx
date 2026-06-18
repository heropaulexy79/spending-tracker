"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, Timer, CheckCircle2, Coins } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function UrgeSavingsResolver() {
  const { urges, resolveUrge, loading, plan } = useTracking();
  const { user } = useAuth();
  const [activeUrge, setActiveUrge] = useState<any>(null);
  const [step, setStep] = useState<"initial" | "save_prompt" | "purchased_feedback" | "success">("initial");
  const [saveAmount, setSaveAmount] = useState("");
  // Track urge IDs handled this session to prevent race-condition re-pop
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Prevent popping up multiple different urges in sequence
  const [hasResolvedThisSession, setHasResolvedThisSession] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("tracker_urge_resolved_session")) {
        setHasResolvedThisSession(true);
      }
    }
  }, []);

  const markSessionResolved = () => {
    setHasResolvedThisSession(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tracker_urge_resolved_session", "true");
    }
  };

  // Safe client-side hydration for localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tracker_dismissed_urges");
        if (saved) {
          setDismissedIds(new Set(JSON.parse(saved)));
        }
      } catch (e) {}
    }
  }, []);

  // Sync dismissedIds to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && dismissedIds.size > 0) {
      localStorage.setItem("tracker_dismissed_urges", JSON.stringify(Array.from(dismissedIds)));
    }
  }, [dismissedIds]);

  // Feedback state
  const [trigger, setTrigger] = useState("");
  const [feeling, setFeeling] = useState("");
  const [timing, setTiming] = useState("");
  const [set7DayCheck, setSet7DayCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Find first "Delayed" urge older than 24h that hasn't been resolved or dismissed
    if (hasResolvedThisSession) return;
    
    const now = new Date().getTime();
    const delayedUrge = urges.find(u => {
      if (u.action !== "Delayed") return false;
      // Already handled this session (local guard against race condition)
      if (dismissedIds.has(u.id)) return false;
      if (u.convertedToSavings !== null && u.convertedToSavings !== undefined) return false;

      let createdAt: number;
      if (u.createdAt && typeof u.createdAt === "object" && "seconds" in u.createdAt) {
        createdAt = u.createdAt.seconds * 1000;
      } else {
        createdAt = new Date(u.createdAt).getTime();
      }

      // Check if dismissed recently (within 24h)
      if (u.followUpDismissedAt) {
        let dismissedAt: number;
        if (typeof u.followUpDismissedAt === "object" && "seconds" in u.followUpDismissedAt) {
          dismissedAt = u.followUpDismissedAt.seconds * 1000;
        } else {
          dismissedAt = new Date(u.followUpDismissedAt).getTime();
        }
        if ((now - dismissedAt) < 24 * 60 * 60 * 1000) return false;
      }

      const hoursPassed = (now - createdAt) / (1000 * 60 * 60);
      return hoursPassed >= 24;
    });

    if (delayedUrge) {
      // Only switch activeUrge if not currently showing success for this urge
      setActiveUrge((prev: any) => {
        if (prev?.id === delayedUrge.id) return prev; // keep the current active one stable
        return delayedUrge;
      });
      setSaveAmount(String(delayedUrge.amount || ""));
    } else {
      setActiveUrge(null);
    }
  }, [urges, loading, dismissedIds]);

  if (!activeUrge) return null;

  const currency = plan?.currency || "₦";

  const handleResisted = () => {
    // Show the optional savings prompt
    setStep("save_prompt");
  };

  const handleSaveConfirm = async (doSave: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const amount = doSave ? (Number(saveAmount) || activeUrge.amount) : 0;
      // Mark as dismissed immediately so the useEffect won't re-pop it
      setDismissedIds(prev => new Set([...prev, activeUrge.id]));
      await resolveUrge(activeUrge.id, "Resisted", doSave, amount);
      toast.success("Urge Resolved Successfully!", { icon: "🏆" });
      setStep("success");
      setTimeout(() => {
        markSessionResolved();
        setActiveUrge(null);
        setStep("initial");
      }, 3500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaybeLater = async () => {
    if (!user || !activeUrge) return;
    // Mark as dismissed immediately (local guard)
    setDismissedIds(prev => new Set([...prev, activeUrge.id]));
    markSessionResolved();
    setActiveUrge(null);
    setStep("initial");
    try {
      // Persist a dismissal timestamp so the 24h guard keeps it hidden after refresh
      const urgeRef = doc(db, "users", user.uid, "urges", activeUrge.id);
      await updateDoc(urgeRef, { followUpDismissedAt: serverTimestamp() });
    } catch (err) {
      console.warn("Could not persist dismissal:", err);
    }
  };

  const handleSkipSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      setDismissedIds(prev => new Set([...prev, activeUrge.id]));
      await resolveUrge(activeUrge.id, "Resisted", false, 0);
      toast.success("Urge Resolved Successfully!", { icon: "🏆" });
      setStep("success");
      setTimeout(() => {
        markSessionResolved();
        setActiveUrge(null);
        setStep("initial");
      }, 3500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to skip save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchased = async () => {
    if (step === "initial" || step === "save_prompt") {
      setStep("purchased_feedback");
      return;
    }
  };

  const handleFinishPurchasedReflection = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const followUpData = {
        purchaseTrigger: trigger,
        purchaseFeeling: feeling,
        purchaseTiming: timing,
        sevenDayReEval: set7DayCheck,
      };
      // Mark as dismissed immediately (local guard)
      setDismissedIds(prev => new Set([...prev, activeUrge.id]));
      await resolveUrge(activeUrge.id, "Purchased", false, 0, followUpData);
      toast.success("Reflection Logged", { icon: "📝" });
      setStep("success");
      setTimeout(() => {
        markSessionResolved();
        setActiveUrge(null);
        setStep("initial");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to log reflection");
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Close button */}
          <button
            onClick={handleMaybeLater}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {/* Step 1: Did you resist or buy? */}
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
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">24h Check-in</p>
                  </div>
                  <h2 className="text-2xl font-serif text-foreground">You paused. 🎉</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24 hours ago, you paused on buying{" "}
                    <span className="font-bold text-foreground">{activeUrge.item || "an item"}</span>{" "}
                    ({currency}{activeUrge.amount ? Number(activeUrge.amount).toLocaleString() : "0"}). Did you resist or did you buy?
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleResisted}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> I Resisted!
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handlePurchased}
                    className="w-full py-4 bg-background border border-border text-foreground rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> I Bought It
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Optional savings prompt (after "Resisted") */}
            {step === "save_prompt" && (
              <motion.div
                key="save_prompt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Awareness Saving</p>
                  </div>
                  <h2 className="text-2xl font-serif text-foreground">You resisted! 🏆</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Would you like to redirect some of that money to your Growth Goal?
                    <span className="text-[10px] block mt-1 text-muted-foreground/60 italic">Saving is optional – it's your choice.</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">{currency}</span>
                    <input
                      type="number"
                      value={saveAmount}
                      onChange={(e) => setSaveAmount(e.target.value)}
                      placeholder={String(activeUrge.amount || 0)}
                      className="w-full bg-background/60 border border-border rounded-2xl pl-10 pr-4 py-4 text-foreground font-bold text-lg outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center italic">
                    Original urge amount: {currency}{activeUrge.amount ? Number(activeUrge.amount).toLocaleString() : "0"}. Enter any amount.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSaveConfirm(true)}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Yes, Save It"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSkipSave}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-background border border-border text-foreground rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Maybe Later
                  </motion.button>
                </div>
                <p className="text-[9px] text-muted-foreground text-center">
                  You still earn <strong>+2 coins</strong> for resisting, even if you skip saving.
                </p>
              </motion.div>
            )}

            {/* Step 3: Purchased feedback */}
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
                    Every choice is data. Let&apos;s learn from this.
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
                    onClick={handleFinishPurchasedReflection}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Finishing..." : "Finish Reflection"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success */}
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
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
