"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col items-center text-center w-full"
        >
          <motion.div 
            initial={{ scale: 0.8 }} 
            animate={{ scale: 1 }} 
            className="mb-8"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-[2.5rem] flex items-center justify-center border border-primary/30">
              <Target className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <h2 className="text-4xl font-bold text-foreground mb-4 text-gradient font-serif">
            Understand why you spend.
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 px-2 font-medium">
            Build healthier money habits one decision at a time.
          </p>

          <button
            onClick={onComplete}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] transition-all group mt-auto"
          >
            Start My Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
