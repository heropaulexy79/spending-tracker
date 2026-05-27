"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, ShieldAlert, History, Clock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";
import { formatDate } from "@/lib/dateUtils";

const urgeTypes = [
  { label: "Emotional", emoji: "😤", desc: "Triggered by a strong feeling" },
  { label: "Impulsive", emoji: "⚡", desc: "Sudden urge with no real reason" },
  { label: "Social pressure", emoji: "👥", desc: "Influenced by others around you" },
  { label: "Boredom", emoji: "😐", desc: "Shopping to fill empty time" },
  { label: "Immediate desire", emoji: "🔥", desc: "Saw it and just wanted it now" },
];

const triggers = [
  { label: "Stress", emoji: "😰" },
  { label: "FOMO", emoji: "😬" },
  { label: "Loneliness", emoji: "🌧️" },
  { label: "Boredom", emoji: "😑" },
  { label: "Hunger", emoji: "🍔" },
  { label: "Excitement", emoji: "🤩" },
  { label: "Sadness", emoji: "😔" },
  { label: "Peer influence", emoji: "👫" },
];

const delayReasons = [
  "I want to sleep on it",
  "I need to check my budget first",
  "I'll revisit in 24 hours",
  "I want to compare prices",
  "I need to think if it's really worth it",
];

const delayRevisitOptions = [
  "Tomorrow",
  "In 3 days",
  "Next week",
  "End of month",
];

const actions = ["Resisted", "Delayed", "Bought"];

