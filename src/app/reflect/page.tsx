"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Quote, Save } from "lucide-react";

export default function ReflectPage() {
  const [reflection, setReflection] = useState({
    why: "",
    beforeFeel: "",
    afterFeel: "",
    aligned: "Yes",
    nextTime: "",
  });

  const handleSave = () => {
    console.log("Reflection Saved:", reflection);
  };

  return (
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Awareness Journal</h1>
        <p className="text-muted-foreground">Study your behavior. No judgment, just observation.</p>
      </header>

      <div className="glass rounded-3xl p-6 space-y-8">
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3 italic text-sm text-primary/80">
          <Quote className="w-5 h-5 flex-shrink-0" />
          <p>"You are not judging your spending. You are studying it."</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Why did I buy what I bought today?</label>
              <textarea
                value={reflection.why}
                onChange={(e) => setReflection({ ...reflection, why: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary min-h-[100px] resize-none"
                placeholder="Dig deep. Was it a need or a reaction?"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">How did I feel BEFORE purchase?</label>
                <input
                  type="text"
                  value={reflection.beforeFeel}
                  onChange={(e) => setReflection({ ...reflection, beforeFeel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary"
                  placeholder="Stressed, bored, hungry..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">How do I feel AFTER purchase?</label>
                <input
                  type="text"
                  value={reflection.afterFeel}
                  onChange={(e) => setReflection({ ...reflection, afterFeel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary"
                  placeholder="Satisfied, guilty, indifferent..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Was this aligned with my intention?</label>
              <div className="flex gap-2">
                {["Yes", "No", "Partially"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setReflection({ ...reflection, aligned: opt })}
                    className={`flex-1 py-3 rounded-2xl border transition-all ${
                      reflection.aligned === opt
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">What would I do differently next time?</label>
              <textarea
                value={reflection.nextTime}
                onChange={(e) => setReflection({ ...reflection, nextTime: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary min-h-[100px] resize-none"
                placeholder="Learning point..."
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Reflection
        </button>
      </div>
    </div>
  );
}
