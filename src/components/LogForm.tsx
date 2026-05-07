"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTracking } from "@/hooks/useTracking";

const decisionTypes = ["Planned", "Unplanned"];
const spendingTypes = ["Need", "Want", "Emotional impulse"];
const triggers = ["Hunger", "Stress", "Boredom", "Social influence", "Convenience", "Other"];
const moods = ["Calm", "Anxious", "Exhausted", "Happy", "Stressed", "Bored"];

const PAUSE_QUOTES = [
  "Is this a want or a need?",
  "Pause. Breathe. Decide.",
  "Your future self is watching.",
  "Discipline is choosing between what you want now and what you want most.",
  "Awareness is the first step to change.",
  "The space between stimulus and response is where your power lies.",
  "Ownership of your choices is the path to freedom."
];

export default function LogForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { noSpendDayLogged } = useTracking();
  const [isPausing, setIsPausing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    amount: "",
    decisionType: "Planned",
    spendingType: "Need",
    trigger: "Other",
    mood: "Calm",
    noSpendDay: false,
  });

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    if (isPausing) {
      setCurrentQuote(PAUSE_QUOTES[Math.floor(Math.random() * PAUSE_QUOTES.length)]);
    }
  }, [isPausing]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPausing && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (isPausing && countdown === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isPausing, countdown]);

  const handleSubmit = () => {
    const dataToSubmit = formData.noSpendDay 
      ? { ...formData, item: "No-Spend Day", amount: "0", date: new Date().toISOString().split("T")[0] }
      : { ...formData, date: new Date().toISOString().split("T")[0] };
      
    onSubmit(dataToSubmit);
    setIsPausing(false);
    setCountdown(10);
    setIsSubmitted(true);
    // Reset form after delay
    setTimeout(() => {
      setFormData({
        item: "",
        amount: "",
        decisionType: "Planned",
        spendingType: "Need",
        trigger: "Other",
        mood: "Calm",
        noSpendDay: false,
      });
      setIsSubmitted(false);
    }, 5000);
  };

  const handleInitialClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noSpendDay && (!formData.item || !formData.amount)) return;
    setIsPausing(true);
  };

  if (noSpendDayLogged) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass-card text-center space-y-6 max-w-lg mx-auto border-emerald-500/20"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white">🟢 No-Buy Day Recorded</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No further input required for today.<br />
            Your discipline is the foundation of your growth.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{dateString}</p>
        </div>
      </motion.div>
    );
  }

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass-card text-center space-y-6 max-w-lg mx-auto border-primary/20"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/20">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white">Entry Recorded</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your reality has been logged. <br />
            Take a breath before your next choice.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form className="space-y-6 max-w-lg mx-auto p-8 glass-card animate-in">
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Practice Awareness</p>
        <h3 className="text-2xl font-serif text-white">{dateString}</h3>
      </div>

      <div className="flex justify-end items-center mb-6">
        <label className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={formData.noSpendDay}
            onChange={(e) => setFormData({ ...formData, noSpendDay: e.target.checked })}
            className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary transition-all"
          />
          No-Spend Day
        </label>
      </div>

      {!formData.noSpendDay ? (
        <>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">What did you buy?</label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="e.g. Morning Coffee"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">₦</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Decision</label>
                <select
                  value={formData.decisionType}
                  onChange={(e) => setFormData({ ...formData, decisionType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-primary/50 appearance-none cursor-pointer"
                >
                  {decisionTypes.map((t) => <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Type</label>
                <select
                  value={formData.spendingType}
                  onChange={(e) => setFormData({ ...formData, spendingType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-primary/50 appearance-none cursor-pointer"
                >
                  {spendingTypes.map((t) => <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Trigger</label>
              <div className="flex flex-wrap gap-2">
                {triggers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, trigger: t })}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                      formData.trigger === t
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Current Mood</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                      formData.mood === m
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleInitialClick}
            disabled={isPausing}
            className={cn(
              "w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden mt-4 shadow-lg",
              isPausing ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-primary text-primary-foreground hover:shadow-primary/30 active:scale-[0.98]"
            )}
          >
            {isPausing ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 animate-pulse" />
                  <span>Pausing for awareness... {countdown}s</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={currentQuote}
                  className="text-[11px] italic text-amber-200/70 max-w-[80%] mx-auto font-serif"
                >
                  &ldquo;{currentQuote}&rdquo;
                </motion.p>
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
            ) : (
              "Log Purchase"
            )}
          </button>
          
          {isPausing && (
            <button
              type="button"
              onClick={() => setIsPausing(false)}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors"
            >
              Cancel and rethink
            </button>
          )}
        </>
      ) : (
        <div className="py-10 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-serif text-white">Quiet Discipline</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">Great job on a no-spend day. Your future self thanks you.</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            Confirm No-Spend Day
          </button>
        </div>
      )}
    </form>
  );
}
