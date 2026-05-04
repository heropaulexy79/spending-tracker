"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Brain, LayoutDashboard, TrendingUp } from "lucide-react";

const steps = [
  {
    title: "Welcome to Crafting the Mind",
    description: "This is not just a budgeting app. This is a system designed to help you understand your spending behavior.",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    bg: "from-blue-600/20 to-indigo-600/20",
  },
  {
    title: "How It Works",
    description: "Every time you spend, you will log it and answer short reflection questions to identify whether it was intentional or emotional.",
    icon: <Brain className="w-12 h-12 text-purple-400" />,
    bg: "from-purple-600/20 to-pink-600/20",
  },
  {
    title: "What's Inside",
    description: "6 sections: Plan, Log, Urge, Reflection, Statistics, and Monthly Review. Each designed to reveal your patterns.",
    icon: <LayoutDashboard className="w-12 h-12 text-emerald-400" />,
    bg: "from-emerald-600/20 to-teal-600/20",
  },
  {
    title: "What You Gain",
    description: "By using this consistently, you'll understand your triggers, build awareness, and improve your financial decision-making.",
    icon: <TrendingUp className="w-12 h-12 text-amber-400" />,
    bg: "from-amber-600/20 to-orange-600/20",
    button: "Start My First Entry",
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`w-full max-w-md p-8 rounded-3xl glass relative overflow-hidden flex flex-col items-center text-center`}
        >
          {/* Background Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${step.bg} -z-10 blur-3xl opacity-50`} />

          <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
            {step.icon}
          </div>

          <h2 className="text-2xl font-bold mb-4 text-white leading-tight">
            {step.title}
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            {step.description}
          </p>

          <div className="flex gap-2 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-primary" : "w-2 bg-white/10"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 group"
          >
            {step.button || "Next"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
