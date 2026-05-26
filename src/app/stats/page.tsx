"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingDown, AlertTriangle, Lightbulb, Lock, ShieldCheck, ShieldAlert, Sparkles, Award, Star, Eye } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

export default function StatsPage() {
  const { logs, urges, plan, loading } = useTracking();
  const [bypassLock, setBypassLock] = useState(false);

  if (loading) return null;

  // Calculate distinct days logged
  const distinctDays = new Array(...new Set(logs.filter(l => !l.isSavings).map(l => l.date))).length;
  const isSunday = new Date().getDay() === 0;
  const isLocked = !isSunday && !bypassLock;

  const totalWeekly = logs.filter(l => !l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const totalSavingsWeekly = logs.filter(l => l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budget = Number(plan?.budget) || 0;
  const dailyAvg = logs.filter(l => !l.isSavings).length > 0 ? Math.round(totalWeekly / 7) : 0;
  const noSpendDays = logs.filter(l => l.noSpendDay).length;

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
    if (log.isSavings) return;
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
  const overBudget = totalWeekly > budget;
  const budgetDiff = Math.abs(totalWeekly - budget);

  // Grade & Score Calculation
  const calculateGrade = () => {
    let score = 0;
    
    // 1. Budget Adherence (up to 50 points)
    if (budget > 0) {
      if (totalWeekly <= budget) {
        score += 50;
      } else {
        const exceededPercent = ((totalWeekly - budget) / budget) * 100;
        score += Math.max(0, 50 - exceededPercent * 0.5);
      }
    } else {
      score += 35; // Default if no budget set
    }
    
    // 2. No-Spend Days (up to 30 points)
    score += Math.min(30, noSpendDays * 5);
    
    // 3. Impulse Control Rate (up to 20 points)
    score += Math.min(20, (impulseControlRate / 100) * 20);

    score = Math.round(score);
    
    let grade = "C";
    let colorClass = "text-primary border-primary/20 bg-primary/5";
    let description = "Doing okay, but there's room to be more intentional.";
    
    if (score >= 90) {
      grade = "A";
      colorClass = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      description = "Outstanding! Absolute mastery of your impulses and intentions.";
    } else if (score >= 80) {
      grade = "B+";
      colorClass = "text-amber-400 border-amber-500/20 bg-amber-500/5";
      description = "Great job! Strong control with very minor slip ups.";
    } else if (score >= 70) {
      grade = "B";
      colorClass = "text-amber-400/80 border-amber-500/10 bg-amber-500/5";
      description = "Good progress, but some impulses are getting through.";
    } else if (score >= 60) {
      grade = "C";
      colorClass = "text-primary border-primary/20 bg-primary/5";
      description = "Awareness is forming, but let's practice more pause.";
    } else {
      grade = "F";
      colorClass = "text-coral border-coral/20 bg-coral/5";
      description = "High emotional/impulsive spending. Pause. Breathe. Re-align.";
    }
    
    return { score, grade, colorClass, description };
  };

  const { grade, colorClass, description } = calculateGrade();

  // Dynamic Report Card Commentary
  const getCommentary = () => {
    if (logs.length === 0) return "A quiet, clean canvas. Your spending has not yet begun. Observe each choice with pause and intent.";
    
    let commentary = `This week you scored ${grade}. `;
    
    if (grade === "A") {
      commentary += "Your discipline is exemplary! You stayed fully within your budget, resisted urges with absolute precision, and protected your intentions.";
    } else {
      if (overBudget) {
        commentary += `You exceeded your budget by ${plan?.currency || "₦"}${budgetDiff.toLocaleString()}. `;
      } else {
        commentary += "You kept your overall spending within budget. ";
      }
      
      const categoryCounts: Record<string, number> = {};
      logs.forEach(l => {
        if (!l.isSavings && l.spendingType) {
          categoryCounts[l.spendingType] = (categoryCounts[l.spendingType] || 0) + 1;
        }
      });
      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "wants";
      
      commentary += `You slipped on ${topCategory.toLowerCase()} purchases (again), showing some impulsive patterns. `;
    }
    
    if (busiestDay !== "N/A") {
      commentary += `Your best day was ${busiestDay}.`;
    }
    
    return commentary;
  };

  // Deep Emotional Tagging Analysis
  const getEmotionalAnalysis = () => {
    const impulseLogs = logs.filter(l => !l.isSavings && l.spendingType === "Emotional impulse");
    const totalImpulses = impulseLogs.length;
    if (totalImpulses === 0) return null;
    
    const moodCounts: Record<string, number> = {};
    impulseLogs.forEach(l => {
      if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
    });
    
    const topImpulseMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Stressed";
    const moodImpulseCount = moodCounts[topImpulseMood] || 0;
    const percent = Math.round((moodImpulseCount / totalImpulses) * 100);
    
    return {
      mood: topImpulseMood,
      percent,
      totalImpulses
    };
  };

  const emotionalAnalysis = getEmotionalAnalysis();

  if (isLocked) {
    return (
      <div className="space-y-8 animate-in pb-12 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-lg shadow-primary/5">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-3 max-w-sm">
          <h1 className="text-3xl font-serif text-foreground">Weekly Behavioral Statistics</h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            These insights are locked until Sunday.
            Consistency is the key to behavioral clarity.
          </p>
        </div>
        <div className="mt-6 p-6 glass-card w-full max-w-xs space-y-4 border-border">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="text-muted-foreground">Awareness Progress</span>
            <span className="text-primary">{distinctDays}/7 Days</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(distinctDays / 7) * 100}%` }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(176,132,71,0.5)]"
            />
          </div>
        </div>

        <button
          onClick={() => setBypassLock(true)}
          className="mt-6 flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary transition-all"
        >
          <Eye className="w-4 h-4" /> Preview Live Draft Overview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Weekly Overview</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">Weekly Statistics</h1>
          <p className="text-muted-foreground text-sm">A multi-section view of your behavioral reality.</p>
        </div>
      </header>

      {/* NEW: Sunday Report Card Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-foreground px-1 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Weekly Report Card
        </h2>
        
        <div className={cn("p-8 glass-card border flex flex-col md:flex-row gap-6 items-center relative overflow-hidden", colorClass)}>
          {/* Top spark decoration */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
            <Star className="w-32 h-32" />
          </div>
          
          {/* Grade Badge */}
          <div className="w-24 h-24 rounded-full border border-current/30 flex flex-col items-center justify-center flex-shrink-0 bg-background/30 backdrop-blur-md shadow-xl">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Grade</span>
            <span className="text-4xl font-serif font-bold tracking-tight leading-none mt-1">{grade}</span>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Automated Commentary</p>
              <h3 className="text-lg font-bold text-foreground font-serif leading-tight">{description}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
              &ldquo;{getCommentary()}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 1. Weekly Spending Summary */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-foreground px-1">Spending & Savings Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 glass-card space-y-2 border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Spend</p>
            <p className="text-3xl font-serif text-foreground truncate">{plan?.currency || "₦"}{totalWeekly.toLocaleString()}</p>
          </div>
          <div className="p-6 glass-card space-y-2 border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Logged Savings</p>
            <p className="text-3xl font-serif text-emerald-400 truncate">{plan?.currency || "₦"}{totalSavingsWeekly.toLocaleString()}</p>
          </div>
          <div className="p-6 glass-card space-y-2 border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Daily Average</p>
            <p className="text-3xl font-serif text-foreground truncate">{plan?.currency || "₦"}{dailyAvg.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 2. Budget Performance */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif text-foreground px-1">Budget Performance</h2>
        <div className={cn(
          "p-8 glass-card space-y-6 border",
          overBudget ? "border-coral/20 bg-coral/5" : "border-emerald-500/20 bg-emerald-500/5"
        )}>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weekly Goal</p>
              <p className="text-2xl font-serif text-foreground">{plan?.currency || "₦"}{budget.toLocaleString()}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
              <p className={cn("text-xl font-bold uppercase tracking-wider", overBudget ? "text-coral" : "text-emerald-500")}>
                {overBudget ? "Exceeded" : "Within Budget"}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border flex gap-4 items-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              overBudget ? "bg-coral/10" : "bg-emerald-500/10"
            )}>
              {overBudget ? <ShieldAlert className="w-6 h-6 text-coral" /> : <ShieldCheck className="w-6 h-6 text-emerald-500" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {overBudget 
                  ? `⚠️ You exceeded your budget by ${plan?.currency || "₦"}${budgetDiff.toLocaleString()}`
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
        <h2 className="text-2xl font-serif text-foreground px-1">Impulse Control</h2>
        <div className="p-8 glass-card space-y-8 border-border">
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
              <span className="text-2xl font-serif text-foreground">{impulseControlRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
      <section className="p-8 glass-card space-y-10 border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-foreground">Daily Breakdown</h2>
          {maxAmount > 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Peak: {plan?.currency || "₦"}{maxAmount.toLocaleString()}</span>}
        </div>
        
        <div className="flex items-end gap-3 h-48 pt-8">
          {dayData.map((amount, i) => {
            const h = amount > 0 ? Math.max((amount / maxDay) * 100, 3) : 0;
            return (
              <div key={i} className="flex-1 bg-muted rounded-t-xl relative group h-full flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-300 group-hover:brightness-125",
                    h > 80 ? "bg-coral" : "bg-primary"
                  )}
                />
                
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-muted backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-border">
                  {plan?.currency || "₦"}{amount.toLocaleString()}
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
        <h2 className="text-2xl font-serif text-foreground px-1">Deep Insights</h2>
        <div className="grid grid-cols-1 gap-4">
          <InsightCard 
            icon={<TrendingDown className="w-5 h-5 text-primary" />}
            title="Busiest Day"
            description={`Your spending peaks on ${busiestDay}. Prepare mentally for this day next week.`}
            color="bg-primary/5 border-primary/10"
          />
          
          {/* NEW: Deep Emotional Tagging Analysis Card */}
          {emotionalAnalysis ? (
            <InsightCard 
              icon={<Sparkles className="w-5 h-5 text-purple-400" />}
              title="Emotional Root"
              description={`⚠️ Mindful Alert: ${emotionalAnalysis.percent}% of your emotional/impulse purchases occur when you feel "${emotionalAnalysis.mood}". This trigger drives your spending patterns.`}
              color="bg-purple-500/5 border-purple-500/10"
            />
          ) : (
            <InsightCard 
              icon={<AlertTriangle className="w-5 h-5 text-coral" />}
              title="The Emotional Root"
              description={topMoodCorrelate !== "N/A" ? `You are ${Math.round(topMoodRatio * 100)}% more likely to spend impulsively when you feel "${topMoodCorrelate}".` : "More mood data needed to map your emotional root."}
              color="bg-coral/5 border-coral/10"
            />
          )}

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
      <div className="mt-1 p-2 bg-muted rounded-xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-foreground mb-0.5">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
