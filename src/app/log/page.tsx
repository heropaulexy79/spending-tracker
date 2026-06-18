"use client";

import React, { useState } from "react";
import LogForm from "@/components/LogForm";
import WeeklyProgress from "@/components/WeeklyProgress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { formatDate, getWeekKey } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogPage() {
  const { logs, addLog, plan, loading } = useTracking();
  const router = useRouter();

  const currentWeekKey = getWeekKey();
  const weeklyLogs = logs.filter(l => l.weekKey === currentWeekKey);
  const weeklySpendLogs = weeklyLogs.filter(l => !l.isSavings && !l.noSpendDay);
  const totalSpent = weeklySpendLogs.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const budgetValue = Number(plan?.budget) || 0;
  const isBudgetExceeded = budgetValue > 0 && totalSpent >= budgetValue;

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogSubmit = async (data: any) => {
    await addLog(data);
    toast.success("Reality Logged Successfully!", { icon: "✅" });
  };

  if (!loading && !plan?.budget) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
           <AlertTriangle className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif">Plan Required</h2>
           <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            You must define your weekly intent before logging.
           </p>
        </div>
        <button 
          onClick={() => router.push('/plan')}
          className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] rounded-full shadow-lg shadow-primary/20"
        >
          Define your plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Daily Log</p>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">{dateString}</h1>
          <p className="text-muted-foreground text-sm">Logging for today only. Reflect on each entry.</p>
        </div>
      </header>

      <WeeklyProgress logs={weeklyLogs} />

      <LogForm onSubmit={handleLogSubmit} />

      {weeklyLogs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-2xl font-serif text-foreground">Log History</h2>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          {/* Budget exceeded notice in history for traceability */}
          {isBudgetExceeded && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-[1.5rem]"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Weekly Budget Exceeded</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  You spent {plan?.currency || "₦"}{totalSpent.toLocaleString()} against a {plan?.currency || "₦"}{budgetValue.toLocaleString()} budget.
                  Spending is locked until next week. Savings can still be logged.
                </p>
              </div>
            </motion.div>
          )}
          <div className="space-y-4 pb-8">
            {weeklyLogs.map((log, i) => {
              const formattedDate = formatDate(log.createdAt || log.date);

              return (
                <motion.div 
                  key={log.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 glass-card space-y-4 border-border hover:border-primary/20 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{formattedDate}</p>
                      <h3 className="text-xl font-serif text-foreground">{log.isSavings ? `💰 Saved: ${log.item}` : log.noSpendDay ? "No-Spend Day" : (log.item || "Unspecified Entry")}</h3>
                    </div>
                    <p className={cn("text-2xl font-serif", log.isSavings ? "text-emerald-500" : "text-foreground")}>
                      {log.noSpendDay ? "—" : `${log.isSavings ? "+" : ""}${plan?.currency || "₦"}${Number(log.amount).toLocaleString()}`}
                    </p>
                  </div>
                  
                  {log.isSavings ? (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                        Savings
                      </span>
                      <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                        Mood: {log.mood}
                      </span>
                    </div>
                  ) : !log.noSpendDay ? (
                    <div className="flex flex-wrap gap-2">
                      {log.category ? (
                        <>
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                            {log.trigger || log.category}
                          </span>
                          {log.subCategory && log.subCategory !== "None" && (
                            <span className="px-3 py-1 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                              {log.subCategory}
                            </span>
                          )}
                          {log.behaviorTags?.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                              {tag}
                            </span>
                          ))}
                          {log.isOverBudget && (
                            <span className="px-3 py-1 bg-red-500/10 rounded-full text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-500/20 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Over Budget
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                            {log.spendingType}
                          </span>
                          <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                            {log.decisionType}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                            Trigger: {log.trigger}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Quiet Discipline Logged</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
