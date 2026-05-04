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
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Intent & Direction</h1>
        <p className="text-muted-foreground">Set your intention for the week. Where is your money going?</p>
      </header>

      <div className="glass rounded-3xl p-6 space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              Weekly Goals
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Weekly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-white outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Savings Target</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <input
                    type="number"
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-white outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Essentials List</label>
                <textarea
                  value={formData.essentials}
                  onChange={(e) => setFormData({ ...formData, essentials: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary min-h-[100px] resize-none"
                  placeholder="Rent, Groceries, Utilities..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">What kind of spender do you want to be?</h3>
            <div className="grid grid-cols-1 gap-2">
              {spenderTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, spenderType: type })}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-left border transition-all flex items-center justify-between",
                    formData.spenderType === type
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-white hover:border-white/20"
                  )}
                >
                  {type}
                  {formData.spenderType === type && <CheckCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Intention Set
            </>
          ) : (
            "Set My Intention"
          )}
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 glass rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Budget Status</h3>
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1",
              budgetValue > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-muted-foreground"
            )}>
              {budgetValue > 0 ? "Plan Set" : "No plan set"}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-white">₦{remaining.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Still Safe to Spend</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">₦{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Already Logged</p>
            </div>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentSpent}%` }}
              className="h-full bg-primary" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
