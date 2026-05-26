"use client";

import { useState, useEffect, useRef } from "react";
import Onboarding from "@/components/Onboarding";
import AuthForm from "@/components/AuthForm";
import Reminders from "@/components/Reminders";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Target, TrendingUp, Zap, Calendar, User as UserIcon, Loader2, ArrowRight, LogOut, Key, Settings, Coins, Award, Sparkles } from "lucide-react";

import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { formatDate, getLocalDateString } from "@/lib/dateUtils";

export default function Home() {
  const { user } = useAuth();
  const { plan, rewards, logs, urges, loading } = useTracking();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalSpent = logs.filter(l => !l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const totalSavings = logs.filter(l => l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budgetValue = Number(plan?.budget) || 0;
  
  const logsResisted = logs.filter(l => l.decisionType === "Resisted").length;
  const urgesResisted = urges.filter(u => u.action === "Resisted").length;
  const totalDecisions = logs.length + urges.length;
  const totalResisted = logsResisted + urgesResisted;
  const resistedRate = totalDecisions > 0 ? Math.round((totalResisted / totalDecisions) * 100) : 0;
  
  const noSpendDays = logs.filter(l => l.noSpendDay).length;

  const isWithinBudget = budgetValue > 0 && totalSpent <= budgetValue;
  const hasResistedUrges = urgesResisted > 0;

  const isMonday = new Date().getDay() === 1;

  // Streak Calculation (Daily spending <= (weekly budget / 7) OR No-Spend Day)
  const getActiveStreak = () => {
    if (!logs || logs.length === 0) return 0;
    const dailySpend: Record<string, number> = {};
    const hasNoSpendLog: Record<string, boolean> = {};
    
    logs.forEach(l => {
      if (l.isSavings) return;
      const dStr = l.date;
      if (!dStr) return;
      if (l.noSpendDay) {
        hasNoSpendLog[dStr] = true;
      } else {
        dailySpend[dStr] = (dailySpend[dStr] || 0) + (Number(l.amount) || 0);
      }
    });

    const dailyBudget = budgetValue > 0 ? budgetValue / 7 : Infinity;
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = getLocalDateString(d);
      
      const spent = dailySpend[dStr] || 0;
      const isNoSpend = hasNoSpendLog[dStr] || false;
      const hasLogsForDay = (spent > 0 || isNoSpend);
      
      if (i === 0 && !hasLogsForDay) {
        continue; // Don't break if they haven't logged today yet
      }
      
      if (isNoSpend || (hasLogsForDay && spent <= dailyBudget)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = getActiveStreak();

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="flex justify-between items-start pt-4 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary/40" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Dashboard</p>
          </div>
          <h1 className="text-4xl font-serif tracking-tight text-foreground">
            Hello, {user.displayName?.split(" ")[0] || "Friend"}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-muted-foreground text-sm font-medium">Observe your patterns with intention.</p>
            {currentStreak > 0 ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-bold uppercase tracking-wider"
              >
                🔥 {currentStreak} Day Streak
              </motion.div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted border border-border text-muted-foreground rounded-full text-[9px] font-bold uppercase tracking-wider">
                🌱 Start Streak
              </div>
            )}
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-3 rounded-2xl glass-card hover:bg-muted transition-all active:scale-95"
          >
            <UserIcon className="w-5 h-5 text-foreground" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 glass-card rounded-[1.5rem] p-2 shadow-2xl z-50 border border-border"
              >
                <div className="p-4 border-b border-border mb-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Identity</p>
                  <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                </div>
                
                <Link 
                  href="/settings"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  Profile
                </Link>
                <Link 
                  href="/settings"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <Settings className="w-4 h-4 text-primary" />
                  Settings
                </Link>
                
                <div className="h-[1px] bg-border my-1 mx-2" />
                
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-coral/10 text-coral transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <Reminders />

      {isMonday && logs.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-serif tracking-tight">A Fresh Start</h2>
            <p className="text-sm opacity-90 leading-relaxed max-w-[280px]">
              It&apos;s a new week. Your logs are cleared, and your mind is ready. Review your plan to set your intentions for the next 7 days.
            </p>
            <Link 
              href="/plan" 
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-background text-primary px-6 py-3 rounded-full hover:opacity-90 transition-all"
            >
              Review Weekly Plan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Behavioral Rewards & Feedback */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 flex items-center gap-4 bg-amber-500/5 border-amber-500/10">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Coins</p>
            <p className="text-xl font-serif text-foreground">{rewards.coins || 0}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 bg-primary/5 border-primary/10">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Badges</p>
            <p className="text-xl font-serif text-foreground">{rewards.badges?.length || 0}</p>
          </div>
        </div>
      </section>

      {/* Behavioral Feedback */}
      <AnimatePresence>
        {(isWithinBudget || hasResistedUrges) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-1">Excellent Practice</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isWithinBudget && hasResistedUrges 
                  ? "You stayed within budget AND mastered your impulses this week. Exceptional discipline."
                  : isWithinBudget 
                    ? "You stayed within budget this week. Your future self is proud."
                    : "Your impulse spending reduced. You are reclaiming control."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mindset Card */}
      <section className="glass-card p-10 relative overflow-hidden group border-primary/10">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-48 h-48 text-primary" />
        </div>
        <div className="relative z-10 space-y-5">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Current Mindset</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif text-foreground tracking-tight">{plan?.spenderType || "Balanced"}</span>
            </div>
          </div>
          <p className="text-muted-foreground max-w-[300px] leading-relaxed text-sm">
            {plan?.spenderType === "Strict" 
              ? "High-discipline mode active. Every decision is intentional." 
              : "Maintaining a conscious balance between necessity and joy."}
          </p>
          <Link 
            href="/plan" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground bg-primary/20 hover:bg-primary/30 border border-primary/20 px-6 py-3 rounded-full transition-all"
          >
            Refine Intent <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Spending Velocity Meter */}
      {budgetValue > 0 && (
        <section className="glass-card p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Spending Velocity</h2>
              <p className="text-xl font-serif text-foreground">
                {totalSpent > budgetValue ? "Tank Empty" : totalSpent / budgetValue > (new Date().getDay() || 7) / 7 ? "Overspeeding" : "Cruising"}
              </p>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Week Progress: {Math.round(((new Date().getDay() || 7) / 7) * 100)}%
            </p>
          </div>
          
          <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden border border-border">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (totalSpent / budgetValue) * 100)}%` }}
              className={cn(
                "h-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                (totalSpent / budgetValue) > (new Date().getDay() || 7) / 7 
                  ? "bg-coral shadow-coral/20" 
                  : (totalSpent / budgetValue) > 0.8 
                    ? "bg-amber-500 shadow-amber-500/20"
                    : "bg-emerald-500 shadow-emerald-500/20"
              )}
            />
            {/* Week Progress Marker */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-foreground/20 z-10"
              style={{ left: `${((new Date().getDay() || 7) / 7) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <span>Fuel Tank (Budget)</span>
            <span>{plan?.currency || "₦"}{totalSpent.toLocaleString()} / {plan?.currency || "₦"}{budgetValue.toLocaleString()}</span>
          </div>
        </section>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Weekly Plan" 
          value={`${plan?.currency || "₦"}${budgetValue.toLocaleString()}`} 
          icon={<Wallet className="w-4 h-4" />} 
          color="text-primary"
          href="/plan"
        />
        <StatCard 
          label="Already Logged" 
          value={`${plan?.currency || "₦"}${totalSpent.toLocaleString()}`} 
          icon={<TrendingUp className="w-4 h-4" />} 
          color="text-coral-400"
          href="/log"
        />
        <StatCard 
          label="Impulse Slayer" 
          value={`${resistedRate}%`} 
          icon={<Zap className="w-4 h-4" />} 
          color="text-amber-400"
          href="/urge"
        />
        <StatCard 
          label="Days Aware" 
          value={noSpendDays.toString()} 
          icon={<Calendar className="w-4 h-4" />} 
          color="text-purple-400"
          href="/mirror"
        />
        <div className="col-span-2">
          <StatCard 
            label="Logged Savings" 
            value={`${plan?.currency || "₦"}${totalSavings.toLocaleString()}`} 
            icon={<Coins className="w-4 h-4" />} 
            color="text-emerald-400"
            href="/log"
          />
        </div>
      </div>

      {/* Behavioral Insight Banner */}
      <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-24 h-24 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
          <Target className="w-4 h-4" />
          Today&apos;s Focus
        </h3>
        <p className="text-foreground/80 leading-relaxed font-serif text-lg">
          &ldquo;Pause for 10 seconds before any unplanned purchase. Ask yourself: Is this a need or a reaction?&rdquo;
        </p>
      </div>

      {/* Recent Activity Mini-List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-serif text-foreground">Recent Realities</h2>
          <Link href="/log" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.slice(0, 3).map((log, i) => (
              <div key={log.id || i} className="flex items-center justify-between p-5 glass-card">
                <div className="space-y-1">
                  <p className="font-bold text-foreground text-sm">
                    {log.isSavings ? `💰 Saved: ${log.item}` : log.noSpendDay ? "No-Spend Day" : (log.item || "Unspecified Item")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {formatDate(log.createdAt || log.date)} • {log.isSavings ? "Savings" : log.spendingType}
                  </p>
                </div>
                <p className={cn("font-serif text-lg", log.isSavings ? "text-emerald-400" : "text-foreground")}>
                  {log.amount ? `${log.isSavings ? "+" : ""}${plan?.currency || "₦"}${Number(log.amount).toLocaleString()}` : "—"}
                </p>
              </div>
            ))
          ) : (
            <div className="p-10 glass-card text-center border-dashed border-border">
              <p className="text-muted-foreground text-sm italic">No entries yet. Start logging your reality.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color, href }: { label: string, value: string, icon: React.ReactNode, color: string, href: string }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 glass-card space-y-4 cursor-pointer group"
      >
        <div className={cn("w-10 h-10 rounded-2xl bg-muted flex items-center justify-center transition-colors group-hover:bg-muted/80", color)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-serif text-foreground tracking-tight leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-3">{label}</p>
        </div>
      </motion.div>
    </Link>
  );
}
