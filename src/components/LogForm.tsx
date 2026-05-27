"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTracking } from "@/hooks/useTracking";
import { getLocalDateString } from "@/lib/dateUtils";

const NIGERIAN_CATEGORIES: Record<string, string[]> = {
  "Food & Feeding": ["Groceries / foodstuff", "Restaurant", "Street food", "Delivery", "Snacks & drinks", "Market runs"],
  "Transport & Movement": ["Public transport", "Bolt/Uber/taxi", "Fuel", "Car maintenance", "Bike transport", "Travel"],
  "Bills & Utilities": ["Electricity", "Generator fuel", "Water", "Rent", "Data", "Recharge card", "Subscriptions"],
  "Family & Support": ["Sending money home", "Family support", "Children/school needs", "Emergency support", "Gifts"],
  "Lifestyle & Social Life": ["Aso-ebi & events", "Outings", "Fashion", "Hair & beauty", "Entertainment", "Birthdays", "Flexing"],
  "Business & Hustle": ["Inventory/materials", "Logistics", "Ads/promotion", "Work tools", "Client-related spending", "Staff/support"],
  "Health & Wellness": ["Medication", "Hospital", "Fitness", "Therapy/self-care", "Pharmacy", "Toiletries"],
  "Faith & Giving": ["Church/mosque giving", "Offering/tithe", "Donations", "Community support"],
  "Personal Growth": ["Courses", "Books", "Learning", "Mentorship", "Career development"],
  "Savings & Goals": ["Savings", "Emergency funds", "Investment", "Target goals"],
  "Impulse & Unexpected Spending": ["Impulse buying", "Random online shopping", "I don’t know where it went", "Unplanned spending"],
  "Others (custom spending)": []
};

const BEHAVIOR_TAGS = [
  "Was it Needed",
  "Was it Impulse",
  "Was it Emotional",
  "Was it Planned",
  "Was it Social pressure",
  "Was it survival mood",
  "Was it Investment in self"
];

const moods = ["Calm", "Anxious", "Exhausted", "Happy", "Stressed", "Bored"];

const PAUSE_QUOTES = [
  "Is this a want or a need?",
  "Pause. Breathe. Decide.",
  "Your future self is watching.",
  "Discipline is choosing between what you want now and what you want most.",
  "Awareness is the first step to change.",
  "The space between stimulus and response is where your power lies.",
  "Ownership of your choices is the path to freedom."
];