export default function UrgePage() {
  const { urges, addUrge, loading, noSpendDayLogged, urgeLoggedToday } = useTracking();
  const [hasUrge, setHasUrge] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urgeData, setUrgeData] = useState({
    type: "",
    action: "",
    trigger: "",
    resisted24h: false,
    delayReason: "",
    delayRevisit: "",
  });

  const reset = () => {
    setHasUrge(null);
    setStep(1);
    setShowSuccess(false);
    setUrgeData({ type: "", action: "", trigger: "", resisted24h: false, delayReason: "", delayRevisit: "" });
  };

  const handleComplete = async (finalData?: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const dataToSave = finalData || urgeData;
    await addUrge(dataToSave);
    setShowSuccess(true);
    setIsSubmitting(false);
    setTimeout(reset, 2500);
  };

  // Summary stats
  const resistedCount = urges.filter(u => u.action === "Resisted").length;
  const delayedCount = urges.filter(u => u.action === "Delayed").length;
  const boughtCount = urges.filter(u => u.action === "Bought").length;
  const resisted24hCount = urges.filter(u => u.resisted24h === true).length;
  const totalUrges = urges.filter(u => u.type !== "Calm").length;

  // Group by day for chart
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  urges.forEach(u => {
    if (u.type !== "Calm") {
      let date: Date;
      if (u.createdAt && typeof u.createdAt === "object" && "seconds" in u.createdAt) {
        date = new Date((u.createdAt as any).seconds * 1000);
      } else {
        date = u.createdAt ? new Date(u.createdAt) : new Date();
      }
      const day = isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
      const index = day === 0 ? 6 : day - 1;
      dayData[index] += 1;
    }
  });
  const maxDay = Math.max(...dayData, 1);

  if (loading) return null;

  const stepLabel = ["Urge Type", "Emotional Trigger", "Action Taken", "24h Resistance / Delay Detail"][step - 1];
  const totalSteps = 4;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Momentary Impulse</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">Impulse Moments</h1>
          <p className="text-muted-foreground text-sm">Track and understand every urge. Awareness is the cure.</p>
        </div>
      </header>

      {/* Summary Stat Strip */}
      {totalUrges > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Resisted", value: resistedCount, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Delayed", value: delayedCount, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Bought", value: boughtCount, color: "text-coral", bg: "bg-coral/10 border-coral/20" },
            { label: "24h Won", value: resisted24hCount, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          ].map((s) => (
            <div key={s.label} className={cn("p-3 rounded-2xl border text-center", s.bg)}>
              <p className={cn("text-xl font-serif", s.color)}>{s.value}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Form Area */}
      {noSpendDayLogged || urgeLoggedToday ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-card text-center space-y-6 border-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            {noSpendDayLogged ? (
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            ) : (
              <Zap className="w-10 h-10 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-foreground">
              {noSpendDayLogged ? "🟢 No-Buy Day Recorded" : "⚡ Impulse Already Recorded"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              {noSpendDayLogged 
                ? "Your day is defined by quiet discipline. No further impulse tracking is required today."
                : "You've already processed an impulse today. Focus on maintaining your presence and intention."}
            </p>
          </div>
        </motion.div>
      ) : showSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-card text-center space-y-5"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-serif text-foreground">Impulse Recorded</h2>
          <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">Every moment of awareness is a step towards behavioral freedom.</p>
        </motion.div>
      ) : hasUrge === null ? (
        <div className="p-10 glass-card text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <Zap className="w-10 h-10 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-foreground">Did you feel an urge today?</h2>
            <p className="text-muted-foreground text-sm">Honesty with yourself is the foundation of growth.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setHasUrge(true)}
              className="flex-1 py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] transition-all"
            >
              Yes, I did
            </button>
            <button
              onClick={() => handleComplete({ type: "Calm", action: "N/A", resisted24h: true, trigger: null, delayReason: null, delayRevisit: null })}
              className="flex-1 py-5 bg-muted border border-border text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
            >
              No, I was calm
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step Progress Bar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => step > 1 ? setStep(s => s - 1) : reset()}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{stepLabel}</p>
              <p className="text-[10px] font-bold text-muted-foreground">{step}/{totalSteps}</p>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-500",
                    s <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <AnimatePresence mode="wait">

              {/* STEP 1 — Urge Type */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <h3 className="text-xl font-serif text-foreground">What type of urge was it?</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {urgeTypes.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => { setUrgeData(d => ({ ...d, type: t.label })); setStep(2); }}
                        className="w-full py-4 px-5 bg-muted border border-border rounded-2xl text-left hover:border-primary/50 hover:bg-muted/80 transition-all flex items-center gap-4 group"
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <div>
                          <p className="font-bold text-foreground text-sm uppercase tracking-widest">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Emotional Trigger (NEW) */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif text-foreground">What was the emotional trigger?</h3>
                    <p className="text-xs text-muted-foreground">What feeling drove the urge? Be honest.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {triggers.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => { setUrgeData(d => ({ ...d, trigger: t.label })); setStep(3); }}
                        className={cn(
                          "py-4 px-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center",
                          urgeData.trigger === t.label
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Action Taken */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <h3 className="text-xl font-serif text-foreground">What action did you take?</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {actions.map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          const newData = { ...urgeData, action: a };
                          setUrgeData(newData);
                          // Resisted or Delayed both go to step 4 for their specific follow-up
                          if (a === "Resisted" || a === "Delayed") {
                            setStep(4);
                          } else {
                            handleComplete(newData);
                          }
                        }}
                        className={cn(
                          "w-full py-5 px-6 border rounded-2xl text-left flex items-center justify-between font-bold uppercase tracking-widest text-[10px] transition-all",
                          a === "Resisted" && "bg-emerald-500/10 border-emerald-500/30 text-foreground hover:border-emerald-500/60",
                          a === "Delayed" && "bg-amber-500/10 border-amber-500/30 text-foreground hover:border-amber-500/60",
                          a === "Bought" && "bg-coral/10 border-coral/30 text-foreground hover:border-coral/60",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {a === "Resisted" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                          {a === "Delayed" && <History className="w-5 h-5 text-amber-400" />}
                          {a === "Bought" && <ShieldAlert className="w-5 h-5 text-coral" />}
                          <div>
                            <p className="font-bold">{a}</p>
                            <p className="text-[9px] text-muted-foreground font-normal normal-case tracking-normal mt-0.5">
                              {a === "Resisted" && "I did not make the purchase — +10 coins"}
                              {a === "Delayed" && "I postponed the decision — +10 coins"}
                              {a === "Bought" && "I went ahead with the purchase"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — 24h Resistance (Resisted) OR Delay Detail (Delayed) */}
              {step === 4 && urgeData.action === "Resisted" && (
                <motion.div key="step4-resisted" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center space-y-3 py-2">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <Clock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-serif text-foreground">24-Hour Resistance Check</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Has the urge passed or persisted after 24 hours? This tells you if it was a true need or just a momentary feeling.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleComplete({ ...urgeData, resisted24h: true })}
                      className="flex-1 py-5 bg-emerald-600 text-foreground rounded-2xl font-bold hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex flex-col items-center gap-1"
                    >
                      <span>✅ Yes, it passed</span>
                      <span className="text-[9px] font-normal opacity-70">It was a momentary feeling</span>
                    </button>
                    <button
                      onClick={() => handleComplete({ ...urgeData, resisted24h: false })}
                      className="flex-1 py-5 bg-muted border border-border text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all flex flex-col items-center gap-1"
                    >
                      <span>⏳ Still feel it</span>
                      <span className="text-[9px] font-normal opacity-70">May be a genuine need</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Delayed Purchase Tracking (NEW) */}
              {step === 4 && urgeData.action === "Delayed" && (
                <motion.div key="step4-delayed" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif text-foreground">Smart Delay Details</h3>
                    <p className="text-xs text-muted-foreground">Good instinct. Now let's capture your intention.</p>
                  </div>

                  {/* Why delayed */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Why are you delaying?</p>
                    <div className="space-y-2">
                      {delayReasons.map((r) => (
                        <button
                          key={r}
                          onClick={() => setUrgeData(d => ({ ...d, delayReason: r }))}
                          className={cn(
                            "w-full py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-left transition-all",
                            urgeData.delayReason === r
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* When to revisit */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">When will you revisit this?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {delayRevisitOptions.map((o) => (
                        <button
                          key={o}
                          onClick={() => setUrgeData(d => ({ ...d, delayRevisit: o }))}
                          className={cn(
                            "py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                            urgeData.delayRevisit === o
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                          )}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 24h check integrated */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">24-Hour Rule Applied</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">Delayed purchases automatically count as 24h resistance. If the urge passes, you win.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleComplete({ ...urgeData, resisted24h: true })}
                    disabled={!urgeData.delayReason || !urgeData.delayRevisit}
                    className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-foreground rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm Delay Plan
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Impulse Frequency Chart */}
      <section className="p-8 glass-card space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-foreground">Impulse Frequency</h2>
          {totalUrges > 0 && (
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{totalUrges} this week</p>
          )}
        </div>
        <div className="flex items-end gap-3 h-32 pt-4">
          {dayData.map((count, i) => {
            const h = count > 0 ? Math.max((count / maxDay) * 100, 5) : 0;
            return (
              <div key={i} className="flex-1 bg-muted rounded-t-xl relative group h-full flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="w-full bg-primary/80 rounded-t-xl transition-all duration-500 group-hover:bg-primary"
                />
                {count > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-muted backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-border">
                    {count} {count === 1 ? "urge" : "urges"}
                  </div>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="pt-4">
          <p className="text-xs text-muted-foreground text-center italic">Visualizing your pulse of desire across the week.</p>
        </div>
      </section>

      {/* Urge History List */}
      {urges.filter(u => u.type !== "Calm").length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-2xl font-serif text-foreground">Urge History</h2>
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {urges.filter(u => u.type !== "Calm").map((urge, i) => {
              const isResisted = urge.action === "Resisted";
              const isDelayed = urge.action === "Delayed";
              const isBought = urge.action === "Bought";

              return (
                <motion.div
                  key={urge.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "p-5 glass-card space-y-3 border transition-all",
                    isResisted && "border-emerald-500/20 bg-emerald-500/5",
                    isDelayed && "border-amber-500/20 bg-amber-500/5",
                    isBought && "border-coral/20 bg-coral/5",
                  )}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isResisted && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isDelayed && <History className="w-4 h-4 text-amber-400 shrink-0" />}
                        {isBought && <ShieldAlert className="w-4 h-4 text-coral shrink-0" />}
                        <p className="font-bold text-foreground text-sm">{urge.type}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {formatDate(urge.createdAt)}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                      isResisted && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      isDelayed && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      isBought && "bg-coral/10 text-coral border-coral/20",
                    )}>
                      {urge.action}
                    </span>
                  </div>

                  {/* Detail Chips */}
                  <div className="flex flex-wrap gap-2">
                    {urge.trigger && (
                      <span className="px-2.5 py-1 bg-muted border border-border rounded-full text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        🎯 {urge.trigger}
                      </span>
                    )}
                    {(isResisted || isDelayed) && (
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        urge.resisted24h
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}>
                        {urge.resisted24h ? "✅ 24h Won" : "⏳ Still Felt"}
                      </span>
                    )}
                    {isDelayed && urge.delayReason && (
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        {urge.delayReason}
                      </span>
                    )}
                    {isDelayed && urge.delayRevisit && (
                      <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-primary">
                        Revisit: {urge.delayRevisit}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
