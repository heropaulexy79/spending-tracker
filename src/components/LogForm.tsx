"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, X, Sparkles, AlertTriangle, TrendingDown, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";
import { getLocalDateString, getWeekKey } from "@/lib/dateUtils";

type CategoryData = {
  emoji: string;
  color: string;
  subQuestion: string;
  subCategories: string[];
  triggerQuestion: string;
  triggers: string[];
};

const CATEGORY_FLOW: Record<string, CategoryData> = {
  "Food": {
    emoji: "🍱", color: "bg-orange-500/10 text-orange-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Lunch at work/school", "Food delivery", "Eating out", "Snacks & drinks", "Groceries/Foodstuff", "others"],
    triggerQuestion: "What influenced this spending?",
    triggers: ["Hunger", "Convenience", "Stress", "Social outing", "Rewarding myself", "No food at home", "Craving", "others"]
  },
  "Transport": {
    emoji: "🚌", color: "bg-blue-500/10 text-blue-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Bus", "Bolt/Uber", "Fuel purchase", "Bike/Keke", "Travel", "others"],
    triggerQuestion: "What influenced this spending?",
    triggers: ["Running late", "Comfort", "Work/School", "Safety", "Weather", "Emergency movement", "Distance", "others"]
  },
  "Bills & Living": {
    emoji: "🧾", color: "bg-sky-500/10 text-sky-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Data/Airtime", "Subscriptions", "Electricity", "Rent", "Generator fuel", "Others"],
    triggerQuestion: "How would you describe this spending?",
    triggers: ["Monthly routine", "Planned expense", "Family responsibility", "Unexpected bill", "Essential need", "others"]
  },
  "Growth": {
    emoji: "📚", color: "bg-violet-500/10 text-violet-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Books", "Online course", "Data for learning", "Mentorship/coaching", "Professional certification", "others"],
    triggerQuestion: "What motivated this spending?",
    triggers: ["Learning", "Career growth", "Business growth", "Personal development", "Curiosity", "others"]
  },
  "Family": {
    emoji: "❤️", color: "bg-rose-500/10 text-rose-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Sending money home", "Family support", "School fees", "Medical support", "Family celebration", "others"],
    triggerQuestion: "What influenced this support?",
    triggers: ["Responsibility", "Family request", "Emergency", "Celebration", "Love and care", "Obligation", "Special occasion", "others"]
  },
  "HOME": {
    emoji: "🏠", color: "bg-emerald-500/10 text-emerald-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Electricity", "Rent", "Generator Fuel", "Household Supplies", "Home Repairs/Maintenance", "others"],
    triggerQuestion: "What influenced this spending?",
    triggers: ["Essential household need", "Monthly routine", "Family responsibility", "Planned expense", "Unexpected issue", "Emergency", "others"]
  },
  "Giving": {
    emoji: "🤲", color: "bg-amber-500/10 text-amber-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Offering", "Tithe", "Charity donation", "Community contribution", "Support for someone in need", "others"],
    triggerQuestion: "What inspired this giving?",
    triggers: ["Gratitude", "Faith", "Compassion", "Community support", "Special cause", "others"]
  },
  "LIFESTYLE": {
    emoji: "🥂", color: "bg-pink-500/10 text-pink-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Aso-ebi", "Hair/barbing", "Fashion", "Entertainment", "Outing with friends", "Others"],
    triggerQuestion: "What best describes this spending?",
    triggers: ["Social pressure", "Looking good", "Celebration", "Enjoyment", "Peer influence", "Self-confidence", "others"]
  },
  "IMPULSE": {
    emoji: "⚡", color: "bg-purple-500/10 text-purple-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Online shopping", "Random purchase", "Flash sale", "Social media influence", "\"I just wanted it\"", "others"],
    triggerQuestion: "What influenced this purchase?",
    triggers: ["Boredom", "Stress", "Emotional spending", "FOMO", "Peer pressure", "Rewarding myself", "Temptation"]
  },
  "BUSINESS": {
    emoji: "💼", color: "bg-indigo-500/10 text-indigo-500",
    subQuestion: "What was this spending for?",
    subCategories: ["Inventory/Stock", "Marketing & Advertising", "Logistics & Delivery", "Business Tools & Software", "Client/Project Expenses"],
    triggerQuestion: "What was the goal of this spending?",
    triggers: ["Business growth", "Serving a client", "Daily operations", "Maintaining quality", "New opportunity", "Long-term investment"]
  }
};

const CATEGORIES = Object.keys(CATEGORY_FLOW).map(key => ({
  label: key,
  emoji: CATEGORY_FLOW[key].emoji,
  color: CATEGORY_FLOW[key].color
}));

const DEFAULT_REFLECTIONS = [
  { label: "Stress", emoji: "😓", color: "bg-orange-500/10 text-orange-500" },
  { label: "Celebration", emoji: "🎉", color: "bg-emerald-500/10 text-emerald-500" },
  { label: "Family", emoji: "👨‍👩‍👧", color: "bg-rose-500/10 text-rose-500" },
  { label: "Investment", emoji: "📈", color: "bg-blue-500/10 text-blue-500" },
  { label: "Self-Care", emoji: "❤️", color: "bg-violet-500/10 text-violet-500" },
  { label: "Other", emoji: "✨", color: "bg-muted text-muted-foreground" },
];

