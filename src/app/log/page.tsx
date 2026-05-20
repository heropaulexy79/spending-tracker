"use client";

import React, { useState } from "react";
import LogForm from "@/components/LogForm";
import WeeklyProgress from "@/components/WeeklyProgress";
import { motion } from "framer-motion";

import { useTracking } from "@/hooks/useTracking";
import { formatDate } from "@/lib/dateUtils";

export default function LogPage() {
  const { logs, addLog, plan, loading } = useTracking();
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogSubmit = async (data: any) => {
    await addLog(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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

      <WeeklyProgress logs={logs} />

      <LogForm onSubmit={handleLogSubmit} />

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl text-center font-medium"
        >
          Reality Logged Successfully!
        </motion.div>
      )}

      {logs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-2xl font-serif text-foreground">Log History</h2>
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <div className="space-y-4 pb-8">
            {logs.map((log, i) => {
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
                      <h3 className="text-xl font-serif text-foreground">{log.noSpendDay ? "No-Spend Day" : (log.item || "Unspecified Entry")}</h3>
                    </div>
                    <p className="text-2xl font-serif text-foreground">
                      {log.noSpendDay ? "—" : `${plan?.currency || "₦"}${Number(log.amount).toLocaleString()}`}
                    </p>
                  </div>
                  
                  {!log.noSpendDay ? (
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                        {log.spendingType}
                      </span>
                      <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                        {log.decisionType}
                      </span>
                      <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                        Trigger: {log.trigger}
                      </span>
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
