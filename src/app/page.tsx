"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { motion } from "framer-motion";
import { Plus, Timer, Loader2, ArrowRight, Sparkles, Target, Zap, TrendingUp, Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLocalDateString, getWeekKey } from "@/lib/dateUtils";
import UrgeSavingsResolver from "@/components/UrgeSavingsResolver";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  const { user } = useAuth();
  const { 
    plan, 
    rewards, 
    logs, 
    urges, 
    loading, 
    checkedInToday, 
    addCheckIn 
  } = useTracking();

  const [checkInScore, setCheckInScore] = useState(50);
  const [hasJustCheckedIn, setHasJustCheckedIn] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preparing your space...</p>
      </div>
    );
  }

  // Stats calculation
  const currentWeekKey = getWeekKey();
  const weeklyLogs = logs.filter(l => l.weekKey === currentWeekKey);
  const urgesResisted = urges.filter(u => u.action === "Resisted").length;
  const budgetValue = Number(plan?.budget) || 0;
  const totalSpent = weeklyLogs.filter(l => !l.isSavings).reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  
  // Streak Calculation
  const getActiveStreak = () => {
    if (!logs || logs.length === 0) return 0;
    const activeDays = new Set(logs.map(l => l.date));
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = getLocalDateString(d);
      
      if (activeDays.has(dStr)) {
        streak++;
      } else if (i === 0) {
        continue; // Haven't logged today yet? Keep the streak for now
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = getActiveStreak();

  const GROWTH_LEVELS = [
    "Explorer",
    "Observer",
    "Aware",
    "Intentional",
    "Mindful",
    "Focused",
    "Conscious Spender"
  ];

  const currentLevel = GROWTH_LEVELS[Math.min(currentStreak, GROWTH_LEVELS.length) - 1] || "Explorer";

  // Behavioral Insight: Time of spending
  const getSpendingInsight = () => {
    if (logs.length === 0) return null;
    
    const hours = logs
      .filter(l => !l.isSavings && !l.noSpendDay)
      .map(l => {
        if (l.createdAt && typeof l.createdAt === "object" && "seconds" in l.createdAt) {
          return new Date(l.createdAt.seconds * 1000).getHours();
        }
        return new Date(l.date).getHours();
      });

    if (hours.length === 0) return null;

    const morning = hours.filter(h => h >= 5 && h < 12).length;
    const afternoon = hours.filter(h => h >= 12 && h < 18).length;
    const evening = hours.filter(h => h >= 18 || h < 5).length;

    if (evening > morning && evening > afternoon) {
      return {
        title: "Evening Reflection",
        message: "Most of your spending happens between 7PM and 10PM. Is this a time of stress or relaxation?",
        icon: <Timer className="w-4 h-4 text-primary" />
      };
    } else if (morning > afternoon && morning > evening) {
      return {
        title: "Morning Intentions",
        message: "You make your most intentional purchases in the morning. Great start to the day!",
        icon: <Sparkles className="w-4 h-4 text-primary" />
      };
    }
    return null;
  };

  const insight = getSpendingInsight();

  const isMonday = new Date().getDay() === 1;
  const needsWeeklyPlan = isMonday && !plan?.budget;

  const handleCheckIn = async () => {
    await addCheckIn(checkInScore);
    setHasJustCheckedIn(true);
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="pt-8 text-center sm:text-left">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Money Awareness Companion</p>
          <h1 className="text-4xl font-serif tracking-tight text-foreground">
            Hi, {user.displayName?.split(" ")[0] || "there"}
          </h1>
        </div>
      </header>

      {/* Monday Planning Call to Action */}
      {needsWeeklyPlan && (
        <section className="animate-in slide-in-from-top-4 duration-1000">
          <Link href="/plan">
            <div className="p-8 rounded-[2rem] bg-primary text-primary-foreground space-y-4 relative overflow-hidden shadow-2xl shadow-primary/20 group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                <Target className="w-16 h-16" />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 opacity-70" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Monday Intention</p>
                </div>
                <h2 className="text-2xl font-serif">Set your week&apos;s story.</h2>
                <p className="text-xs opacity-80 leading-relaxed max-w-[200px]">
                  It&apos;s Monday. A fresh start to decide how you want to move with your money.
                </p>
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  Define your plan <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Daily Check-in Slider */}
      {!checkedInToday && !hasJustCheckedIn && (
        <section className="animate-in slide-in-from-top-4 duration-700">
          <div className="p-8 rounded-[2rem] bg-foreground/5 border border-foreground/5 space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-serif">What did your money teach you today?</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ready for today&apos;s awareness check-in?</p>
            </div>
            
            <div className="px-4 space-y-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={checkInScore}
                onChange={(e) => setCheckInScore(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Heavy</span>
                <span className="text-primary font-black text-xs">{checkInScore}% Light</span>
                <span>Fluid</span>
              </div>
            </div>

            <button 
              onClick={handleCheckIn}
              className="px-8 py-3 bg-foreground text-background rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Confirm Presence
            </button>
          </div>
        </section>
      )}

      {/* Hero: Awareness Progress */}
      <section className="relative overflow-hidden group">
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 relative shadow-2xl shadow-primary/5 text-center">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-24 h-24 text-primary" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                🔥 {currentStreak} Day Awareness Streak
              </div>
              {urgesResisted > 0 && (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                   💰 {urgesResisted} Resisted Urges
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-serif text-foreground">Level: {currentLevel}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-max-w-xs mx-auto">
                {currentStreak > 0 
                  ? "Your story is becoming clearer. Every choice is data."
                  : "One minute of reflection today can change tomorrow's spending."}
              </p>
            </div>
            
            <div className="pt-2 flex flex-col items-center">
              <div className="h-1.5 w-40 bg-muted rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, (currentStreak / 7) * 100)}%` }}
                   className="h-full bg-primary"
                />
              </div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-3">{currentStreak}/7 days to reach next stage</p>
            </div>
          </div>
        </div>
      </section>

      <UrgeSavingsResolver />

      {/* Primary Actions: One Screen = One Job */}
      <section className="grid grid-cols-1 gap-4">
        <Link href="/log">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-between shadow-xl shadow-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-serif">Identify a Choice</p>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Log spending</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-40" />
          </motion.button>
        </Link>
        
        <Link href="/urge">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 glass-card flex items-center justify-between border-primary/20 rounded-[2rem]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-serif">Create a Gap</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Pause an urge</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary opacity-40" />
          </motion.button>
        </Link>
      </section>

      {/* Discovery / Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Awareness Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/rewards" className="contents">
              <DiscoveryItem 
                icon={<Sparkles className="w-4 h-4" />} 
                label="Awareness Coins" 
                value={rewards.awarenessPoints || 0} 
              />
            </Link>
            <DiscoveryItem 
              icon={<Zap className="w-4 h-4" />} 
              label="Growth Stage" 
              value={currentLevel} 
            />
          </div>

          {insight && (
            <div className="p-6 glass-card border-primary/20 bg-primary/5 rounded-[2rem] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {insight.icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{insight.title}</p>
                <p className="text-sm font-serif leading-tight">{insight.message}</p>
              </div>
            </div>
          )}

          {budgetValue > 0 ? (
            <div className="p-6 glass-card space-y-4 border-primary/10 rounded-[2rem]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-serif">Intentional Space</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {Math.round((totalSpent / budgetValue) * 100)}% Used
                </p>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalSpent / budgetValue) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-1000",
                    totalSpent > budgetValue ? "bg-red-400" : "bg-primary"
                  )}
                />
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                 Your financial story is {Math.max(0, 100 - Math.round((totalSpent / budgetValue) * 100))}% unwritten.
              </p>
            </div>
          ) : (
            <Link href="/plan" className="p-6 glass-card border-dashed border-primary/30 flex items-center justify-between group rounded-[2rem]">
              <div className="space-y-1">
                <p className="text-sm font-serif">Define your week</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Set a budget for deeper insights</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </section>

      {/* Daily Reality: Recent Logs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-serif text-foreground/80">Recent Moments</h2>
          <Link href="/stats" className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] hover:underline transition-all">View Story</Link>
        </div>
        
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.slice(0, 3).map((log, i) => (
              <motion.div 
                key={log.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-6 glass-card border-primary/5 rounded-[2rem]"
              >
                <div className="space-y-1">
                  <p className="font-bold text-foreground text-sm uppercase tracking-tight">
                    {log.isSavings ? "💰 Saved" : log.category || "Choice"}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                    {log.item || "Spending Event"}
                  </p>
                </div>
                <p className="font-serif text-lg">
                  {plan?.currency || "₦"}{Number(log.amount).toLocaleString()}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="p-10 glass-card text-center border-dashed border-border rounded-[2rem]">
              <p className="text-xs text-muted-foreground italic leading-relaxed">No entries yet.<br/>Your story starts with the first log.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

function DiscoveryItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-6 glass-card border-primary/5 flex flex-col items-center gap-3 transition-all hover:bg-primary/5 rounded-[2rem] text-center">
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-serif text-foreground">{value}</p>
      </div>
    </div>
  );
}
