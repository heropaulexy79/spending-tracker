"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Quote, Save, CheckCircle2 } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

export default function ReflectPage() {
  const { addReflection, noSpendDayLogged, loading } = useTracking();
  const [showSuccess, setShowSuccess] = useState(false);
  const [reflection, setReflection] = useState({
    why: "",
    beforeFeel: "",
    afterFeel: "",
    aligned: "Yes",
    nextTime: "",
  });

  const handleSave = async () => {
    if (!reflection.why) return;
    
    await addReflection(reflection);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setReflection({
        why: "",
        beforeFeel: "",
        afterFeel: "",
        aligned: "Yes",
        nextTime: "",
      });
    }, 3000);
  };

  if (loading) return null;

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight">Reflection Recorded</h2>
        <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Your awareness is growing. This entry has been added to your journey.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Daily Reflection</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-white">Awareness Journal</h1>
          <p className="text-muted-foreground text-sm">Study your behavior. No judgment, just observation.</p>
        </div>
      </header>

      {noSpendDayLogged ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-card text-center space-y-6 border-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-white">🟢 No-Buy Day Recorded</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              A day of absolute discipline. No reflection is required for a choice not made.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="glass-card p-10 space-y-10">
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl flex gap-4 items-start italic text-sm text-primary/90 leading-relaxed font-serif">
            <Quote className="w-6 h-6 flex-shrink-0 mt-0.5 opacity-40" />
            <p className="text-lg">“You are not judging your spending. You are studying it. Every choice is data for your growth.”</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 ml-1">Why did I spend on what I paid for today?</label>
                <textarea
                  value={reflection.why}
                  onChange={(e) => setReflection({ ...reflection, why: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white outline-none focus:border-primary/50 min-h-[140px] resize-none transition-all placeholder:text-white/10 text-lg leading-relaxed"
                  placeholder="Dig deep. Was it a need or a reaction?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 ml-1">Feelings BEFORE purchase?</label>
                  <input
                    type="text"
                    value={reflection.beforeFeel}
                    onChange={(e) => setReflection({ ...reflection, beforeFeel: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                    placeholder="Stressed, bored, hungry..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 ml-1">Feelings AFTER purchase?</label>
                  <input
                    type="text"
                    value={reflection.afterFeel}
                    onChange={(e) => setReflection({ ...reflection, afterFeel: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                    placeholder="Satisfied, guilty, indifferent..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 ml-1">Aligned with my intention?</label>
                <div className="flex gap-3">
                  {["Yes", "No", "Partially"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setReflection({ ...reflection, aligned: opt })}
                      className={`flex-1 py-5 rounded-2xl border font-bold uppercase tracking-widest text-[10px] transition-all ${
                        reflection.aligned === opt
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(176,132,71,0.2)]"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 ml-1">What would I do differently next time?</label>
                <textarea
                  value={reflection.nextTime}
                  onChange={(e) => setReflection({ ...reflection, nextTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-primary/50 min-h-[120px] resize-none transition-all placeholder:text-white/10 leading-relaxed"
                  placeholder="A small adjustment for the future..."
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!reflection.why}
            className="w-full py-6 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            <Save className="w-6 h-6" />
            Save Reflection
          </button>
        </div>
      )}
    </div>
  );
}
