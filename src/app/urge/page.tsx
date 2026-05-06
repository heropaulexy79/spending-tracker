"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";

const urgeTypes = ["Emotional", "Impulsive", "Social pressure", "Boredom", "Immediate desire"];
const actions = ["Bought", "Resisted", "Delayed"];

export default function UrgePage() {
  const { urges, addUrge, loading } = useTracking();
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
      const day = new Date(u.createdAt).getDay();
      const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
      dayData[index] += 1;
    }
  });
  const maxDay = Math.max(...dayData, 1);

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Urge</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Impulse Moments</h1>
        <p className="text-muted-foreground">Track the moments you felt an urge to spend.</p>
      </header>

      {showSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass rounded-3xl text-center space-y-4"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Awareness Logged</h2>
          <p className="text-muted-foreground">Every moment of awareness is a step towards freedom.</p>
        </motion.div>
      ) : hasUrge === null ? (
        <div className="p-8 glass rounded-3xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
          </div>
          <h2 className="text-2xl font-bold text-white">Did you feel an urge today?</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setHasUrge(true)}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-semibold hover:opacity-90 transition-all"
            >
              Yes, I did
            </button>
            <button 
              onClick={() => handleComplete({ type: "Calm", action: "N/A", resisted24h: true })}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all"
            >
              No, I was calm
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white">What type of urge was it?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {urgeTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setUrgeData({ ...urgeData, type: t });
                        setStep(2);
                      }}
                      className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-left text-white hover:border-primary/50 transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-white">What action did you take?</h3>
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
                      className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-left text-white hover:border-primary/50 transition-all flex items-center justify-between"
                    >
                      {a}
                      {a === "Resisted" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                      {a === "Bought" && <ShieldAlert className="w-5 h-5 text-coral-400" />}
                      {a === "Delayed" && <History className="w-5 h-5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
                <h3 className="text-lg font-semibold text-white">Did the urge pass after 24 hours?</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleComplete({ ...urgeData, resisted24h: true })}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-semibold hover:opacity-90"
                  >
                    Yes, it passed
                  </button>
                  <button 
                    onClick={() => handleComplete({ ...urgeData, resisted24h: false })}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10"
                  >
                    No, I'm still thinking about it
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Impulse Frequency Display */}
      <section className="p-6 glass rounded-3xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Impulse Frequency</h2>
        <div className="flex items-end gap-2 h-32">
          {dayData.map((count, i) => {
            const h = (count / maxDay) * 100;
            return (
              <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:brightness-110" 
                />
                {count > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {count} urges
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </section>
    </div>
  );
}
