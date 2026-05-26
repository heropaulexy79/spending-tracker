"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTracking } from "@/hooks/useTracking";
import { BarChart3, Sparkles, TrendingUp, TrendingDown, Brain, Zap, Target, ArrowLeft, Trophy, AlertTriangle, Flame, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Pastel-inspired color palette for categories
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  "Food & Feeding":               { bg: "bg-orange-500/10",  border: "border-orange-500/20",  text: "text-orange-400",   bar: "bg-orange-500" },
  "Transport & Movement":         { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",     bar: "bg-blue-500" },
  "Bills & Utilities":            { bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  text: "text-yellow-400",   bar: "bg-yellow-500" },
  "Family & Support":             { bg: "bg-pink-500/10",    border: "border-pink-500/20",    text: "text-pink-400",     bar: "bg-pink-500" },
  "Lifestyle & Social Life":      { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", text: "text-fuchsia-400",  bar: "bg-fuchsia-500" },
  "Business & Hustle":            { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400",  bar: "bg-emerald-500" },
  "Health & Wellness":            { bg: "bg-red-500/10",     border: "border-red-500/20",     text: "text-red-400",      bar: "bg-red-500" },
  "Faith & Giving":               { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",   bar: "bg-violet-500" },
  "Personal Growth":              { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-400",     bar: "bg-cyan-500" },
  "Savings & Goals":              { bg: "bg-green-500/10",   border: "border-green-500/20",   text: "text-green-400",    bar: "bg-green-500" },
  "Impulse & Unexpected Spending":{ bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400",     bar: "bg-rose-500" },
  "Others (custom spending)":     { bg: "bg-gray-500/10",    border: "border-gray-500/20",    text: "text-gray-400",     bar: "bg-gray-500" },
};

const BEHAVIOR_COLOR: Record<string, string> = {
  "Was it Needed":              "text-green-400",
  "Was it Impulse":             "text-rose-400",
  "Was it Emotional":           "text-fuchsia-400",
  "Was it Planned":             "text-blue-400",
  "Was it Social pressure":     "text-orange-400",
  "Was it survival mood":       "text-amber-400",
  "Was it Investment in self":  "text-cyan-400",
};

function gradeFromScore(score: number): { grade: string; color: string; emoji: string; message: string } {
  if (score >= 90) return { grade: "A+", color: "text-emerald-400", emoji: "🏆", message: "Exceptional! You are operating like a true financial architect." };
  if (score >= 80) return { grade: "A",  color: "text-emerald-400", emoji: "🌟", message: "Outstanding discipline. Your future self is smiling right now." };
  if (score >= 70) return { grade: "B+", color: "text-blue-400",    emoji: "💪", message: "Really solid month. A few tweaks and you'll be unstoppable." };
  if (score >= 60) return { grade: "B",  color: "text-blue-400",    emoji: "👏", message: "You're on the right track. Keep building the habit." };
  if (score >= 50) return { grade: "C+", color: "text-amber-400",   emoji: "⚡", message: "Room to grow — but awareness is already half the battle." };
  if (score >= 40) return { grade: "C",  color: "text-amber-400",   emoji: "🔧", message: "Time for a reset. Review your impulse patterns carefully." };
  if (score >= 30) return { grade: "D",  color: "text-orange-400",  emoji: "📢", message: "This month was tough. But you tracked it — that counts." };
  return              { grade: "F",  color: "text-rose-400",    emoji: "🚨", message: "Your spending outpaced your intentions. Recommit this week." };
}

export default function AnalysisPage() {
  const { logs, plan, loading } = useTracking();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const currency = plan?.currency || "₦";

  const analysis = useMemo(() => {
    const spendLogs = logs.filter(l => !l.noSpendDay);
    const realSpend  = spendLogs.filter(l => !l.isSavings);
    const saveLogs   = spendLogs.filter(l => l.isSavings);

    const totalSpent   = realSpend.reduce((a, l) => a + (Number(l.amount) || 0), 0);
    const totalSaved   = saveLogs.reduce((a, l)  => a + (Number(l.amount) || 0), 0);
    const noSpendDays  = logs.filter(l => l.noSpendDay).length;

    // ── Category breakdown ──────────────────────────────────────────
    const catTotals: Record<string, number> = {};
    const catItems:  Record<string, string[]> = {};
    realSpend.forEach(l => {
      const cat = l.category || l.spendingType || "Others (custom spending)";
      catTotals[cat] = (catTotals[cat] || 0) + (Number(l.amount) || 0);
      catItems[cat]  = catItems[cat] || [];
      if (l.item && catItems[cat].length < 3) catItems[cat].push(l.item);
    });

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const maxCat     = sortedCats[0]?.[1] || 1;

    // ── Behavior tags ───────────────────────────────────────────────
    const tagCounts: Record<string, number> = {};
    realSpend.forEach(l => {
      (l.behaviorTags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    // ── Impulse detection ───────────────────────────────────────────
    const impulseCount  = (tagCounts["Was it Impulse"] || 0) + (tagCounts["Was it Emotional"] || 0);
    const plannedCount  = tagCounts["Was it Planned"] || 0;
    const neededCount   = tagCounts["Was it Needed"]  || 0;
    const totalTagHits  = Object.values(tagCounts).reduce((a, b) => a + b, 0);

    // ── Daily rhythm ────────────────────────────────────────────────
    const daySpend: Record<string, number> = {};
    realSpend.forEach(l => {
      if (l.date) daySpend[l.date] = (daySpend[l.date] || 0) + (Number(l.amount) || 0);
    });
    const daysWithSpend = Object.values(daySpend);
    const avgDaily      = daysWithSpend.length ? daysWithSpend.reduce((a, b) => a + b, 0) / daysWithSpend.length : 0;
    const worstDay      = Object.entries(daySpend).sort((a, b) => b[1] - a[1])[0];
    const bestDay       = Object.entries(daySpend).filter(([,v]) => v > 0).sort((a, b) => a[1] - b[1])[0];

    // ── Score ───────────────────────────────────────────────────────
    let score = 50;
    const budgetVal = Number(plan?.budget) || 0;
    if (budgetVal > 0) {
      const ratio = totalSpent / budgetVal;
      if (ratio <= 0.5)  score += 30;
      else if (ratio <= 0.8) score += 20;
      else if (ratio <= 1)   score += 10;
      else score -= 20;
    }
    if (noSpendDays >= 2)  score += 10;
    if (totalSaved > 0)    score += 10;
    if (impulseCount > 5)  score -= 15;
    if (impulseCount === 0 && totalTagHits > 3) score += 10;
    if (plannedCount > impulseCount) score += 5;
    score = Math.max(0, Math.min(100, score));

    const topImpulseCategory = realSpend
      .filter(l => (l.behaviorTags || []).some((t: string) => t === "Was it Impulse" || t === "Was it Emotional"))
      .reduce<Record<string, number>>((acc, l) => {
        const cat = l.category || "Others (custom spending)";
        acc[cat] = (acc[cat] || 0) + (Number(l.amount) || 0);
        return acc;
      }, {});
    const worstImpulseCat = Object.entries(topImpulseCategory).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSpent, totalSaved, noSpendDays, sortedCats, maxCat, catItems,
      sortedTags, tagCounts, impulseCount, plannedCount, neededCount,
      totalTagHits, avgDaily, worstDay, bestDay, score, worstImpulseCat,
    };
  }, [logs, plan]);

  const { grade, color: gradeColor, emoji, message } = gradeFromScore(analysis.score);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatAmount = (n: number) => `${currency}${n.toLocaleString()}`;

  return (
    <div className="space-y-8 animate-in pb-16">
      {/* Header */}
      <header className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-violet-500/40" />
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">Monthly Analysis</p>
        </div>
        <h1 className="text-4xl font-serif tracking-tight text-foreground">Your Money Mirror</h1>
        <p className="text-muted-foreground text-sm">A deep look at your spending patterns and behavioral tendencies this month.</p>
      </header>

      {/* Grade Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-br from-violet-500/10 via-background to-fuchsia-500/10 border border-violet-500/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="w-40 h-40 text-violet-500" />
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-center">
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={cn("text-7xl font-serif font-bold", gradeColor)}
            >
              {grade}
            </motion.p>
            <p className="text-3xl mt-1">{emoji}</p>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">This Month&apos;s Score: {analysis.score}/100</p>
            <p className="text-xl font-serif text-foreground leading-snug">{message}</p>
            {/* Score bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.score}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={cn("h-full rounded-full", analysis.score >= 70 ? "bg-emerald-500" : analysis.score >= 50 ? "bg-amber-500" : "bg-rose-500")}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Spent",    value: formatAmount(analysis.totalSpent), icon: <TrendingDown className="w-4 h-4" />, color: "text-rose-400" },
          { label: "Total Saved",    value: formatAmount(analysis.totalSaved),  icon: <TrendingUp className="w-4 h-4" />,  color: "text-emerald-400" },
          { label: "No-Spend Days",  value: String(analysis.noSpendDays),       icon: <Flame className="w-4 h-4" />,       color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 space-y-3"
          >
            <div className={cn("w-8 h-8 rounded-xl bg-muted flex items-center justify-center", s.color)}>
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-serif text-foreground">{s.value}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Category Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <h2 className="text-2xl font-serif text-foreground">Where Your Money Went</h2>
        </div>

        {analysis.sortedCats.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted-foreground text-sm italic">
            No spending data yet this month. Start logging to see your breakdown.
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.sortedCats.map(([cat, amount], i) => {
              const pct      = Math.round((amount / analysis.maxCat) * 100);
              const colors   = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Others (custom spending)"];
              const isOpen   = expandedCategory === cat;
              const items    = analysis.catItems[cat] || [];
              const sharePct = analysis.totalSpent > 0 ? Math.round((amount / analysis.totalSpent) * 100) : 0;

              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("glass-card overflow-hidden border", colors.border)}
                >
                  <button
                    className="w-full p-5 text-left"
                    onClick={() => setExpandedCategory(isOpen ? null : cat)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", colors.text)}>#{i + 1}</span>
                        <span className="text-sm font-bold text-foreground">{cat}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-serif text-foreground">{formatAmount(amount)}</span>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                          {sharePct}%
                        </span>
                        {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className={cn("h-full rounded-full", colors.bar)}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && items.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={cn("px-5 pb-4 border-t", colors.border)}
                      >
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-3 mb-2">Recent Items</p>
                        <div className="space-y-1">
                          {items.map((item, j) => (
                            <p key={j} className="text-sm text-foreground">• {item}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Behavior Tags */}
      {analysis.sortedTags.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <Brain className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-2xl font-serif text-foreground">Your Spending Psychology</h2>
          </div>
          <div className="glass-card p-6 space-y-5">
            {analysis.sortedTags.map(([tag, count], i) => {
              const maxTag = analysis.sortedTags[0]?.[1] || 1;
              const pct = Math.round((count / maxTag) * 100);
              const textColor = BEHAVIOR_COLOR[tag] || "text-muted-foreground";
              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className={cn("text-sm font-bold", textColor)}>{tag}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{count}×</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Personalized Insights */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-serif text-foreground">Actionable Insights</h2>
        </div>
        <div className="space-y-3">

          {/* Impulse insight */}
          {analysis.impulseCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-1">Impulse Pattern Detected</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You tagged {analysis.impulseCount} purchases as impulse or emotional spending this month.
                    {analysis.worstImpulseCat ? ` Your biggest impulse category was "${analysis.worstImpulseCat[0]}" at ${formatAmount(analysis.worstImpulseCat[1])}.` : ""}
                    {" "}Try adding a 10-minute pause rule before spending in that category.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Best day insight */}
          {analysis.bestDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">Your Best Day</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Your most controlled spending day was{" "}
                    <span className="font-bold text-foreground">{new Date(analysis.bestDay[0]).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}</span>
                    {" "}with only {formatAmount(analysis.bestDay[1])} spent. Replicate that mindset!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Worst day insight */}
          {analysis.worstDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1">Watch This Day</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Your highest spending day was{" "}
                    <span className="font-bold text-foreground">{new Date(analysis.worstDay[0]).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}</span>
                    {" "}at {formatAmount(analysis.worstDay[1])}. What was happening that day? Reflect and prepare.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Savings insight */}
          {analysis.totalSaved > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-400 uppercase tracking-wider mb-1">You Saved!</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You intentionally set aside {formatAmount(analysis.totalSaved)} this month. That&apos;s not a number — that&apos;s a decision. Keep stacking.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Average daily spend */}
          {analysis.avgDaily > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-1">Daily Average</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You spend an average of{" "}
                    <span className="font-bold text-foreground">{formatAmount(Math.round(analysis.avgDaily))}</span>
                    {" "}per active day. Projected over 30 days, that&apos;s{" "}
                    <span className="font-bold text-foreground">{formatAmount(Math.round(analysis.avgDaily * 30))}/month</span>.
                    Does that align with your income and goals?
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {logs.length === 0 && (
            <div className="glass-card p-10 text-center border-dashed">
              <p className="text-muted-foreground text-sm italic">Log your first entry this month to unlock your analysis.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-4"
      >
        <p className="text-lg font-serif text-foreground">Ready to do better next month?</p>
        <p className="text-sm text-muted-foreground">Set a fresh intention and stick to it.</p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-[0_0_25px_rgba(202,138,4,0.15)]"
        >
          Update My Weekly Plan
        </Link>
      </motion.div>
    </div>
  );
}
