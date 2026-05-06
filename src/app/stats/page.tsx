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

  // Group by day of week
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  logs.forEach(log => {
    const day = new Date(log.createdAt).getDay();
    const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
    dayData[index] += (Number(log.amount) || 0);
  });

  const maxDay = Math.max(...dayData, 1);
  return (
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Stats</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Behavior Patterns</h1>
        <p className="text-muted-foreground">Interpreted insights from your spending reality.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase">Weekly Spend</p>
          <p className="text-2xl font-bold text-white">₦{totalWeekly.toLocaleString()}</p>
        </div>
        <div className="p-5 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase">Daily Avg</p>
          <p className="text-2xl font-bold text-white">₦{dailyAvg.toLocaleString()}</p>
        </div>
      </div>

      {/* Behavior Insights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Key Insights
        </h2>
        <div className="space-y-3">
          <div className="p-8 glass rounded-2xl text-center border-dashed border-white/10">
            <p className="text-muted-foreground text-sm italic">Log more spending to reveal your behavioral patterns.</p>
          </div>
        </div>
      </section>

      {/* Most Expensive Day Chart Placeholder */}
      <section className="p-6 glass rounded-3xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Spending by Day</h2>
        <div className="flex items-end gap-3 h-40">
          {dayData.map((amount, i) => {
            const h = (amount / maxDay) * 100;
            return (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "absolute bottom-0 w-full rounded-t-xl",
                    h > 80 ? "bg-coral-400" : "bg-primary"
                  )}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="pt-8">
          <p className="text-sm text-muted-foreground text-center">
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
    <div className={`p-4 rounded-2xl border flex gap-4 items-start ${color}`}>
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
