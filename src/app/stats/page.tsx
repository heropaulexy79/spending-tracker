"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingDown, AlertTriangle, Lightbulb, Lock, ShieldCheck, ShieldAlert } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";


export default function StatsPage() {
  const { logs, urges, plan, loading } = useTracking();

  if (loading) return null;

  // Calculate distinct days logged
  const distinctDays = new Array(...new Set(logs.map(l => l.date))).length;
  const isLocked = distinctDays < 7;

  const totalWeekly = logs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budget = Number(plan?.budget) || 0;
  const dailyAvg = logs.length > 0 ? Math.round(totalWeekly / 7) : 0;

  // Group by day of week and calculate insights
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  const triggerCounts: Record<string, number> = {};
  const moodImpulseCounts: Record<string, number> = {};
  const moodTotalCounts: Record<string, number> = {};
  
  // Impulse Control Logic
  const dailyUncontrolled: Record<string, number> = {}; // Date -> Count
  let controlledCount = 0;
  let uncontrolledCount = 0;
 
  // Process Logs
  logs.forEach(log => {
    const dateStr = log.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(date.getTime())) return;
 
    const day = date.getDay();
    const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
    const amount = Number(log.amount) || 0;
    dayData[index] += amount;
 
    if (amount > 0) {
      if (log.trigger) {
        triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
      }
      if (log.mood) {
        moodTotalCounts[log.mood] = (moodTotalCounts[log.mood] || 0) + 1;
      }
      if (log.spendingType === "Emotional impulse") {
        uncontrolledCount++;
        dailyUncontrolled[dateStr] = (dailyUncontrolled[dateStr] || 0) + 1;
        if (log.mood) {
          moodImpulseCounts[log.mood] = (moodImpulseCounts[log.mood] || 0) + 1;
        }
      }
    }
  });
 
  // Calculate Emotional Correlation
  let topMoodCorrelate = "N/A";
  let topMoodRatio = 0;
  Object.keys(moodTotalCounts).forEach(mood => {
    const ratio = (moodImpulseCounts[mood] || 0) / moodTotalCounts[mood];
    if (ratio > topMoodRatio) {
      topMoodRatio = ratio;
      topMoodCorrelate = mood;
    }
  });
 
  // Process Urges
  urges.forEach(urge => {
    const dateStr = typeof urge.createdAt === 'string' ? urge.createdAt.split("T")[0] : null;
    if (urge.action === "Resisted" || urge.action === "Delayed") {
      controlledCount++;
    } else if (urge.action === "Bought") {
      uncontrolledCount++;
      if (dateStr) dailyUncontrolled[dateStr] = (dailyUncontrolled[dateStr] || 0) + 1;
    }
  });
 
  const calmDays = 7 - Object.keys(dailyUncontrolled).length;
  const impulseControlRate = Math.round((calmDays / 7) * 100);
 
  const maxAmount = Math.max(...dayData);
  const maxDayIndex = dayData.indexOf(maxAmount);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const busiestDay = maxAmount > 0 ? days[maxDayIndex] : "N/A";
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  
  const maxDay = Math.max(...dayData, 1);

  if (isLocked) {
    return (
      <div className="space-y-8 animate-in pb-12 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-lg shadow-primary/5">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-3 max-w-sm">
          <h1 className="text-3xl font-serif text-white">Weekly Behavioral Statistics</h1>
          <p className="text-muted-foreground leading-relaxed">
            These insights are locked until you complete a full week of logging. 
            Consistency is the key to behavioral clarity.
          </p>
        </div>
        <div className="mt-8 p-6 glass-card w-full max-w-xs space-y-4 border-white/5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="text-muted-foreground">Awareness Progress</span>
            <span className="text-primary">{distinctDays}/7 Days</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(distinctDays / 7) * 100}%` }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(176,132,71,0.5)]"
            />
          </div>
        </div>
      </div>
    );
  }

  const overBudget = totalWeekly > budget;
  const budgetDiff = Math.abs(totalWeekly - budget);

  return (
    <div className="space-y-10 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Weekly Overview</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-white">Weekly Statistics</h1>
          <p className="text-muted-foreground text-sm">A multi-section view of your behavioral reality.</p>
        </div>
      </header>

      {/* 1. Weekly Spending Summary */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-white px-1">Spending Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 glass-card space-y-2 border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Spend</p>
            <p className="text-3xl font-serif text-white">₦{totalWeekly.toLocaleString()}</p>
          </div>
          <div className="p-6 glass-card space-y-2 border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Daily Average</p>
            <p className="text-3xl font-serif text-white">₦{dailyAvg.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 2. Budget Performance */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-white px-1">Budget Performance</h2>
        <div className={cn(
          "p-8 glass-card space-y-6 border",
          overBudget ? "border-coral/20 bg-coral/5" : "border-emerald-500/20 bg-emerald-500/5"
        )}>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weekly Goal</p>
              <p className="text-2xl font-serif text-white">₦{budget.toLocaleString()}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
              <p className={cn("text-xl font-bold uppercase tracking-wider", overBudget ? "text-coral" : "text-emerald-500")}>
                {overBudget ? "Exceeded" : "Within Budget"}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5 flex gap-4 items-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              overBudget ? "bg-coral/10" : "bg-emerald-500/10"
            )}>
              {overBudget ? <ShieldAlert className="w-6 h-6 text-coral" /> : <ShieldCheck className="w-6 h-6 text-emerald-500" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                {overBudget 
                  ? `⚠️ You exceeded your budget by ₦${budgetDiff.toLocaleString()}`
                  : `✅ You stayed within your budget`}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {overBudget 
                  ? "You can improve next week. Stay intentional and reflect on each choice." 
                  : "Exceptional discipline. Your future self is proud of your restraint."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Impulse Control Statistics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-white px-1">Impulse Control</h2>
        <div className="p-8 glass-card space-y-8 border-white/5">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Controlled</p>
              <p className="text-3xl font-serif text-emerald-400">{controlledCount}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Uncontrolled</p>
              <p className="text-3xl font-serif text-coral">{uncontrolledCount}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discipline Rate</span>
              <span className="text-2xl font-serif text-white">{impulseControlRate}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${impulseControlRate}%` }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(176,132,71,0.3)]"
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic">Calculated based on days with zero uncontrolled impulses.</p>
          </div>
        </div>
      </section>

      {/* 4. Daily Spending Breakdown */}
      <section className="p-8 glass-card space-y-10 border-white/5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-white">Daily Breakdown</h2>
          {maxAmount > 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Peak: ₦{maxAmount.toLocaleString()}</span>}
        </div>
        
        <div className="flex items-end gap-3 h-48 pt-8">
          {dayData.map((amount, i) => {
            const h = amount > 0 ? Math.max((amount / maxDay) * 100, 3) : 0;
            return (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group h-full flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-300 group-hover:brightness-125",
                    h > 80 ? "bg-coral" : "bg-primary"
                  )}
                />
                
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                  ₦{amount.toLocaleString()}
                </div>

                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Insights (Consolidated) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-white px-1">Deep Insights</h2>
        <div className="grid grid-cols-1 gap-4">
          <InsightCard 
            icon={<TrendingDown className="w-5 h-5 text-primary" />}
            title="Busiest Day"
            description={`Your spending peaks on ${busiestDay}. Prepare mentally for this day next week.`}
            color="bg-primary/5 border-primary/10"
          />
          <InsightCard 
            icon={<AlertTriangle className="w-5 h-5 text-coral" />}
            title="The Emotional Root"
            description={topMoodCorrelate !== "N/A" ? `You are ${Math.round(topMoodRatio * 100)}% more likely to spend impulsively when you feel "${topMoodCorrelate}".` : "More mood data needed to map your emotional root."}
            color="bg-coral/5 border-coral/10"
          />
          <InsightCard 
            icon={<Lightbulb className="w-5 h-5 text-amber-400" />}
            title="Proactive Strategy"
            description={busiestDay !== "N/A" ? `Strategic Alert: Next ${busiestDay}, we will notify you to maintain high guard. Your discipline is strongest when forewarned.` : "Waiting for more data to build your awareness strategy."}
            color="bg-amber-400/5 border-amber-400/10"
          />
          <InsightCard 
            icon={<AlertTriangle className="w-5 h-5 text-coral" />}
            title="Dominant Trigger"
            description={topTrigger !== "N/A" ? `"${topTrigger}" is the bridge between your impulse and the buy.` : "No dominant trigger detected yet."}
            color="bg-coral/5 border-coral/10"
          />
        </div>
      </section>
    </div>
  );
}

function InsightCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={cn("p-4 rounded-2xl border flex gap-4 items-start transition-all hover:scale-[1.01]", color)}>
      <div className="mt-1 p-2 bg-white/5 rounded-xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-white mb-0.5">{title}</h4>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
