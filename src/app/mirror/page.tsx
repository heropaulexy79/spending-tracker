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
    monthlyIncome, 
    preAppMonthlySpendingEstimate, 
    saveProjectionsBaseline, 
    getHistoricalData, 
    loading 
  } = useTracking();
  
  const [viewType, setViewType] = useState<'current' | 'history'>('current');
  const [historyType, setHistoryType] = useState<'week' | 'month'>('week');
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyUrges, setHistoryUrges] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Form State for Projections Baseline Setup
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [estimateInput, setEstimateInput] = useState("");
  const [isSavingBaseline, setIsSavingBaseline] = useState(false);

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

  // Pre-fill setup inputs if they exist in state
  useEffect(() => {
    if (monthlyIncome) setIncomeInput(monthlyIncome.toString());
    if (preAppMonthlySpendingEstimate) setEstimateInput(preAppMonthlySpendingEstimate.toString());
  }, [monthlyIncome, preAppMonthlySpendingEstimate]);

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

  const handleSaveBaseline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeInput || !estimateInput) return;
    
    setIsSavingBaseline(true);
    try {
      await saveProjectionsBaseline(Number(incomeInput), Number(estimateInput));
      // Give the local state a moment to sync from the Firestore update
      // this prevents the "disappearing" effect where it flips back to the form
      // before the hasSetupProjections flag catches up.
      setTimeout(() => {
        setShowSetupForm(false);
      }, 500);
    } catch (err) {
      console.error("Error saving projections baseline:", err);
    } finally {
      setIsSavingBaseline(false);
    }
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

  // Future You Projection Calculations (3 months)
  const monthlySpendingCurrent = totalSpent * 4.28; // Extrapolate current week spend to average monthly weeks
  const preAppMonthlySpend = Number(preAppMonthlySpendingEstimate) || 0;
  const income = Number(monthlyIncome) || 0;

  const preAppSavings3M = (income - preAppMonthlySpend) * 3;
  const currentSavings3M = (income - monthlySpendingCurrent) * 3;
  const adjustedSavings3M = (income - (monthlySpendingCurrent * 0.9)) * 3; // 10% reduction in current spend
  
  const hasSetupProjections = income > 0 && preAppMonthlySpend > 0;

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

      {/* NEW: "Future You" Projector Section */}
      {viewType === 'current' && (
        <section className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-serif text-foreground flex items-center gap-2">
              <Landmark className="w-6 h-6 text-primary" />
              &ldquo;Future You&rdquo; Projector
            </h2>
            {hasSetupProjections && !showSetupForm && (
              <button 
                onClick={() => setShowSetupForm(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" /> Adjust Baseline
              </button>
            )}
          </div>

          {!hasSetupProjections || showSetupForm ? (
            <motion.form 
              onSubmit={handleSaveBaseline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 glass-card space-y-6 border-primary/20"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-serif text-foreground">Project Your Financial Growth</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provide baseline estimates to enable cash flow forecasting and compare pre-app habits with your actual aware spending.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Monthly Net Income</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">{plan?.currency || "₦"}</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      required
                      value={incomeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) setIncomeInput(val);
                      }}
                      className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Est. Monthly Spending (Before Using App)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">{plan?.currency || "₦"}</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      required
                      value={estimateInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) setEstimateInput(val);
                      }}
                      className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                      placeholder="e.g. 4000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {hasSetupProjections && (
                  <button 
                    type="button"
                    onClick={() => setShowSetupForm(false)}
                    className="flex-1 py-4 bg-muted border border-border text-foreground rounded-2xl font-bold uppercase tracking-wider text-[10px] hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSavingBaseline || !incomeInput || !estimateInput}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] transition-all disabled:opacity-40"
                >
                  {isSavingBaseline ? "Calculating..." : "Project The Future"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 glass-card space-y-8 border-border"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.25em]">3-Month Projection</p>
                <h3 className="text-xl font-serif text-foreground">Future Cash Balance Comparison</h3>
              </div>

              {/* Comparative Projections Visual Bars */}
              <div className="space-y-6">
                
                {/* 1. Pre-App Baseline */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Scenario A: Pre-App Style</span>
                    <span className={cn("font-bold font-serif text-sm", preAppSavings3M >= 0 ? "text-foreground" : "text-coral")}>
                      {plan?.currency || "₦"}{preAppSavings3M.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        preAppSavings3M >= 0 ? "bg-muted-foreground/40" : "bg-coral/40"
                      )}
                      style={{ width: `${Math.max(5, Math.min(100, (Math.max(0, preAppSavings3M) / Math.max(1, adjustedSavings3M)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* 2. Current Reality */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-primary uppercase tracking-widest text-[9px]">Scenario B: Current Aware Reality</span>
                    <span className="font-bold font-serif text-sm text-primary">
                      {plan?.currency || "₦"}{Math.round(currentSavings3M).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, Math.min(100, (Math.max(0, currentSavings3M) / Math.max(1, adjustedSavings3M)) * 100))}%` }}
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(176,132,71,0.3)]"
                    />
                  </div>
                </div>

                {/* 3. One Small Change */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Scenario C: 10% Extra Restraint</span>
                    <span className="font-bold font-serif text-sm text-emerald-400">
                      {plan?.currency || "₦"}{Math.round(adjustedSavings3M).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>

              </div>

              {/* Dynamic Behavioral Summary Banner */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  {currentSavings3M > preAppSavings3M ? (
                    <>
                      By staying aware, you are projected to save an extra <span className="text-emerald-400 font-bold">{plan?.currency || "₦"}{Math.round(currentSavings3M - preAppSavings3M).toLocaleString()}</span> over the next 3 months compared to your pre-app spending estimate!
                    </>
                  ) : (
                    <>
                      Keep logging! Your projections will adjust dynamically as your actual spending habits align with your weekly budget.
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </section>
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
