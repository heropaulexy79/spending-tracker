"use client";

import React from "react";
import { useTracking } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { History, Zap, ShieldCheck, TrendingUp, ArrowLeft, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UrgeCountdown from "@/components/UrgeCountdown";
import { formatDate } from "@/lib/dateUtils";

export default function UrgeHistoryPage() {
  const { urges, resolveUrge, plan, loading } = useTracking();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Zap className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  // Grouping
  const activeDelays = urges.filter(u => u.action === "Delayed");
  const resolvedHistory = urges.filter(u => u.action !== "Delayed");

  // Stats
  const totalResolved = resolvedHistory.length;
  const resistedCount = resolvedHistory.filter(u => u.action === "Resisted").length;
  const resistanceRate = totalResolved > 0 ? Math.round((resistedCount / totalResolved) * 100) : 0;
  const totalMoneyResisted = resolvedHistory
    .filter(u => u.action === "Resisted")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-in pb-20">
      <header className="pt-8 space-y-4">
        <Link 
          href="/urge" 
          className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Delay
        </Link>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Awareness Loop</p>
          </div>
          <h1 className="text-4xl font-serif tracking-tight text-foreground">Urge History</h1>
        </div>
      </header>

      {/* Resistance Power Stats */}
      <section className="grid grid-cols-2 gap-4">
         <div className="p-6 glass-card border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Resistance Rate</p>
            <p className="text-3xl font-serif text-foreground">{resistanceRate}%</p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${resistanceRate}%` }}
                    className="h-full bg-primary"
                />
            </div>
         </div>
         <div className="p-6 glass-card border-primary/10">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Money Saved</p>
            <p className="text-3xl font-serif text-foreground">{plan?.currency || "₦"}{totalMoneyResisted.toLocaleString()}</p>
            <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Power Reclaimed
            </p>
         </div>
      </section>

      {/* Active Delays Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Active Delays</h2>
        </div>
        
        <div className="space-y-3">
          {activeDelays.length > 0 ? (
            activeDelays.map((urge, i) => (
              <motion.div
                key={urge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 glass-card border-primary/5 rounded-[2rem] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm uppercase tracking-tight">{urge.item}</p>
                    <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">{urge.type} • {plan?.currency || "₦"}{Number(urge.amount).toLocaleString()}</p>
                  </div>
                  <UrgeCountdown createdAt={urge.createdAt} />
                </div>
                
                {/* Visual Progress Bar (24h) */}
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <CountdownBar createdAt={urge.createdAt} />
                </div>

                <div className="flex gap-2 pt-1">
                   <button 
                     onClick={() => resolveUrge(urge.id, "Resisted")}
                     className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                   >
                     Resisted
                   </button>
                   <button 
                     onClick={() => resolveUrge(urge.id, "Purchased")}
                     className="flex-1 py-3 bg-rose-500/10 text-rose-500 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all border border-rose-500/20"
                   >
                     Purchased
                   </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 border-dashed border border-border rounded-[2rem] text-center">
                <p className="text-xs text-muted-foreground italic">No active delays. Your mind is quiet.</p>
            </div>
          )}
        </div>
      </section>

      {/* History Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Resolved History</h2>
        </div>

        <div className="space-y-3">
          {resolvedHistory.length > 0 ? (
            resolvedHistory.map((urge, i) => (
              <div 
                key={urge.id}
                className="flex items-center justify-between p-6 glass-card border-primary/5 rounded-[2rem]"
              >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center",
                        urge.action === "Resisted" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {urge.action === "Resisted" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground text-sm uppercase tracking-tight line-clamp-1">{urge.item}</p>
                      <p className="text-[8px] text-muted-foreground font-bold tracking-widest uppercase">
                        {formatDate(urge.createdAt)} • {urge.action}
                      </p>
                    </div>
                </div>
                <p className="font-serif text-sm">
                  {plan?.currency || "₦"}{Number(urge.amount).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-30 italic">No history yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CountdownBar({ createdAt }: { createdAt: any }) {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const update = () => {
            let createdDate: Date;
            if (createdAt?.seconds) {
                createdDate = new Date(createdAt.seconds * 1000);
            } else {
                createdDate = new Date(createdAt);
            }
            const now = new Date();
            const target = createdDate.getTime() + 24 * 60 * 60 * 1000;
            const total = 24 * 60 * 60 * 1000;
            const elapsed = now.getTime() - createdDate.getTime();
            const p = Math.min(100, Math.max(0, (elapsed / total) * 100));
            setProgress(p);
        };
        update();
        const interval = setInterval(update, 60000); // update every min
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary/40"
        />
    );
}
