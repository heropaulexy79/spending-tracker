"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { motion } from "framer-motion";
import { Wallet, Target, TrendingUp, Zap, Calendar, User as UserIcon, Loader2, ArrowRight } from "lucide-react";

import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user } = useAuth();
  const { plan, logs } = useTracking();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <AuthForm />
      </div>
    );
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
      <header className="flex justify-between items-start pt-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            Hello, {user.displayName?.split(" ")[0] || "Friend"}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Observe your patterns today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => signOut(auth)}
            className="p-3 rounded-2xl glass hover:bg-white/10 transition-colors"
          >
            <UserIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Mindset Card */}
      <section className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Current Mindset</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white tracking-tighter">{plan?.spenderType || "Balanced"}</span>
          </div>
          <p className="text-muted-foreground max-w-[280px] leading-relaxed">
            {plan?.spenderType === "Strict" 
              ? "High-discipline mode active. Focus on core needs." 
              : "Maintaining intentional balance between needs and joys."}
          </p>
          <Link 
            href="/plan" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-primary/20 hover:bg-primary/30 border border-primary/30 px-5 py-2.5 rounded-full transition-all"
          >
            Refine Intent <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Weekly Plan" 
          value={`₦${budgetValue.toLocaleString()}`} 
          icon={<Wallet className="w-4 h-4" />} 
          color="text-primary"
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
          label="Days Aware" 
          value={noSpendDays.toString()} 
          icon={<Calendar className="w-4 h-4" />} 
          color="text-coral-400"
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
        className="p-6 glass-card space-y-4 cursor-pointer group"
      >
        <div className={cn("w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10", color)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-2">{label}</p>
        </div>
      </motion.div>
    </Link>
  );
}
