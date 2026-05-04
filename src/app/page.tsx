"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { motion } from "framer-motion";
import { Wallet, Target, TrendingUp, Zap, Calendar, User as UserIcon, Loader2 } from "lucide-react";

import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { plan, logs, loading: trackingLoading } = useTracking();
  const [hasSeenGuide, setHasSeenGuide] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(`hasSeenGuide_${user.uid}`);
      setHasSeenGuide(!!seen);
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`hasSeenGuide_${user.uid}`, "true");
      setHasSeenGuide(true);
    }
  };

  const loading = authLoading || trackingLoading;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  if (hasSeenGuide === null) return null;

  if (!hasSeenGuide) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const totalSpent = logs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const budgetValue = Number(plan?.budget) || 0;
  const resistedCount = logs.filter(l => l.decisionType === "Resisted").length;
  const totalDecisions = logs.length;
  const resistedRate = totalDecisions > 0 ? Math.round((resistedCount / totalDecisions) * 100) : 0;
  
  // Mock no-spend calculation for now based on unique dates in logs
  const noSpendDays = 0; // Logic for this would require checking missing days in logs

  return (
    <div className="space-y-8 animate-in">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Hello, {user.displayName?.split(" ")[0] || "Friend"}
          </h1>
          <p className="text-muted-foreground text-sm">Observe your patterns today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {["₦", "$", "€"].map((c) => (
              <button key={c} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xs font-bold text-white transition-all">
                {c}
              </button>
            ))}
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Weekly Budget" 
          value={`₦${budgetValue.toLocaleString()}`} 
          icon={<Wallet className="w-4 h-4" />} 
          color="text-blue-400"
          href="/plan"
        />
        <StatCard 
          label="Already Logged" 
          value={`₦${totalSpent.toLocaleString()}`} 
          icon={<TrendingUp className="w-4 h-4" />} 
          color="text-emerald-400"
          href="/log"
        />
        <StatCard 
          label="Urges Resisted" 
          value={`${resistedRate}%`} 
          icon={<Zap className="w-4 h-4" />} 
          color="text-amber-400"
          href="/urge"
        />
        <StatCard 
          label="No-Spend Days" 
          value={noSpendDays.toString()} 
          icon={<Calendar className="w-4 h-4" />} 
          color="text-purple-400"
          href="/mirror"
        />
      </div>

      {/* Behavioral Insight Banner */}
      <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target className="w-24 h-24 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Today's Focus
        </h3>
        <p className="text-white/80 leading-relaxed">
          "Pause for 10 seconds before any unplanned purchase. Ask yourself: Is this a need or a reaction?"
        </p>
      </div>

      {/* Rewards Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Rewards & Growth</h2>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 glass rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
              <span className="text-xl font-bold text-amber-500">24</span>
            </div>
            <div>
              <p className="font-bold text-white">Behavior Coins</p>
              <p className="text-xs text-muted-foreground">Keep logging consistently to unlock insights.</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["Consistency King", "Impulse Slayer", "Daily Reflector"].map((badge) => (
              <div key={badge} className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">
                🏆 {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Mini-List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Realities</h2>
          <Link href="/log" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.slice(0, 3).map((log, i) => (
              <div key={log.id || i} className="flex items-center justify-between p-4 glass rounded-2xl">
                <div>
                  <p className="font-medium text-white">{log.item || "Unspecified Item"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {new Date(log.createdAt).toLocaleDateString()} • {log.spendingType}
                  </p>
                </div>
                <p className="font-semibold text-white">{log.amount ? `₦${Number(log.amount).toLocaleString()}` : "—"}</p>
              </div>
            ))
          ) : (
            <div className="p-8 glass rounded-2xl text-center">
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
        className="p-5 glass rounded-3xl space-y-3 cursor-pointer"
      >
        <div className={cn("w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center", color)}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </motion.div>
    </Link>
  );
}
