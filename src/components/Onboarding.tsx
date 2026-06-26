"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Search, 
  PenLine, 
  BookOpen, 
  LayoutDashboard, 
  Zap, 
  Coins, 
  Target,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "Welcome",
    subtitle: "Understand how you spend and why.",
    description: "S&B Tracker is your personal space to understand how you spend, why you spend, and the patterns shaping your financial life.",
    icon: Sparkles
  },
  {
    title: "Why S&B Tracker?",
    subtitle: "Discover your spending patterns.",
    description: "Most finance apps show you numbers. We help you discover the person behind those numbers. Lasting financial change starts with self-awareness.",
    icon: Search
  },
  {
    title: "Log",
    subtitle: "Record a spending entry.",
    description: "Whenever you spend money, record the amount, category, and what influenced it. The more honest your entries, the better your insights become.",
    icon: PenLine
  },
  {
    title: "Reflect",
    subtitle: "Entries become insights.",
    description: "Reflection is where your spending begins to tell a story. Notice what influences your spending, what you're doing well, and areas to improve.",
    icon: BookOpen
  },
  {
    title: "Mirror",
    subtitle: "Personalized pattern discovery.",
    description: "Mirror highlights your recurring habits, spending influences, and positive progress. It's there to help you see yourself more clearly.",
    icon: LayoutDashboard
  },
  {
    title: "Urge",
    subtitle: "Pause before acting.",
    description: "Everyone experiences spending urges. Use tools designed to help you pause, take on 7-Day Challenges, and build better habits.",
    icon: Zap
  },
  {
    title: "Coins & Rewards",
    subtitle: "Unlock extra features.",
    description: "You earn coins simply by using the app consistently. Coins unlock special experiences like AI Spending Discovery and Community Rewards.",
    icon: Coins
  },
  {
    title: "Start Your Journey",
    subtitle: "Every entry matters.",
    description: "Don't worry about logging perfectly. Be honest. Be consistent. Every entry helps you understand yourself better. Let's begin.",
    icon: Target
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const current = SLIDES[currentSlide];
  const Icon = current.icon;
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full transition-all duration-1000" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full transition-all duration-1000" />
      </div>

      {/* Top Header / Skip */}
      <div className="relative z-10 flex justify-between items-center py-4">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        {!isLast && (
          <button 
            onClick={onComplete}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(176,132,71,0.15)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                 <Icon className="w-10 h-10 text-primary relative z-10" strokeWidth={1.5} />
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              {current.title}
            </p>
            
            <h2 className="text-3xl font-bold text-foreground mb-4 font-serif tracking-tight leading-tight">
              {current.subtitle}
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 pb-8 pt-4 w-full max-w-sm mx-auto flex items-center gap-4">
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            className="w-14 h-14 shrink-0 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <button
          onClick={nextSlide}
          className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] transition-all"
        >
          {isLast ? "Begin My Journey" : "Next"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
