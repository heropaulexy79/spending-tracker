"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Quote, Save, CheckCircle2 } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

export default function ReflectPage() {
  const { addReflection } = useTracking();
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

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Reflection Saved</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Your awareness is growing. This entry has been added to your journey.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Reflect</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Awareness Journal</h1>
        <p className="text-muted-foreground">Study your behavior. No judgment, just observation.</p>
      </header>

      <div className="glass rounded-[2rem] p-8 space-y-8">
        <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex gap-4 items-start italic text-sm text-primary/90 leading-relaxed">
          <Quote className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-50" />
          <p>“You are not judging your spending. You are studying it. Every choice is data for your growth.”</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Why did I buy what I bought today?</label>
              <textarea
                value={reflection.why}
                onChange={(e) => setReflection({ ...reflection, why: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary min-h-[120px] resize-none transition-all placeholder:text-white/20"
                placeholder="Dig deep. Was it a need or a reaction?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Feelings BEFORE purchase?</label>
                <input
                  type="text"
                  value={reflection.beforeFeel}
                  onChange={(e) => setReflection({ ...reflection, beforeFeel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all placeholder:text-white/20"
                  placeholder="Stressed, bored, hungry..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Feelings AFTER purchase?</label>
                <input
                  type="text"
                  value={reflection.afterFeel}
                  onChange={(e) => setReflection({ ...reflection, afterFeel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all placeholder:text-white/20"
                  placeholder="Satisfied, guilty, indifferent..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Aligned with my intention?</label>
              <div className="flex gap-3">
                {["Yes", "No", "Partially"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setReflection({ ...reflection, aligned: opt })}
                    className={`flex-1 py-4 rounded-2xl border font-semibold transition-all ${
                      reflection.aligned === opt
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">What would I do differently next time?</label>
              <textarea
                value={reflection.nextTime}
                onChange={(e) => setReflection({ ...reflection, nextTime: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary min-h-[100px] resize-none transition-all placeholder:text-white/20"
                placeholder="A small adjustment for the future..."
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!reflection.why}
          className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Save Reflection
        </button>
      </div>
    </div>
  );
}
