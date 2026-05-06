"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Sparkles, Heart, ShieldAlert, Zap } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

export default function MirrorPage() {
  const { logs, urges, plan, loading } = useTracking();

  if (loading) return null;

  const totalSpent = logs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budget = Number(plan?.budget) || 0;
  const totalSaved = Math.max(0, budget - totalSpent);
  
  const adherenceRate = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const noSpendDays = logs.filter(l => l.noSpendDay).length;
  
  // Triggers and Impulse from logs + urges
  const triggerCounts: Record<string, number> = {};
  let impulseCount = 0;
  
  [...logs, ...urges].forEach(item => {
    if (item.trigger && item.trigger !== "Other" && item.trigger !== "N/A") {
      triggerCounts[item.trigger] = (triggerCounts[item.trigger] || 0) + 1;
    }
    if (item.spendingType === "Emotional impulse" || item.type === "Impulsive") {
      impulseCount++;
    }
  });

  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const totalMoments = logs.length + urges.length;
  const impulseRate = totalMoments > 0 ? Math.round((impulseCount / totalMoments) * 100) : 0;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Mirror</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Monthly Mirror</h1>
        <p className="text-muted-foreground">A summary of your behavior this month.</p>
      </header>

      {/* Growth Narrative */}
      <div className="p-8 glass rounded-[2rem] bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Calendar className="w-32 h-32 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Growth Narrative
        </h2>
        <div className="space-y-4 text-white/80 leading-relaxed max-w-[80%]">
          {totalSpent > 0 ? (
            <p className="italic">
              “You are becoming more aware of your reality. With ₦{totalSpent.toLocaleString()} logged, 
              you are studying the difference between your impulses and your intentions.”
            </p>
          ) : (
            <p className="italic">“Your narrative is forming. Complete your first week to reveal your growth story.”</p>
          )}
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 glass rounded-3xl space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold text-white tracking-tight">₦{totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-6 glass rounded-3xl space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Estimated Saved</p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">₦{totalSaved.toLocaleString()}</p>
        </div>
      </div>

      {/* Behavior Consistency */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Consistency</h2>
        <div className="p-6 glass rounded-3xl space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Adherence</span>
              <span className={cn(
                "font-bold",
                adherenceRate > 100 ? "text-coral" : "text-white"
              )}>{adherenceRate}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, adherenceRate)}%` }}
                className={cn(
                  "h-full transition-all duration-1000",
                  adherenceRate > 100 ? "bg-coral" : "bg-primary"
                )} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">No-Spend Consistency</span>
              <span className="text-white font-bold">{noSpendDays} Days</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (noSpendDays / 7) * 100)}%` }}
                className="h-full bg-purple-500 transition-all duration-1000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Top Trigger</p>
              <p className="text-sm font-semibold text-white truncate">{topTrigger}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Impulse Rate</p>
              <p className="text-sm font-semibold text-white">{impulseRate}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Behavioral Warning/Tip */}
      {adherenceRate > 90 && (
        <div className="p-4 rounded-2xl bg-coral/10 border border-coral/20 flex gap-3 items-center">
          <ShieldAlert className="w-5 h-5 text-coral" />
          <p className="text-xs text-coral-200 font-medium">
            You've used {adherenceRate}% of your budget. Slow down and reflect before the next spend.
          </p>
        </div>
      )}

      {/* Final Message */}
      <div className="text-center py-10 space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400/20" />
        </div>
        <p className="text-muted-foreground italic px-8 leading-relaxed">
          "This is not about perfection. It is about awareness and progress. Every log is a victory for your mind."
        </p>
      </div>
    </div>
  );
}
