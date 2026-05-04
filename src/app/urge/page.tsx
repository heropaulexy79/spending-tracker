"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";

const urgeTypes = ["Emotional", "Impulsive", "Social pressure", "Boredom", "Immediate desire"];
const actions = ["Bought", "Resisted", "Delayed"];

export default function UrgePage() {
  const [hasUrge, setHasUrge] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [urgeData, setUrgeData] = useState({
    type: "",
    action: "",
    resisted24h: false,
  });

  const handleComplete = () => {
    console.log("Urge Tracked:", urgeData);
    // Reset
    setHasUrge(null);
    setStep(1);
  };

  return (
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Impulse Moments</h1>
        <p className="text-muted-foreground">Track the moments you felt an urge to spend.</p>
      </header>

      {hasUrge === null ? (
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
              onClick={() => {
                // Log "No urge"
                console.log("No urge today");
              }}
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
                        setUrgeData({ ...urgeData, action: a });
                        if (a === "Resisted") {
                          setStep(3);
                        } else {
                          handleComplete();
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
                    onClick={() => {
                      setUrgeData({ ...urgeData, resisted24h: true });
                      handleComplete();
                    }}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-semibold hover:opacity-90"
                  >
                    Yes, it passed
                  </button>
                  <button 
                    onClick={() => {
                      setUrgeData({ ...urgeData, resisted24h: false });
                      handleComplete();
                    }}
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
          {[40, 70, 30, 90, 50, 60, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group">
              <div 
                className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:brightness-110" 
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
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
