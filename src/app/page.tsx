"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { motion } from "framer-motion";
import { Plus, Timer, Loader2, ArrowRight, Sparkles, Target, Zap, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLocalDateString, getWeekKey } from "@/lib/dateUtils";

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

  const handleCheckIn = async () => {
    await addCheckIn(checkInScore);
    setHasJustCheckedIn(true);
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="pt-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Money Awareness Companion</p>
          <h1 className="text-4xl font-serif tracking-tight text-foreground">
            Hi, {user.displayName?.split(" ")[0] || "there"}
          </h1>
        </div>
      </header>

      {/* Daily Check-in Slider */}
      {!checkedInToday && !hasJustCheckedIn && (
        <section className="animate-in slide-in-from-top-4 duration-700">
          <div className="p-8 rounded-[2rem] bg-foreground/5 border border-foreground/5 space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-serif">How is your relationship with money today?</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Slide to record your presence</p>
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
              Confirm Feeling
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
                🔥 {currentStreak} Day Streak
              </div>
              {urgesResisted > 0 && (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  ✨ {urgesResisted} Urges Resisted
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-serif text-foreground">You&apos;re building presence.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {currentStreak > 0 
                  ? "Every entry is a moment of awareness. Keep your momentum."
                  : "Start your awareness journey today by logging your first spending."}
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
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-3">{currentStreak}/7 days for next level</p>
            </div>
          </div>
        </div>
      </section>

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
                <p className="text-lg font-serif">Log Spending</p>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Identify a choice</p>
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
                <p className="text-lg font-serif">Pause an Urge</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Create a gap</p>
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
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Current Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/rewards" className="contents">
              <DiscoveryItem 
                icon={<Sparkles className="w-4 h-4" />} 
                label="Points" 
                value={rewards.awarenessPoints || 0} 
              />
            </Link>
            <DiscoveryItem 
              icon={<Zap className="w-4 h-4" />} 
              label="Level" 
              value={currentStreak >= 7 ? "Zen" : "Beginner"} 
            />
          </div>

          {budgetValue > 0 ? (
            <div className="p-6 glass-card space-y-4 border-primary/10 rounded-[2rem]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-serif">Weekly Intentions</p>
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
                &ldquo;You&apos;ve aligned {Math.max(0, 100 - Math.round((totalSpent / budgetValue) * 100))}% of your remaining space.&rdquo;
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
