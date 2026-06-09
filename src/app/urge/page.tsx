"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, ShieldCheck, ArrowRight, Zap, Sparkles, X, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";
import Link from "next/link";

const REASONS = [
  { label: "Need", description: "Essential for my life/well-being" },
  { label: "Want", description: "Would bring me joy, but not essential" },
  { label: "Emotional", description: "I'm feeling stressed/bored/happy" },
  { label: "Celebration", description: "A reward for a win" },
];

export default function SmartDelayPage() {
  const { addUrge, plan, urgeLoggedToday } = useTracking();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: What/Cost, 2: Why, 3: Timer/Setting, 4: Reward/Success
  const [item, setItem] = useState("");
  const [cost, setCost] = useState("");
  const [reason, setReason] = useState("");

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && cost) setStep(2);
  };

  const handleReasonSelect = (r: string) => {
    setReason(r);
    setStep(3);
  };

  const handleSetDelay = async () => {
    // In a real app, this would trigger a notification later
    await addUrge({
      item,
      amount: cost,
      type: reason,
      action: "Delayed",
      createdAt: new Date(),
    });
    setStep(4);
  };

  /* removed restriction for multiple entries */

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="pt-8 space-y-2">
        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Hero Feature</p>
        </div>
        <h1 className="text-4xl font-serif tracking-tight text-foreground">Smart Delay</h1>
        <p className="text-sm text-muted-foreground">Pause. Breathe. Decide with power.</p>
      </header>

      <div className="max-w-lg mx-auto w-full glass-card border-primary/10 overflow-hidden min-h-[450px] flex flex-col justify-center p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleInitialSubmit}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">The Urge</p>
                  <h2 className="text-2xl font-serif leading-tight">What are you thinking of buying?</h2>
                  <input 
                    autoFocus
                    placeholder="e.g. New Sneakers"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-transparent border-b border-primary/20 focus:border-primary py-4 text-xl font-serif outline-none transition-all placeholder:opacity-30"
                  />
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">The Cost</p>
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-serif text-muted-foreground/50">
                            {plan?.currency || "₦"}
                        </span>
                        <input 
                            placeholder="0.00"
                            inputMode="decimal"
                            value={cost}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) setCost(val);
                            }}
                            className="w-full bg-transparent border-b border-primary/20 focus:border-primary pl-8 py-4 text-xl font-serif outline-none transition-all"
                        />
                    </div>
                </div>
              </div>

              <button 
                disabled={!item || !cost}
                type="submit"
                className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-primary/20 transition-all"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">The Intent</p>
                <h2 className="text-2xl font-serif">Why do you want it?</h2>
              </div>

              <div className="space-y-3">
                {REASONS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => handleReasonSelect(r.label)}
                    className="w-full p-5 rounded-2xl bg-muted border border-border text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <p className="font-bold text-foreground text-xs uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.description}</p>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(1)}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                    <Timer className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-serif">A 24-hour pause.</h2>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                        We&apos;ll check back with you tomorrow. When would you like to revisit this?
                    </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Morning", emoji: "🌅" },
                  { label: "Afternoon", emoji: "☀️" },
                  { label: "Evening", emoji: "🌙" }
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={handleSetDelay}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <button 
                    onClick={handleSetDelay}
                    className="w-full py-5 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all"
                >
                    Activate Superpower
                </button>
                <button 
                    onClick={() => setStep(2)}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                    Rethink
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                    <Sparkles className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-4xl font-serif">Great Job.</h2>
                <p className="text-sm text-muted-foreground italic">You just claimed your power.</p>
              </div>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex justify-between items-center text-left">
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Potential Savings</p>
                        <p className="text-2xl font-serif text-foreground">{plan?.currency || "₦"}{Number(cost).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Awareness Points</p>
                        <p className="text-2xl font-serif text-emerald-500">+10</p>
                    </div>
                </div>
              </div>

              <Link href="/">
                <button className="w-full py-5 bg-foreground text-background rounded-2xl font-bold hover:opacity-90 transition-all">
                    Return to Dashboard
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero Tip */}
      <section className="p-8 rounded-[2rem] bg-muted/50 border border-border text-center space-y-3">
        <ShieldCheck className="w-6 h-6 text-primary mx-auto opacity-40" />
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          &ldquo;The space between stimulus and response is where your freedom lies.&rdquo;
        </p>
      </section>

      {/* History Shortcut */}
      <Link href="/stats" className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
        <History className="w-4 h-4" /> View Delayed Urges
      </Link>
    </div>
  );
}
