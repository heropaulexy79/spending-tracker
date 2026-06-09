"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, Target, BookOpen, Quote, Sparkles, X, ChevronRight, Brain } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLocalDateString, getWeekKey, getMonthKey } from "@/lib/dateUtils";

export default function StatsPage() {
  const { logs, urges, plan, loading } = useTracking();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentSlide, setCurrentSlide] = useState(0);

  if (loading) return null;

  const todayStr = getLocalDateString();
  const weekKey = getWeekKey();
  const monthKey = getMonthKey();

  const filteredLogs = logs.filter(l => {
    if (period === "daily") return l.date === todayStr;
    if (period === "weekly") return l.weekKey === weekKey;
    return l.monthKey === monthKey;
  });

  const filteredUrges = urges.filter(u => {
    let uDate: string;
    if (u.createdAt && typeof u.createdAt === "object" && "seconds" in u.createdAt) {
      uDate = getLocalDateString(new Date((u.createdAt as any).seconds * 1000));
    } else {
      uDate = getLocalDateString(u.createdAt ? new Date(u.createdAt) : new Date());
    }

    if (period === "daily") return uDate === todayStr;
    if (period === "weekly") return u.weekKey === weekKey;
    return u.monthKey === monthKey;
  });

  const purchases = filteredLogs.filter(l => !l.isSavings && !l.noSpendDay).length;
  const totalSpent = filteredLogs.filter(l => !l.isSavings).reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const avoidedPurchases = filteredUrges.filter(u => u.action === "Resisted").length;
  // Late urges: Delayed but then ended up in logs? 
  // Let's approximate: Delayed urges in this period.
  const unsuccessfulUrges = filteredUrges.filter(u => u.action === "Purchased");
  const unsuccessfulResistance = unsuccessfulUrges.length;
  const amountLost = unsuccessfulUrges.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const lateUrges = filteredUrges.filter(u => u.action === "Delayed").length;
  const estimatedSavings = filteredLogs.filter(l => l.isSavings).reduce((a, b) => a + (Number(b.amount) || 0), 0) + 
                           filteredUrges.filter(u => u.action === "Resisted").reduce((a, b) => a + (Number(b.amount) || 0), 0);

  // Trigger areas
  const triggers = filteredUrges.reduce((acc: any, u) => {
    if (u.type) acc[u.type] = (acc[u.type] || 0) + 1;
    return acc;
  }, {});
  const biggestTrigger = Object.entries(triggers).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "None";

  const periodData = {
    daily: { title: "Daily Pulse", subtitle: "Your awareness today." },
    weekly: { title: "Weekly Story", subtitle: "A chapter of control." },
    monthly: { title: "Monthly Vision", subtitle: "Long-term transition." },
  };

  const slides = [
    {
      type: "overview",
      title: periodData[period].title,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-5xl font-serif">{periodData[period].title}</h2>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">{periodData[period].subtitle}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="p-6 glass-card rounded-[2rem] border-primary/5 space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Purchases</p>
              <p className="text-2xl font-serif">{purchases}</p>
            </div>
            <div className="p-6 glass-card rounded-[2rem] border-primary/5 space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Resisted</p>
              <p className="text-2xl font-serif text-emerald-500">{avoidedPurchases}</p>
            </div>
            <div className="p-6 glass-card rounded-[2rem] border-primary/5 space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Spent</p>
              <p className="text-2xl font-serif">{plan?.currency || "₦"}{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-6 glass-card rounded-[2rem] border-primary/5 space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Savings</p>
              <p className="text-2xl font-serif text-emerald-500">{plan?.currency || "₦"}{estimatedSavings.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      type: "behavior",
      title: "Behavioral Insights",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Late Urges</p>
              <p className="text-3xl font-serif">{lateUrges}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Trigger</p>
              <p className="text-3xl font-serif text-primary">{biggestTrigger}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-coral-300 uppercase tracking-widest">Failed Resist</p>
              <p className="text-3xl font-serif text-coral-300">{unsuccessfulResistance}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-coral-300 uppercase tracking-widest">Amount Lost</p>
              <p className="text-3xl font-serif text-coral-300">{plan?.currency || "₦"}{amountLost.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-[200px]">Awareness is knowing where your power slipped.</p>
        </div>
      )
    },
    {
      type: "identity",
      title: "Your Identity",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="px-8 py-4 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-2xl font-serif text-primary">
              {avoidedPurchases > 5 ? "The Sovereign" : avoidedPurchases > 2 ? "The Resistor" : "The Observer"}
            </span>
          </div>
          <div className="space-y-4">
            <Quote className="w-8 h-8 text-primary/20 mx-auto" />
            <blockquote className="text-xl font-serif italic text-foreground leading-relaxed">
              &ldquo;My power comes from the space between I want and I buy.&rdquo;
            </blockquote>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
              {period === "daily" 
                ? "Today you practiced the pause. Tomorrow you'll master it."
                : "You are prioritizing long-term peace over short-term thrills."}
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:relative md:inset-auto md:min-h-[80vh] md:bg-transparent">
      {/* Progress Bars */}
      <div className="p-4 flex gap-1.5 md:px-0">
        {slides.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: i === currentSlide ? "100%" : i < currentSlide ? "100%" : "0%" }}
              transition={{ duration: i === currentSlide ? 5 : 0 }}
              onAnimationComplete={() => {
                if (i === currentSlide) nextSlide();
              }}
              className="h-full bg-primary"
            />
          </div>
        ))}
      </div>

      {/* Header / Nav */}
      <div className="px-6 py-4 flex justify-between items-center text-muted-foreground">
        <button onClick={() => window.history.back()} className="p-2 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2 bg-muted/50 p-1 rounded-full">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setCurrentSlide(0);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => window.location.href = "/"} className="p-2 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8">
        <div 
          className="absolute inset-0 z-0 flex"
          onClick={(e) => {
            const x = e.clientX;
            if (x < window.innerWidth / 3) prevSlide();
            else nextSlide();
          }}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full relative z-10 pointer-events-none"
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav - now visible on all devices with explicit buttons */}
      <div className="p-8 flex justify-between items-center bg-muted/20 border-t border-border mt-auto sm:rounded-b-[3rem] relative z-20">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100 disabled:opacity-10 transition-all bg-background px-4 py-2 rounded-full border border-border"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            {currentSlide + 1} / {slides.length}
        </div>
        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100 disabled:opacity-10 transition-all bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg shadow-primary/20"
        >
          Next <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
