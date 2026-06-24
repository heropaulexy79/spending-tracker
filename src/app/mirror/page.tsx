"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Sparkles, Heart, ShieldAlert, Zap, Lock, Info, Landmark, HelpCircle, CheckCircle, ChevronRight, Edit3 } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { getWeekKey, getMonthKey, formatDate } from "@/lib/dateUtils";
import { useEffect, useState } from "react";

export default function MirrorPage() {
  const { user } = useAuth();
  const { 
    logs: currentLogs, 
    urges: currentUrges, 
    plan, 
    getHistoricalData, 
    loading 
  } = useTracking();
  
  const [viewType, setViewType] = useState<'current' | 'history'>('current');
  const [historyType, setHistoryType] = useState<'week' | 'month'>('week');
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyUrges, setHistoryUrges] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Growth Narrative Lock (Keep for premium feel)
  const creationTime = user?.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isNarrativeLocked = Date.now() - creationTime < thirtyDaysInMs;

  const currentWeekKey = getWeekKey();
  const logs = viewType === 'current' ? currentLogs.filter(l => l.weekKey === currentWeekKey) : historyLogs;
  const urges = viewType === 'current' ? currentUrges.filter(u => u.weekKey === currentWeekKey) : historyUrges;

  useEffect(() => {
    if (viewType === 'history') {
      loadLastWeek();
    }
  }, [viewType]);

  const loadLastWeek = async () => {
    setIsFetchingHistory(true);
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - day + 1);
    const lastWeekKey = `w_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
    
    const data = await getHistoricalData('week', lastWeekKey);
    setHistoryLogs(data.logs);
    setHistoryUrges(data.urges);
    setIsFetchingHistory(false);
  };

  const loadCurrentMonth = async () => {
    setIsFetchingHistory(true);
    const data = await getHistoricalData('month', getMonthKey());
    setHistoryLogs(data.logs);
    setHistoryUrges(data.urges);
    setIsFetchingHistory(false);
  };

  if (loading) return null;

  const totalSpent = logs.filter(l => !l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const totalSavingsLogged = logs.filter(l => l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budget = Number(plan?.budget) || 0;
  const totalSaved = Math.max(0, budget - totalSpent);
  
  const adherenceRate = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const weeklyLogs = logs.filter(l => l.weekKey === currentWeekKey);
  const noSpendDays = weeklyLogs.filter(l => l.noSpendDay).length;
  
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
          <h1 className="text-4xl font-serif tracking-tight text-foreground">Behavioral Mirror</h1>
          <p className="text-muted-foreground text-sm">Review your current practice or explore past realities.</p>
        </div>
      </header>

      {/* View Selector */}
      <div className="flex p-1 bg-muted rounded-2xl border border-border">
        <button 
          onClick={() => setViewType('current')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
            viewType === 'current' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Current Week
        </button>
        <button 
          onClick={() => setViewType('history')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
            viewType === 'history' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          History Explorer
        </button>
      </div>

      {viewType === 'history' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <button 
            onClick={() => { setHistoryType('week'); loadLastWeek(); }}
            className={cn(
              "px-4 py-2 rounded-full text-[9px] font-bold uppercase border transition-all",
              historyType === 'week' ? "bg-primary/20 border-primary text-primary" : "bg-muted border-border text-muted-foreground"
            )}
          >
            Last Week
          </button>
          <button 
            onClick={() => { setHistoryType('month'); loadCurrentMonth(); }}
            className={cn(
              "px-4 py-2 rounded-full text-[9px] font-bold uppercase border transition-all",
              historyType === 'month' ? "bg-primary/20 border-primary text-primary" : "bg-muted border-border text-muted-foreground"
            )}
          >
            Current Month
          </button>
        </motion.div>
      )}

      {isFetchingHistory && (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Growth Narrative */}
      <div className="p-10 glass-card bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar className="w-32 h-32 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
          <Sparkles className="w-4 h-4" />
          {viewType === 'current' ? "Growth Narrative" : "Historical Insight"}
        </h2>
        <div className="space-y-4 text-foreground leading-relaxed max-w-[90%] font-serif text-xl">
          {isNarrativeLocked && viewType === 'current' ? (
            <div className="space-y-2">
               <p className="text-muted-foreground italic text-lg">&ldquo;Your narrative is forming. Complete your first month to reveal your growth story.&rdquo;</p>
               <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Analysis in Progress</p>
            </div>
          ) : logs.length > 0 ? (
            <p>
              &ldquo;You are {viewType === 'current' ? "becoming" : "were"} more aware of your reality. With {plan?.currency || "₦"}{totalSpent.toLocaleString()} logged, 
              you {viewType === 'current' ? "are studying" : "studied"} the subtle difference between your impulses and your true intentions.&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground italic text-lg">&ldquo;No entries found for this period.&rdquo;</p>
          )}
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 glass-card space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Total Spent</p>
          <p className="text-2xl font-serif text-foreground tracking-tight truncate">{plan?.currency || "₦"}{totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-6 glass-card space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Logged Savings</p>
          <p className="text-2xl font-serif text-emerald-400 tracking-tight truncate">{plan?.currency || "₦"}{totalSavingsLogged.toLocaleString()}</p>
        </div>
        <div className="p-6 glass-card space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.15em]">Budget Leftover</p>
          <p className="text-2xl font-serif text-foreground tracking-tight truncate">{plan?.currency || "₦"}{totalSaved.toLocaleString()}</p>
        </div>
      </div>

      {/* Behavior Consistency */}
      <section className="space-y-5">
        <h2 className="text-2xl font-serif text-foreground px-1">Consistency</h2>
        <div className="p-8 glass-card space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Budget Adherence</span>
              <span className={cn(
                "font-serif text-lg",
                adherenceRate > 100 ? "text-coral" : "text-foreground"
              )}>{adherenceRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
              <span className="text-foreground font-serif text-lg">{noSpendDays} Days</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (noSpendDays / 7) * 100)}%` }}
                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-1000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Primary Trigger</p>
              <p className="text-sm font-bold text-foreground truncate">{topTrigger}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Impulse Rate</p>
              <p className="text-sm font-bold text-foreground">{impulseRate}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Behavioral Warning/Tip */}
      {adherenceRate > 90 && viewType === 'current' && (
        <div className="p-5 rounded-2xl bg-coral/5 border border-coral/10 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-coral" />
          </div>
          <p className="text-xs text-coral-200 font-medium leading-relaxed">
            You&apos;ve utilized {adherenceRate}% of your weekly plan. This is a moment for extra pause and reflection.
          </p>
        </div>
      )}

      {/* Detailed Log List in History */}
      {viewType === 'history' && logs.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-serif text-foreground px-1">Detailed Logs</h2>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={log.id || i} className="p-5 glass-card flex justify-between items-center border-border">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {log.isSavings ? `💰 Saved: ${log.item}` : log.noSpendDay ? "No-Spend Day" : log.item}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{formatDate(log.createdAt || log.date)}</p>
                </div>
                <p className={cn("text-lg font-serif", log.isSavings ? "text-emerald-400" : "text-foreground")}>
                  {log.noSpendDay ? "—" : `${log.isSavings ? "+" : ""}${plan?.currency || "₦"}${Number(log.amount).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final Message */}
      <div className="text-center py-12 space-y-5">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400/10" />
        </div>
        <p className="text-muted-foreground italic font-serif text-lg px-10 leading-relaxed">
          &ldquo;This is not about perfection. It is about awareness and practice. Every entry is a victory for your mind.&rdquo;
        </p>
      </div>
    </div>
  );
}