export default function LogForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { noSpendDayLogged, spendLoggedToday, plan, logs } = useTracking();
  const [logMode, setLogMode] = useState<"spend" | "save">("spend");
  const [isPausing, setIsPausing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<{
    item: string;
    amount: string;
    category: string;
    subCategory: string;
    behaviorTags: string[];
    mood: string;
    noSpendDay: boolean;
  }>({
    item: "",
    amount: "",
    category: Object.keys(NIGERIAN_CATEGORIES)[0],
    subCategory: NIGERIAN_CATEGORIES[Object.keys(NIGERIAN_CATEGORIES)[0]][0],
    behaviorTags: [],
    mood: "Calm",
    noSpendDay: false,
  });

  const today = new Date();
  const totalSpent = logs?.reduce((acc, log) => acc + (Number(log.amount) || 0), 0) || 0;
  const budget = Number(plan?.budget) || 0;
  const isOverBudget = budget > 0 && totalSpent >= budget;

  const dateString = today.toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    if (isPausing) {
      setCurrentQuote(PAUSE_QUOTES[Math.floor(Math.random() * PAUSE_QUOTES.length)]);
    }
  }, [isPausing]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPausing && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (isPausing && countdown === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isPausing, countdown]);

  const handleSubmit = (e?: React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    
    let dataToSubmit: any;
    if (logMode === "save") {
      dataToSubmit = {
        item: formData.item || "Savings Contribution",
        amount: formData.amount,
        category: "Savings & Goals",
        subCategory: "Savings",
        behaviorTags: ["Was it Planned", "Was it Investment in self"],
        spendingType: "Savings",
        mood: formData.mood,
        noSpendDay: false,
        isSavings: true,
        date: getLocalDateString()
      };
    } else {
      dataToSubmit = formData.noSpendDay 
        ? { 
            ...formData, 
            item: "No-Spend Day", 
            amount: "0", 
            spendingType: "Need",
            category: "None",
            subCategory: "None",
            isSavings: false,
            date: getLocalDateString() 
          }
        : { 
            ...formData, 
            item: formData.item || formData.subCategory || formData.category,
            spendingType: formData.category, 
            isSavings: false, 
            date: getLocalDateString() 
          };
    }
      
    onSubmit(dataToSubmit);
    setIsPausing(false);
    setCountdown(10);
    setIsSubmitted(true);
    // Reset form after delay
    setTimeout(() => {
      setFormData({
        item: "",
        amount: "",
        category: Object.keys(NIGERIAN_CATEGORIES)[0],
        subCategory: NIGERIAN_CATEGORIES[Object.keys(NIGERIAN_CATEGORIES)[0]][0],
        behaviorTags: [],
        mood: "Calm",
        noSpendDay: false,
      });
      setIsSubmitted(false);
    }, 5000);
  };

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (logMode === "save") {
      if (!formData.item || !formData.amount) return;
      handleSubmit();
    } else {
      if (!formData.noSpendDay && !formData.amount) return;
      setIsPausing(true);
    }
  };

  if (!plan?.spenderType) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass-card text-center space-y-6 max-w-lg mx-auto border-amber-500/20 mt-8"
      >
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-foreground">Set Your Intentions First</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Before tracking your daily spending, you must decide who you want to be this week. 
            Choose your Spender Identity to align your daily choices with your goals.
          </p>
        </div>
        <a 
          href="/plan"
          className="inline-block mt-4 w-full py-5 rounded-2xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-[0_0_25px_rgba(202,138,4,0.2)]"
        >
          Choose Spender Identity
        </a>
      </motion.div>
    );
  }

  if (noSpendDayLogged) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass-card text-center space-y-6 max-w-lg mx-auto border-emerald-500/20"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-foreground">🟢 No-Buy Day Recorded</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No further input required for today.<br />
            Your discipline is the foundation of your growth.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{dateString}</p>
        </div>
      </motion.div>
    );
  }

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass-card text-center space-y-6 max-w-lg mx-auto border-primary/20"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/20">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-foreground">Entry Recorded</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your reality has been logged. <br />
            Take a breath before your next choice.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form className="space-y-6 max-w-lg mx-auto p-8 glass-card animate-in">
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Practice Awareness</p>
        <h3 className="text-2xl font-serif text-foreground">{dateString}</h3>
      </div>

      {/* Segmented Control for Spend/Save */}
      <div className="flex p-1 bg-muted rounded-2xl border border-border">
        <button
          type="button"
          onClick={() => { setLogMode("spend"); setFormData(prev => ({ ...prev, noSpendDay: false })); }}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
            logMode === "spend" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          💸 Daily Spending
        </button>
        <button
          type="button"
          onClick={() => { setLogMode("save"); setFormData(prev => ({ ...prev, noSpendDay: false })); }}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
            logMode === "save" ? "bg-background text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          💰 Daily Savings
        </button>
      </div>

      {logMode === "spend" && (
        <div className="flex justify-end items-center mb-6">
          <label className={cn(
            "flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-colors",
            spendLoggedToday || (isOverBudget && !formData.noSpendDay) ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground cursor-pointer hover:text-foreground"
          )}>
            <input
              type="checkbox"
              checked={formData.noSpendDay}
              disabled={spendLoggedToday}
              onChange={(e) => setFormData({ ...formData, noSpendDay: e.target.checked })}
              className="w-5 h-5 rounded-lg border-border bg-muted text-primary focus:ring-primary transition-all disabled:opacity-30"
            />
            No-Spend Day
          </label>
        </div>
      )}

      {logMode === "spend" && isOverBudget && !formData.noSpendDay && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-coral/10 border border-coral/20 rounded-2xl flex items-start gap-3 mb-6"
        >
          <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-coral uppercase tracking-wider">Weekly Budget Depleted</p>
            <p className="text-[11px] text-coral-200/70 leading-relaxed">
              You have reached your spending limit for this week. Purchase logging is disabled to protect your intentions. You may still log a No-Spend Day or increase your budget in the Plan section.
            </p>
          </div>
        </motion.div>
      )}

      {logMode === "save" ? (
        <>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">What did you save money on?</label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="e.g. Skipped takeout, prepared lunch at home"
                className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Amount Saved</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">{plan?.currency || "₦"}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setFormData({ ...formData, amount: val });
                    }
                  }}
                  placeholder="0.00"
                  className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">How do you feel about saving today?</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                      formData.mood === m
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                        : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitialClick}
            disabled={!formData.item || !formData.amount}
            className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-4 bg-emerald-600 hover:bg-emerald-500 text-foreground shadow-[0_0_25px_rgba(16,185,129,0.2)] active:scale-[0.98]"
          >
            Log Savings Contribution
          </button>
        </>
      ) : !formData.noSpendDay ? (
        <>
          <div className="space-y-5">
            {/* Statement heading — no input box */}
            <div className="pb-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 ml-1">What did you spend on today?</p>
              <p className="text-sm text-foreground/60 font-serif px-1 leading-relaxed">Select a category that best describes your spending.</p>
            </div>

            {/* 1. Category + Sub-group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setFormData({ 
                      ...formData, 
                      category: newCat,
                      subCategory: NIGERIAN_CATEGORIES[newCat]?.[0] || "None"
                    });
                  }}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-4 text-foreground outline-none focus:border-primary/50 appearance-none cursor-pointer"
                >
                  {Object.keys(NIGERIAN_CATEGORIES).map((c) => <option key={c} value={c} className="bg-background text-foreground">{c}</option>)}
                </select>
              </div>
              
              {NIGERIAN_CATEGORIES[formData.category]?.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Sub-group</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full bg-muted border border-border rounded-2xl px-4 py-4 text-foreground outline-none focus:border-primary/50 appearance-none cursor-pointer"
                  >
                    {NIGERIAN_CATEGORIES[formData.category].map((sc) => <option key={sc} value={sc} className="bg-background text-foreground">{sc}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Amount */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">{plan?.currency || "₦"}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setFormData({ ...formData, amount: val });
                    }
                  }}
                  placeholder="0.00"
                  className="w-full bg-muted border border-border rounded-2xl pl-10 pr-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* 3. Behavioral Tags */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Behavior Tags (Select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {BEHAVIOR_TAGS.map((t) => {
                  const isSelected = formData.behaviorTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          behaviorTags: isSelected 
                            ? prev.behaviorTags.filter(tag => tag !== t)
                            : [...prev.behaviorTags, t]
                        }))
                      }}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                        isSelected
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Current Mood */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Current Mood</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                      formData.mood === m
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitialClick}
            disabled={isPausing || (isOverBudget && !formData.noSpendDay)}
            className={cn(
              "w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden mt-4 shadow-lg",
              isPausing ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
              (isOverBudget && !formData.noSpendDay) ? "bg-coral/10 text-coral border border-coral/20 cursor-not-allowed" :
              "bg-primary text-primary-foreground hover:shadow-primary/30 active:scale-[0.98]"
            )}
          >
            {isOverBudget && !formData.noSpendDay ? (
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Budget Depleted
                </span>
                <span className="text-[9px] font-normal opacity-70">Increase budget or log as No-Spend Day</span>
              </div>
            ) : isPausing ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 animate-pulse" />
                  <span>Pausing for awareness... {countdown}s</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={currentQuote}
                  className="text-[11px] italic text-amber-200/70 max-w-[80%] mx-auto font-serif"
                >
                  &ldquo;{currentQuote}&rdquo;
                </motion.p>
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
            ) : (
              "Track today's spending"
            )}
          </button>
          
          {isPausing && (
            <button
              type="button"
              onClick={() => setIsPausing(false)}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel and rethink
            </button>
          )}
        </>
      ) : (
        <div className="py-10 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-serif text-foreground">Quiet Discipline</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">Great job on a no-spend day. Your future self thanks you.</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-5 bg-emerald-600 text-foreground rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            Confirm No-Spend Day
          </button>
        </div>
      )}
    </form>
  );
}
