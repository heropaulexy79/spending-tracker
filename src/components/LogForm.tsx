"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const decisionTypes = ["Planned", "Unplanned"];
const spendingTypes = ["Need", "Want", "Emotional impulse"];
const triggers = ["Hunger", "Stress", "Boredom", "Social influence", "Convenience", "Other"];

export default function LogForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [isPausing, setIsPausing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [formData, setFormData] = useState({
    item: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    decisionType: "Planned",
    spendingType: "Need",
    trigger: "Other",
    noSpendDay: false,
  });

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
      ? { ...formData, item: "No-Spend Day", amount: "0" }
      : formData;
      
    onSubmit(dataToSubmit);
    setIsPausing(false);
    setCountdown(10);
    // Reset form
    setFormData({
      item: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      decisionType: "Planned",
      spendingType: "Need",
      trigger: "Other",
      noSpendDay: false,
    });
  };

  const handleInitialClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) return;
    setIsPausing(true);
  };

  return (
    <form className="space-y-6 max-w-lg mx-auto p-6 glass rounded-3xl animate-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-white">Log Reality</h3>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={formData.noSpendDay}
            onChange={(e) => setFormData({ ...formData, noSpendDay: e.target.checked })}
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
          />
          No-Spend Day
        </label>
      </div>

      {!formData.noSpendDay ? (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">What did you buy?</label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="e.g. Morning Coffee"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Decision</label>
                <select
                  value={formData.decisionType}
                  onChange={(e) => setFormData({ ...formData, decisionType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white outline-none focus:border-primary"
                >
                  {decisionTypes.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type</label>
                <select
                  value={formData.spendingType}
                  onChange={(e) => setFormData({ ...formData, spendingType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white outline-none focus:border-primary"
                >
                  {spendingTypes.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Trigger</label>
              <div className="flex flex-wrap gap-2">
                {triggers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, trigger: t })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm border transition-all",
                      formData.trigger === t
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleInitialClick}
            disabled={isPausing}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all relative overflow-hidden",
              isPausing ? "bg-amber-500/20 text-amber-500" : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            )}
          >
            {isPausing ? (
              <>
                <Timer className="w-5 h-5 animate-pulse" />
                Pausing for awareness... {countdown}s
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </>
            ) : (
              "Log Purchase"
            )}
          </button>
          
          {isPausing && (
            <button
              type="button"
              onClick={() => setIsPausing(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Cancel and rethink
            </button>
          )}
        </>
      ) : (
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-muted-foreground">Great job on a no-spend day!</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-semibold hover:opacity-90"
          >
            Confirm No-Spend Day
          </button>
        </div>
      )}
    </form>
  );
}
