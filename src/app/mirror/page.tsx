"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Sparkles, Heart, ShieldAlert, Zap, Lock, Info } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function MirrorPage() {
  const { user } = useAuth();
  const { logs, urges, plan, loading } = useTracking();

  if (loading) return null;

  // Check if account is older than 30 days
  const creationTime = user?.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isLocked = Date.now() - creationTime < thirtyDaysInMs;
  const daysRemaining = Math.ceil((thirtyDaysInMs - (Date.now() - creationTime)) / (24 * 60 * 60 * 1000));

  if (isLocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 p-6 text-center animate-in">
        <header className="space-y-3 mb-8 w-full max-w-md">
          <div className="flex items-center gap-2 justify-center">
            <div className="h-[1px] w-8 bg-primary/40" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Mirror of Reality</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-serif tracking-tight text-white">Monthly Mirror</h1>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 glass-card space-y-8 max-w-sm border-primary/20"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-serif text-white">Analysis in Progress</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-serif italic">
              &ldquo;Self-study requires time. A mirror only shows the truth once the patterns have been established.&rdquo;
            </p>
          </div>
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-primary uppercase tracking-widest">
              <Calendar className="w-4 h-4" />
              Unlocks in {daysRemaining} Days
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-4">
              Continue logging your daily reality. Your first monthly insight will be revealed once we have 30 days of behavioral data.
            </p>
          </div>
        </motion.div>
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-start max-w-sm text-left">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Monthly Mirror uses advanced behavioral aggregation. We need a full month cycle to provide accurate insight into your spending personality and triggers.
          </p>
        </div>
      </div>
    );
  }

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
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Mirror of Reality</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-white">Monthly Mirror</h1>
          <p className="text-muted-foreground text-sm">A summary of your behavior this month.</p>
        </div>
      </header>

      {/* Growth Narrative */}
      <div className="p-10 glass-card bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar className="w-32 h-32 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
          <Sparkles className="w-4 h-4" />
          Growth Narrative
        </h2>
        <div className="space-y-4 text-white leading-relaxed max-w-[90%] font-serif text-xl">
          {totalSpent > 0 ? (
            <p>
              &ldquo;You are becoming more aware of your reality. With ₦{totalSpent.toLocaleString()} logged, 
              you are studying the subtle difference between your impulses and your true intentions.&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground italic text-lg">&ldquo;Your narrative is forming. Complete your first week to reveal your growth story.&rdquo;</p>
          )}
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 glass-card space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Total Spent</p>
          <p className="text-2xl font-serif text-white tracking-tight">₦{totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-6 glass-card space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Estimated Saved</p>
          <p className="text-2xl font-serif text-emerald-400 tracking-tight">₦{totalSaved.toLocaleString()}</p>
        </div>
      </div>

      {/* Behavior Consistency */}
      <section className="space-y-5">
        <h2 className="text-2xl font-serif text-white px-1">Consistency</h2>
        <div className="p-8 glass-card space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Budget Adherence</span>
              <span className={cn(
                "font-serif text-lg",
                adherenceRate > 100 ? "text-coral" : "text-white"
              )}>{adherenceRate}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, adherenceRate)}%` }}
                className={cn(
                  "h-full transition-all duration-1000 shadow-[0_0_10px_rgba(176,132,71,0.2)]",
                  adherenceRate > 100 ? "bg-coral" : "bg-primary"
                )} 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No-Spend Practice</span>
              <span className="text-white font-serif text-lg">{noSpendDays} Days</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (noSpendDays / 7) * 100)}%` }}
                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-1000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Primary Trigger</p>
              <p className="text-sm font-bold text-white truncate">{topTrigger}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Impulse Rate</p>
              <p className="text-sm font-bold text-white">{impulseRate}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Behavioral Warning/Tip */}
      {adherenceRate > 90 && (
        <div className="p-5 rounded-2xl bg-coral/5 border border-coral/10 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-coral" />
          </div>
          <p className="text-xs text-coral-200 font-medium leading-relaxed">
            You&apos;ve utilized {adherenceRate}% of your weekly plan. This is a moment for extra pause and reflection.
          </p>
        </div>
      )}

      {/* Final Message */}
      <div className="text-center py-12 space-y-5">
        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400/10" />
        </div>
        <p className="text-muted-foreground italic font-serif text-lg px-10 leading-relaxed">
          &ldquo;This is not about perfection. It is about awareness and practice. Every entry is a victory for your mind.&rdquo;
        </p>
      </div>
    </div>
  );
}
