"use client";

import { useTracking } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowRight, Calendar, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Reminders() {
  const { logs, plan, loading, triggerSystemNotification } = useTracking();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const hasPlan = !!plan;
  const todayStr = new Date().toISOString().split("T")[0];
  const hasLoggedToday = logs.some(l => l.date === todayStr);
  const distinctDays = new Array(...new Set(logs.map(l => l.date))).length;
  const isSunday = new Date().getDay() === 0;
  const isWeeklyReviewReady = distinctDays >= 7 || isSunday;

  // Local Push Logic
  useEffect(() => {
    if (loading) return;
    if (permission === "granted") {
      const lastNotified = localStorage.getItem("last_reminder_date");
      if (lastNotified !== todayStr) {
        if (!hasPlan) {
          triggerSystemNotification("Plan Required", "Set your weekly intention to start tracking.");
          localStorage.setItem("last_reminder_date", todayStr);
        } else if (!hasLoggedToday) {
          triggerSystemNotification("Daily Nudge", "Log today's spending to maintain your awareness.");
          localStorage.setItem("last_reminder_date", todayStr);
        }
      }
    }
  }, [hasPlan, hasLoggedToday, permission, todayStr, loading]);

  const requestPermission = async () => {
    const res = await Notification.requestPermission();
    setPermission(res);
  };

  if (loading) return null;

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {permission !== "granted" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <button 
              onClick={requestPermission}
              className="w-full p-4 bg-primary text-primary-foreground rounded-2xl flex items-center justify-between group hover:opacity-90 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-background" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Enable Push Notifications</p>
                  <p className="text-[11px] opacity-80">Stay mindful with daily behavioral reminders.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {!hasPlan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Link href="/plan">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between group hover:bg-amber-500/15 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Plan Required</p>
                    <p className="text-[11px] text-muted-foreground">Set your weekly intention to start tracking.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        )}

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
