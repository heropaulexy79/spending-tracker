"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, Target, BookOpen, Quote, Sparkles, X, ChevronRight } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function WeeklyStoriesPage() {
  const { logs, urges, plan, loading } = useTracking();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (loading) return null;

  // Basic calculation for the "Story"
  const totalSpend = logs.filter(l => !l.isSavings).reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const resistedUrges = urges.filter(u => u.action === "Delayed" || u.action === "Resisted").length;
  const noSpendDays = logs.filter(l => l.noSpendDay).length;
  const budget = Number(plan?.budget) || 0;
  const healthRatio = budget > 0 ? (totalSpend / budget) : 0;

  const slides = [
    {
      type: "intro",
      title: "Your Week in Review",
      subtitle: "A story created by your decisions.",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
             <h2 className="text-4xl font-serif">The Chapter of Control</h2>
             <p className="text-muted-foreground italic">Every choice was a word. This is the sentence you wrote.</p>
          </div>
        </div>
      )
    },
    {
        type: "stat",
        title: "Intentionality",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="text-6xl font-serif text-primary">{resistedUrges}</div>
            <div className="space-y-2">
                <h3 className="text-2xl font-serif">Urges Paused</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    You practiced the &quot;Smart Delay&quot; {resistedUrges} times. 
                    Each pause was a victory for your future self.
                </p>
            </div>
          </div>
        )
    },
    {
        type: "stat",
        title: "The Quiet Days",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="flex gap-2">
                {[...Array(7)].map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center font-serif text-xl",
                            i < noSpendDays ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-muted border-border text-muted-foreground/30"
                        )}
                    >
                        {i < noSpendDays ? "✓" : "•"}
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-serif">{noSpendDays} No-Spend Days</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    Silence is often the loud sound of discipline. You had {noSpendDays} beautiful, quiet days.
                </p>
            </div>
          </div>
        )
    },
    {
        type: "behavior",
        title: "Your Identity",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="px-8 py-4 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-2xl font-serif text-primary">The Resistor</span>
            </div>
            <div className="space-y-4">
                <blockquote className="text-xl font-serif italic text-foreground leading-relaxed">
                    &ldquo;My power comes from the space between I want and I buy.&rdquo;
                </blockquote>
                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    You prioritize long-term peace over short-term thrills. You are becoming a master of your environment.
                </p>
            </div>
          </div>
        )
    },
    {
        type: "conclusion",
        title: "Next Week&apos;s Theme",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <Target className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-serif text-amber-500">Deep Focus</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    Next week, focus on your &quot;Food&quot; choices. They seem to be your primary response to stress.
                </p>
            </div>
            <Link href="/" className="w-full">
                <button className="w-full py-5 bg-foreground text-background rounded-2xl font-bold">
                    Finish Story
                </button>
            </Link>
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
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          {slides[currentSlide].title}
        </span>
        <button onClick={() => window.location.href = "/"} className="p-2 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8">
        <div 
          className="absolute inset-0 z-0 flex md:hidden"
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
            className="w-full h-full relative z-10"
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav for better desktop UX */}
      <div className="p-8 hidden md:flex justify-between items-center bg-muted/20 border-t border-border mt-auto rounded-b-[3rem]">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 disabled:opacity-10"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Slide {currentSlide + 1} / {slides.length}
        </div>
        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 disabled:opacity-10"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
