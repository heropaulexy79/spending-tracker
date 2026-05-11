"use client";

import { useTracking } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Reminders() {
  const { logs, loading } = useTracking();

  if (loading) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const hasLoggedToday = logs.some(l => l.date === todayStr);
  
  // Weekly Review Ready condition: 7 distinct days logged
  const distinctDays = new Array(...new Set(logs.map(l => l.date))).length;
  const isWeeklyReviewReady = distinctDays >= 7;

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {!hasLoggedToday && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Link href="/log">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between group hover:bg-primary/15 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Daily Nudge</p>
                    <p className="text-[11px] text-muted-foreground">Log today&apos;s spending to maintain your awareness.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        )}

        {isWeeklyReviewReady && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Link href="/stats">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/15 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Review</p>
                    <p className="text-[11px] text-muted-foreground">Your weekly behavioral review is ready!</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
