"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { Compass, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";


const spenderTypes = ["Controlled", "Balanced", "Intentional", "Strict", "Not sure yet"];

export default function PlanPage() {
  const { plan, logs, savePlan, loading } = useTracking();
  const [formData, setFormData] = useState({
    budget: "",
    essentials: "",
    savings: "",
    spenderType: "Balanced",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        budget: plan.budget || "",
        essentials: plan.essentials || "",
        savings: plan.savings || "",
        spenderType: plan.spenderType || "Balanced",
      });
    }
  }, [plan]);

  const handleSave = async () => {
    await savePlan(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const totalSpent = logs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budgetValue = Number(formData.budget) || 0;
  const remaining = Math.max(0, budgetValue - totalSpent);
  const percentSpent = budgetValue > 0 ? Math.min(100, Math.round((totalSpent / budgetValue) * 100)) : 0;

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Weekly Plan</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">Intent & Direction</h1>
          <p className="text-muted-foreground text-sm">Set your intention for the week. Where is your money going?</p>
        </div>
      </header>

      <div className="glass-card p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-5">
            <h3 className="text-xl font-serif text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              Weekly Goals
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Weekly Budget</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">₦</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.budget}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setFormData({ ...formData, budget: val });
                      }
                    }}
                    className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Savings Target</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">₦</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.savings}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setFormData({ ...formData, savings: val });
                      }
                    }}
                    className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Essentials List</label>
                <textarea
                  value={formData.essentials}
                  onChange={(e) => setFormData({ ...formData, essentials: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 min-h-[120px] resize-none transition-all"
                  placeholder="Rent, Groceries, Utilities..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-xl font-serif text-foreground">Spender Identity</h3>
            <div className="grid grid-cols-1 gap-2">
              {spenderTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, spenderType: type })}
                  className={cn(
                    "w-full py-5 px-6 rounded-2xl text-left border transition-all flex items-center justify-between group",
                    formData.spenderType === type
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                  )}
                >
                  <span className="text-sm font-bold uppercase tracking-widest">{type}</span>
                  {formData.spenderType === type && <CheckCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isSaved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Intention Recorded
            </>
          ) : (
            "Set My Intention"
          )}
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-8 glass-card space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Budget Status</h3>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border",
              budgetValue > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
            )}>
              {budgetValue > 0 ? "Active Plan" : "No active plan"}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-3xl font-serif text-foreground tracking-tight">₦{remaining.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Still Safe to Spend</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-lg font-serif text-primary">₦{totalSpent.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Already Logged</p>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentSpent}%` }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(176,132,71,0.3)]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
