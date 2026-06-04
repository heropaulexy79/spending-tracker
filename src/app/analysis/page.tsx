"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTracking } from "@/hooks/useTracking";
import { Sparkles, Brain, Zap, Target, Trophy, AlertTriangle, ArrowLeft, Lightbulb, Coffee, ShoppingBag, Utensils } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DiscoveriesPage() {
  const { logs, urges, loading } = useTracking();

  const discoveries = useMemo(() => {
    // Process patterns
    const spendLogs = logs.filter(l => !l.isSavings && !l.noSpendDay);
    const impulseCount = spendLogs.filter(l => l.spendingType === "Emotional impulse").length;
    const totalSpent = spendLogs.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    
    // Pattern 1: The Stress Trigger
    const stressLogs = spendLogs.filter(l => l.mood === "Stressed" || l.mood === "Anxious");
    const stressPattern = stressLogs.length > 2;

    // Pattern 2: The Lunchtime Loop
    const foodLogs = spendLogs.filter(l => l.category === "Food & Feeding");
    const foodCycle = foodLogs.length > 4;

    // Pattern 3: The Victory
    const resistedUrges = urges.filter(u => u.action === "Resisted").length;

    return {
      impulseCount,
      totalSpent,
      stressPattern,
      foodCycle,
      resistedUrges,
      logsCount: logs.length
    };
  }, [logs, urges]);

  if (loading) return null;

  return (
    <div className="space-y-10 animate-in pb-16">
      {/* Header */}
      <header className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-primary/40" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Self-Discovery</p>
        </div>
        <h1 className="text-4xl font-serif tracking-tight text-foreground">Behavioral Discoveries</h1>
        <p className="text-muted-foreground text-sm">We&apos;ve analyzed your patterns. Here is what we found.</p>
      </header>

      {/* Discovery Cards */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* 1. The Power Card */}
        {discoveries.resistedUrges > 0 && (
          <DiscoveryCard 
            icon={<Trophy className="w-6 h-6 text-emerald-400" />}
            title="The Shield of Intent"
            tag="Strength Detected"
            description={`You resisted ${discoveries.resistedUrges} distinct impulses this month. This shows a growing "Awareness Gap"—the space where you choose who you want to be.`}
            color="bg-emerald-500/5 border-emerald-500/10"
          />
        )}

        {/* 2. The Pattern Card */}
        {discoveries.stressPattern && (
          <DiscoveryCard 
            icon={<Brain className="w-6 h-6 text-primary" />}
            title="The Stress Response"
            tag="Behavioral Loop"
            description="We noticed a correlation between high stress levels and immediate spending. Your brain is using 'The Buy' as a temporary safety valve."
            advice="Next time you feel stressed, try the 'Physical Pause' rule: Walk for 5 minutes before opening any app."
            color="bg-primary/5 border-primary/10"
          />
        )}

        {/* 3. The Habit Card */}
        {discoveries.foodCycle && (
          <DiscoveryCard 
            icon={<Utensils className="w-6 h-6 text-amber-400" />}
            title="The Daily Loop"
            tag="Habit Found"
            description="Food & Dining is your most consistent spending category. It appears to be a rhythm rather than an emergency."
            advice="Could you 'Plan the Joy'? Setting a specific budget for food treats makes them more rewarding."
            color="bg-amber-400/5 border-amber-400/10"
          />
        )}

        {/* 4. The Awareness Card */}
        <DiscoveryCard 
          icon={<Sparkles className="w-6 h-6 text-purple-400" />}
          title="The Watcher"
          tag="Identity Update"
          description={`You have recorded ${discoveries.logsCount} moments of awareness. Regardless of the amount, the act of looking is the victory.`}
          color="bg-purple-500/5 border-purple-500/10"
        />

        {/* Empty State / Not enough data */}
        {discoveries.logsCount < 5 && (
            <div className="p-12 glass-card text-center space-y-4 border-dashed">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Lightbulb className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-serif text-lg">Still Observing...</h3>
                    <p className="text-sm text-muted-foreground">Keep logging your spending and moods. We need a few more days to map your behavioral DNA.</p>
                </div>
            </div>
        )}
      </div>

      {/* Proactive Identity Quote */}
      <div className="py-12 px-8 bg-foreground/5 rounded-[2.5rem] border border-foreground/5 text-center space-y-6">
        <div className="max-w-xs mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Core Philosophy</span>
            <blockquote className="mt-4 text-xl font-serif italic text-foreground leading-relaxed">
                &ldquo;You are not your spending. You are the one who notices the urge.&rdquo;
            </blockquote>
        </div>
      </div>
    </div>
  );
}

function DiscoveryCard({ icon, title, tag, description, advice, color }: { 
  icon: React.ReactNode, 
  title: string, 
  tag: string,
  description: string, 
  advice?: string,
  color: string 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("p-8 rounded-[2.5rem] border space-y-6 transition-all hover:scale-[1.01]", color)}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-sm">
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-3 py-1 bg-background/30 rounded-full border border-current/10">{tag}</span>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-serif text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {advice && (
        <div className="pt-6 border-t border-current/5 flex gap-4 items-start">
            <Zap className="w-5 h-5 text-current mt-1 flex-shrink-0" />
            <p className="text-sm font-medium italic opacity-80">
                <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">Growth Tip</span>
                {advice}
            </p>
        </div>
      )}
    </motion.div>
  );
}
