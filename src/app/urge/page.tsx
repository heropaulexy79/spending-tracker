"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";

const urgeTypes = ["Emotional", "Impulsive", "Social pressure", "Boredom", "Immediate desire"];
const actions = ["Bought", "Resisted", "Delayed"];

export default function UrgePage() {
  const { urges, addUrge, loading, noSpendDayLogged } = useTracking();
  const [hasUrge, setHasUrge] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [urgeData, setUrgeData] = useState({
    type: "Calm",
    action: "N/A",
    resisted24h: false,
  });

  const handleComplete = async (finalData?: any) => {
    const dataToSave = finalData || urgeData;
    await addUrge(dataToSave);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setHasUrge(null);
      setStep(1);
      setUrgeData({ type: "Calm", action: "N/A", resisted24h: false });
    }, 2000);
  };

  // Group by day of week for the chart
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  urges.forEach(u => {
    if (u.type !== "Calm") {
      const date = u.createdAt ? new Date(u.createdAt) : new Date();
      const day = date.getDay();
      const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
      dayData[index] += 1;
    }
  });
  const maxDay = Math.max(...dayData, 1);

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Momentary Impulse</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-white">Impulse Moments</h1>
          <p className="text-muted-foreground text-sm">Track the moments you felt an urge to spend.</p>
        </div>
      </header>

      {noSpendDayLogged ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-card text-center space-y-6 border-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-white">🟢 No-Buy Day Recorded</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Your day is defined by quiet discipline. No further impulse tracking is required today.
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
          <h2 className="text-3xl font-serif text-white">Impulse Recorded</h2>
          <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">Every moment of awareness is a step towards behavioral freedom.</p>
        </motion.div>
      ) : hasUrge === null ? (
        <div className="p-10 glass-card text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <Zap className="w-10 h-10 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white">Did you feel an urge today?</h2>
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
              onClick={() => handleComplete({ type: "Calm", action: "N/A", resisted24h: true })}
              className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              No, I was calm
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <h3 className="text-xl font-serif text-white">What type of urge was it?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {urgeTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setUrgeData({ ...urgeData, type: t });
                        setStep(2);
                      }}
                      className="w-full py-5 px-6 bg-white/5 border border-white/10 rounded-2xl text-left text-white hover:border-primary/50 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <h3 className="text-xl font-serif text-white">What action did you take?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {actions.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        const newData = { ...urgeData, action: a };
                        setUrgeData(newData);
                        if (a === "Resisted") {
                          setStep(3);
                        } else {
                          handleComplete(newData);
                        }
                      }}
                      className="w-full py-5 px-6 bg-white/5 border border-white/10 rounded-2xl text-left text-white hover:border-primary/50 hover:bg-white/10 transition-all flex items-center justify-between font-bold uppercase tracking-widest text-[10px]"
                    >
                      {a}
                      {a === "Resisted" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                      {a === "Bought" && <ShieldAlert className="w-5 h-5 text-coral" />}
                      {a === "Delayed" && <History className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center py-4">
                <h3 className="text-2xl font-serif text-white">Did the urge pass after 24 hours?</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleComplete({ ...urgeData, resisted24h: true })}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                  >
                    Yes, it passed
                  </button>
                  <button 
                    onClick={() => handleComplete({ ...urgeData, resisted24h: false })}
                    className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    No, I still feel it
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Impulse Frequency Display */}
      <section className="p-8 glass-card space-y-8">
        <h2 className="text-2xl font-serif text-white">Impulse Frequency</h2>
        <div className="flex items-end gap-3 h-32 pt-4">
          {dayData.map((count, i) => {
            const h = count > 0 ? Math.max((count / maxDay) * 100, 5) : 0;
            return (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group h-full flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="w-full bg-primary/80 rounded-t-xl transition-all duration-500 group-hover:bg-primary" 
                />
                {count > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                    {count} {count === 1 ? 'urge' : 'urges'}
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
    </div>
  );
}
