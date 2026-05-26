"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, ShieldCheck, Compass, Wallet, BookOpen, Zap, Target, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "faq" | "privacy">("guide");

  const tabs = [
    { id: "guide", label: "Quick Guide", icon: Compass },
    { id: "faq", label: "FAQs", icon: HelpCircle },
    { id: "privacy", label: "Privacy & Safety", icon: ShieldCheck },
  ];

  const sections = [
    { icon: Wallet, name: "Plan", desc: "Set your weekly budget, savings targets, and spender identity. Intent starts here." },
    { icon: BookOpen, name: "Log", desc: "Record purchases (with a 10s awareness countdown), confirm No-Spend Days, or log savings contributions." },
    { icon: Zap, name: "Urge", desc: "Track when you feel an impulse but resist or delay it. Build restraint and earn coins." },
    { icon: Target, name: "Reflect", desc: "Engage in honest, emotional check-ins to evaluate the emotional triggers behind your decisions." },
    { icon: BarChart3, name: "Stats", desc: "Examine key insights, emotional roots, busiest spending days, and budget performance." },
    { icon: Calendar, name: "Mirror", desc: "Explore historical records, growth narratives, and weekly/monthly consistency metrics." },
  ];

  const faqs = [
    {
      q: "What is the purpose of S&B Tracker?",
      a: "This app is a behavioral spending-awareness tool. It goes beyond simple budgeting to help you map the emotional triggers, moods, and impulses that drive your financial decisions."
    },
    {
      q: "Why is there a 10-second countdown when logging purchases?",
      a: "The countdown acts as a pattern disruptor. By forcing a brief pause, it gives you time to ask: 'Is this a true necessity, or am I reacting to an emotion?'"
    },
    {
      q: "How do I log money that I've saved?",
      a: "In the 'Log' tab, toggle the switch at the top to 'Log Savings'. Record what you avoided spending on and the amount, which will count towards your weekly Savings Target."
    },
    {
      q: "Will my progress reset past midnight?",
      a: "No. The system uses your device's local timezone. Ticks and daily progress stay locked to your actual local calendar day."
    },
    {
      q: "What do coins and badges represent?",
      a: "These are behavioral rewards designed to reinforce discipline. Resisting urges and completing weekly journeys build your scores, keeping you engaged in your growth."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg h-[80vh] flex flex-col glass-card shadow-2xl rounded-3xl border border-primary/20 bg-background/95 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-foreground">Guidance & Insight</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">S&B Tracker Companion</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border p-2 bg-muted/30">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                      activeTab === tab.id
                        ? "bg-background text-primary shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "guide" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif text-foreground">The 6 pillars of awareness</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      S&B Tracker is structured around deliberate practices. Master each tab to gain full clarity of your financial mind:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sections.map((sec, idx) => {
                      const Icon = sec.icon;
                      return (
                        <div key={idx} className="p-4 bg-muted/40 border border-border/50 rounded-2xl flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">{sec.name}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{sec.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "faq" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif text-foreground mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-5 bg-muted/40 border border-border/50 rounded-2xl space-y-2">
                        <h4 className="font-bold text-foreground text-sm font-serif">{faq.q}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-serif text-foreground">Your Trust is Our Foundation</h4>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Guaranteed Data Privacy</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground text-sm">🔒 100% Confidential Spending Insights</p>
                    <p>
                      Your records, emotional triggers, and reflections are strictly yours. They are securely encrypted and stored inside your personal Firebase database instance. 
                    </p>
                    
                    <p className="font-bold text-foreground text-sm">🚫 No Data Monetization or Sharing</p>
                    <p>
                      We do not integrate third-party trackers, advertisers, or analytics tools. We never sell, rent, or share your financial records or emotional data with anyone.
                    </p>

                    <p className="font-bold text-foreground text-sm">⚙️ Secure Transmission</p>
                    <p>
                      All database modifications and profile synchronizations occur via secure SSL/TLS channels, utilizing verified Firebase security mechanisms.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end bg-muted/10">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