export default function LogForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { plan, logs, noSpendDayLogged, spendLoggedToday, addNotification } = useTracking();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSavingsMode, setIsSavingsMode] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isNoSpendDay, setIsNoSpendDay] = useState(false);
  const [pendingLogData, setPendingLogData] = useState<any>(null);

  // Budget calculations
  const weekKey = getWeekKey();
  const weeklySpendLogs = logs.filter(l => l.weekKey === weekKey && !l.isSavings && !l.noSpendDay);
  const totalSpent = weeklySpendLogs.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const budgetValue = Number(plan?.budget) || 0;
  const isBudgetExceeded = budgetValue > 0 && totalSpent >= budgetValue;
  const remainingBudget = Math.max(0, budgetValue - totalSpent);
  const enteredAmount = Number(amount) || 0;
  const wouldExceedBudget = budgetValue > 0 && !isSavingsMode && enteredAmount > 0 && (totalSpent + enteredAmount) > budgetValue;
  const overageAmount = wouldExceedBudget ? (totalSpent + enteredAmount) - budgetValue : 0;

  // Force savings mode when no-spend day already logged OR budget is exhausted
  React.useEffect(() => {
    if (noSpendDayLogged || isBudgetExceeded) {
      setIsSavingsMode(true);
    }
  }, [noSpendDayLogged, isBudgetExceeded]);

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) setStep(2);
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    const dataToSubmit = {
      amount,
      category,
      item: category,
      spendingType: isSavingsMode ? "Savings" : "Regular",
      isSavings: isSavingsMode,
      isOverBudget: !isSavingsMode && wouldExceedBudget,
      date: getLocalDateString(),
      createdAt: new Date(),
    };
    
    setPendingLogData(dataToSubmit);

    // Fire budget-exceeded notification if this log pushes them over
    if (!isSavingsMode && budgetValue > 0 && (totalSpent + enteredAmount) > budgetValue) {
      const overage = (totalSpent + enteredAmount) - budgetValue;
      await addNotification(
        "⚠️ Weekly Budget Exceeded",
        `You've exceeded your ${plan?.currency || "₦"}${budgetValue.toLocaleString()} budget by ${plan?.currency || "₦"}${overage.toLocaleString()}. Only savings can be logged until next week.`,
        "general",
        { totalSpent: totalSpent + enteredAmount, budget: budgetValue }
      );
    }

    if (isSavingsMode) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setPendingLogData((prev: any) => ({ ...prev, subCategory }));
    setStep(4);
  };

  const handleReflectionSelect = (reflection: string) => {
    if (pendingLogData) {
      onSubmit({ ...pendingLogData, trigger: reflection });
    }
    setIsDone(true);
    setTimeout(() => { window.location.href = "/"; }, 1500);
  };

  const handleMaybeLater = () => {
    if (pendingLogData) {
      onSubmit(pendingLogData);
    }
    setIsDone(true);
    setTimeout(() => { window.location.href = "/"; }, 1000);
  };

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center space-y-6 max-w-lg mx-auto"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-serif text-foreground">Entry Recorded</h3>
        <p className="text-muted-foreground text-sm">Your awareness is your superpower.</p>
      </motion.div>
    );
  }

  // ─── Budget Exhausted Gate ────────────────────────────────────────────────
  // Show a gate screen if spending budget exhausted and user hasn't entered any amount yet
  if (isBudgetExceeded && step === 1 && !isSavingsMode && !noSpendDayLogged) {
    setIsSavingsMode(true); // ensure savings mode synced
  }

  return (
    <div className="max-w-lg mx-auto p-8 glass-card border-primary/10 min-h-[400px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleAmountSubmit}
            className="space-y-6"
          >
            {/* Budget Exhausted Banner */}
            {isBudgetExceeded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
              >
                <ShieldOff className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Budget Exhausted</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    You've hit your {plan?.currency || "₦"}{budgetValue.toLocaleString()} weekly limit. Spending is locked. 
                    Only savings can be logged until next week.{" "}
                    <a href="/plan" className="underline font-bold hover:text-red-300">Top up your plan?</a>
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Step 1 of 2</p>
              <h2 className="text-3xl font-serif">
                {isSavingsMode ? "How much did you save?" : "How much did you spend?"}
              </h2>
              {!isBudgetExceeded && budgetValue > 0 && !isSavingsMode && (
                <p className="text-[10px] text-muted-foreground">
                  {plan?.currency || "₦"}{remainingBudget.toLocaleString()} remaining this week
                </p>
              )}
            </div>

            <div className="relative group">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-serif text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                {plan?.currency || "₦"}
              </span>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                disabled={isBudgetExceeded && !isSavingsMode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) setAmount(val);
                }}
                className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary px-10 py-6 text-5xl font-serif outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Overage Warning – shown while typing */}
            {wouldExceedBudget && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Over Budget</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This entry will exceed your budget by{" "}
                    <strong className="text-amber-400">
                      {plan?.currency || "₦"}{overageAmount.toLocaleString()}
                    </strong>.{" "}
                    You can still log it, but future spending will be locked after this.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 pt-2">
              <button
                disabled={!amount}
                type="submit"
                className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all shadow-lg shadow-primary/10"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>

              {!amount && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Savings mode toggle – always available */}
                  <button
                    type="button"
                    disabled={isBudgetExceeded} // already forced; disable toggle when exhausted
                    onClick={() => !isBudgetExceeded && setIsSavingsMode(!isSavingsMode)}
                    className={cn(
                      "py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                      isSavingsMode
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground",
                      isBudgetExceeded && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSavingsMode ? "Savings Mode Active" : "Log Savings Instead"}
                  </button>

                  {/* No-Spend Day button – only shown when budget NOT exhausted */}
                  {!noSpendDayLogged && !spendLoggedToday && !isBudgetExceeded && (
                    <button
                      type="button"
                      onClick={() => {
                        onSubmit({
                          amount: 0,
                          noSpendDay: true,
                          item: "No-Spend Day",
                          date: getLocalDateString(),
                          createdAt: new Date(),
                        });
                        setIsNoSpendDay(true);
                        setStep(4);
                      }}
                      className="py-4 bg-primary/5 text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-all"
                    >
                      Log No-Spend Day
                    </button>
                  )}
                </div>
              )}

              {noSpendDayLogged && !amount && (
                <p className="text-[10px] text-center text-emerald-500 font-medium animate-pulse">
                  ✨ No-Spend Day logged! Only savings allowed today.
                </p>
              )}
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Step 2 of 2</p>
              <h2 className="text-3xl font-serif">{isSavingsMode ? "What is this saving for?" : "What was it for?"}</h2>
              {/* Show over-budget reminder at top of category step */}
              {wouldExceedBudget && !isSavingsMode && (
                <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  This will exceed your budget by {plan?.currency || "₦"}{overageAmount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(cat.label)}
                  className={cn(
                    "p-6 rounded-[2rem] border border-transparent transition-all flex flex-col items-center gap-3",
                    cat.color
                  )}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        )}

        {step === 3 && selectedCategory && CATEGORY_FLOW[selectedCategory] && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Step 3 of 3</p>
              <h2 className="text-3xl font-serif">{CATEGORY_FLOW[selectedCategory].subQuestion}</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {CATEGORY_FLOW[selectedCategory].subCategories.map((sub) => (
                <motion.button
                  key={sub}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubCategorySelect(sub)}
                  className="px-5 py-3 rounded-2xl border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm font-medium"
                >
                  {sub}
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 py-4 text-center"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-serif">Logged.</h2>
              {isNoSpendDay && (
                <p className="text-sm text-emerald-500 font-medium">
                  ✨ Quiet Discipline. That&apos;s real awareness.
                </p>
              )}
              {/* Budget exceeded notice shown on success screen */}
              {!isSavingsMode && budgetValue > 0 && (totalSpent + enteredAmount) > budgetValue && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left"
                >
                  <TrendingDown className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Budget Exceeded</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                      Your weekly budget of {plan?.currency || "₦"}{budgetValue.toLocaleString()} has been exceeded.
                      Spending is now locked until next week. Check your Bell for details.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Micro Reflection – skip for No-Spend Days */}
            {!isNoSpendDay && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Micro Reflection</p>
                  <h3 className="text-xl font-serif text-foreground">
                    {isSavingsMode ? "What was on your mind?" : (CATEGORY_FLOW[selectedCategory]?.triggerQuestion || "What was on your mind?")}
                  </h3>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {(isSavingsMode || !CATEGORY_FLOW[selectedCategory]
                    ? DEFAULT_REFLECTIONS.map(m => ({ label: m.label, emoji: m.emoji, color: m.color }))
                    : CATEGORY_FLOW[selectedCategory].triggers.map(t => ({ label: t, emoji: "", color: "text-foreground bg-muted/20" }))
                  ).map((m, idx) => (
                    <button
                      key={m.label + idx}
                      onClick={() => handleReflectionSelect(m.label)}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border border-border transition-all hover:border-primary/30 hover:bg-primary/5",
                        m.color,
                        m.emoji ? "flex-col p-4 min-w-[80px]" : "px-4 py-3"
                      )}
                      title={m.label}
                    >
                      {m.emoji && <span className="text-xl">{m.emoji}</span>}
                      <span className={cn(
                        "font-bold uppercase tracking-widest text-center",
                        m.emoji ? "text-[8px] leading-none" : "text-[10px]"
                      )}>{m.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleMaybeLater}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            )}

            {/* Back to Home for No-Spend Day */}
            {isNoSpendDay && (
              <button
                onClick={() => { setIsDone(true); setTimeout(() => window.location.href = "/", 500); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Back to Home
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
