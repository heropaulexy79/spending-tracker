"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Wallet, Target, TrendingUp, Zap, Calendar, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

const screens = [
  {
    id: 1,
    title: "Welcome to Crafting the Mind",
    description: "This is not just a budgeting app. This is a system designed to help you understand your spending behavior.",
    icon: <div className="w-20 h-20 bg-primary/20 rounded-[2.5rem] flex items-center justify-center border border-primary/30">
      <Target className="w-10 h-10 text-primary" />
    </div>,
  },
  {
    id: 2,
    title: "How It Works",
    description: "Every time you spend, you will log it, answer short reflection questions, and identify whether it was intentional or emotional.",
    icon: <div className="w-20 h-20 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/30">
      <TrendingUp className="w-10 h-10 text-emerald-500" />
    </div>,
  },
  {
    id: 3,
    title: "The System",
    description: "You will master 6 sections: Plan, Log, Urge Tracking, Reflection, Statistics, and Monthly Reviews.",
    items: [
      { icon: <Wallet className="w-4 h-4" />, label: "Plan" },
      { icon: <BookOpen className="w-4 h-4" />, label: "Log" },
      { icon: <Zap className="w-4 h-4" />, label: "Urge" },
      { icon: <Target className="w-4 h-4" />, label: "Reflect" },
      { icon: <TrendingUp className="w-4 h-4" />, label: "Stats" },
      { icon: <Calendar className="w-4 h-4" />, label: "Mirror" },
    ]
  },
  {
    id: 4,
    title: "What You Gain",
    description: "Consistently using this app helps you understand your money, identify emotional triggers, and build lifelong financial awareness.",
    icon: <div className="w-20 h-20 bg-primary/20 rounded-[2.5rem] flex items-center justify-center border border-primary/30">
      <CheckCircle2 className="w-10 h-10 text-primary" />
    </div>,
    button: "Start My First Entry"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const current = screens[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Progress Indicators */}
        <div className="flex gap-2 mb-12">
          {screens.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-white/10"
              )} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center flex flex-col items-center"
          >
            {current.icon && (
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="mb-8"
              >
                {current.icon}
              </motion.div>
            )}

            <h2 className="text-3xl font-bold text-white mb-4 text-gradient">
              {current.title}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-8 px-4">
              {current.description}
            </p>

            {current.items && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {current.items.map((item, i) => (
                  <div key={i} className="glass p-3 rounded-2xl flex flex-col items-center gap-2">
                    <div className="text-primary">{item.icon}</div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all group mt-auto"
        >
          {current.button || "Next Step"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
