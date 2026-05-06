"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";


export default function StatsPage() {
  const { logs, loading } = useTracking();

  if (loading) return null;

  const totalWeekly = logs.reduce((acc, log) => acc + (Number(log.amount) || 0), 0);
  const dailyAvg = logs.length > 0 ? Math.round(totalWeekly / 7) : 0;

  // Group by day of week and calculate insights
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  const triggerCounts: Record<string, number> = {};
  let impulseCount = 0;

  logs.forEach(log => {
    const date = log.createdAt ? new Date(log.createdAt) : new Date();
    if (isNaN(date.getTime())) return;

    const day = date.getDay();
    const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
    const amount = Number(log.amount) || 0;
    dayData[index] += amount;

    if (amount > 0) {
      if (log.trigger) {
        triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
      }
      if (log.spendingType === "Emotional impulse") {
        impulseCount++;
      }
    }
  });

  const maxAmount = Math.max(...dayData);
  const maxDayIndex = dayData.indexOf(maxAmount);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const busiestDay = maxAmount > 0 ? days[maxDayIndex] : "N/A";
  
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const impulseRate = logs.length > 0 ? Math.round((impulseCount / logs.length) * 100) : 0;

  const maxDay = Math.max(...dayData, 1);

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Stats</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Behavior Patterns</h1>
        <p className="text-muted-foreground">Interpreted insights from your spending reality.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Weekly Spend</p>
          <p className="text-2xl font-bold text-white">₦{totalWeekly.toLocaleString()}</p>
        </div>
        <div className="p-5 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Daily Avg</p>
          <p className="text-2xl font-bold text-white">₦{dailyAvg.toLocaleString()}</p>
        </div>
      </div>

      {/* Behavior Insights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Key Insights
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {logs.length > 0 ? (
            <>
              <InsightCard 
                icon={<TrendingDown className="w-5 h-5 text-primary" />}
                title="Busiest Day"
                description={`You tend to spend the most on ${busiestDay}.`}
                color="bg-primary/10 border-primary/20"
              />
              <InsightCard 
                icon={<AlertTriangle className="w-5 h-5 text-coral-400" />}
                title="Top Trigger"
                description={topTrigger !== "N/A" ? `"${topTrigger}" is your most common spending trigger.` : "No triggers logged yet."}
                color="bg-coral-400/10 border-coral-400/20"
              />
              <InsightCard 
                icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
                title="Impulse Rate"
                description={`About ${impulseRate}% of your logs are emotional impulses.`}
                color="bg-emerald-400/10 border-emerald-400/20"
              />
            </>
          ) : (
            <div className="p-8 glass rounded-2xl text-center border-dashed border-white/10">
              <p className="text-muted-foreground text-sm italic">Log more spending to reveal your behavioral patterns.</p>
            </div>
          )}
        </div>
      </section>

      {/* Spending by Day Chart */}
      <section className="p-6 glass rounded-3xl space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Spending by Day</h2>
          {maxAmount > 0 && <span className="text-xs text-muted-foreground">Max: ₦{maxAmount.toLocaleString()}</span>}
        </div>
        
        <div className="flex items-end gap-3 h-48 pt-8">
          {dayData.map((amount, i) => {
            const h = (amount / maxDay) * 100;
            return (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "absolute bottom-0 w-full rounded-t-xl transition-all duration-300 group-hover:brightness-125",
                    h > 80 ? "bg-coral-400" : "bg-primary"
                  )}
                />
                
                {/* Tooltip/Label */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₦{amount.toLocaleString()}
                </div>

                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground text-center italic">
            {logs.length > 0 ? (
              <>Visualizing your current weekly spending pattern.</>
            ) : (
              <>No spending data for this week yet.</>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

function InsightCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={cn("p-4 rounded-2xl border flex gap-4 items-start transition-all hover:scale-[1.01]", color)}>
      <div className="mt-1 p-2 bg-white/5 rounded-xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-white mb-0.5">{title}</h4>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
