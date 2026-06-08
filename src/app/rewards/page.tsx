"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Lock, Zap, Target, Brain, Crown } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import Link from "next/link";
import { cn } from "@/lib/utils";

const REWARD_ITEMS = [
  {
    id: "monthly_report",
    title: "Monthly Detailed Report",
    description: "Deep archetypal analysis of your monthly behavioral patterns.",
    cost: 300,
    icon: <Target className="w-6 h-6" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "impulse_challenge",
    title: "7-Day Impulse Challenge",
    description: "Guided daily exercises to build your prefrontal cortex strength.",
    cost: 200,
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "ai_insights",
    title: "AI Behavioral Insights",
    description: "Personalized patterns identified by our behavioral engine.",
    cost: 300,
    icon: <Brain className="w-6 h-6" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export default function RewardsPage() {
  const { rewards, loading } = useTracking();

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
        <div className="space-y-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground">The Vault</h1>
          <p className="text-muted-foreground text-sm">Exchange your awareness for deeper growth.</p>
        </div>
      </header>

      {/* Balance Card */}
      <section className="relative overflow-hidden">
        <div className="p-8 rounded-[2rem] bg-foreground text-background relative flex items-center justify-between shadow-2xl shadow-primary/20">
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.3em]">Available Coins</p>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <p className="text-5xl font-serif">{rewards.awarenessPoints || 0}</p>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-5%] opacity-10">
            <Crown className="w-40 h-40" />
          </div>
        </div>
      </section>

      {/* Reward Items */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Unlock Features</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {REWARD_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="p-6 glass-card border-primary/5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", item.bgColor, item.color)}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{item.description}</p>
                </div>
              </div>
              
              <button 
                disabled={ (rewards.awarenessPoints || 0) < item.cost }
                className={cn(
                  "px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  (rewards.awarenessPoints || 0) >= item.cost
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                {item.cost} Coins
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Note */}
      <section className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 text-center space-y-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif text-lg">Premium Access</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px] mx-auto">
            Premium members get instant access to all reports and 2x coin earnings on actions.
          </p>
        </div>
        <button className="px-8 py-3 bg-foreground text-background rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
          Coming Soon
        </button>
      </section>
    </div>
  );
}
