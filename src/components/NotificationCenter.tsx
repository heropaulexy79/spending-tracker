"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Coins, Timer, TrendingUp, Info, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  coin_earned:     { icon: <Coins className="w-4 h-4" />,       color: "text-amber-500",        bg: "bg-amber-500/10" },
  urge_activated:  { icon: <Timer className="w-4 h-4" />,       color: "text-emerald-500",    bg: "bg-emerald-500/10" },
  urge_followup:   { icon: <TrendingUp className="w-4 h-4" />,  color: "text-primary",         bg: "bg-primary/10" },
  weekly_summary:  { icon: <TrendingUp className="w-4 h-4" />,  color: "text-primary",         bg: "bg-primary/10" },
  general:         { icon: <Info className="w-4 h-4" />,        color: "text-muted-foreground", bg: "bg-muted" },
  spend_logged:    { icon: <span className="text-sm">📝</span>,    color: "text-foreground",      bg: "bg-muted" },
  no_spend_day:    { icon: <span className="text-sm">🌿</span>,    color: "text-emerald-500",    bg: "bg-emerald-500/10" },
  check_in:        { icon: <span className="text-sm">🌱</span>,    color: "text-green-500",      bg: "bg-green-500/10" },
  reflection:      { icon: <span className="text-sm">🧠</span>,    color: "text-violet-500",     bg: "bg-violet-500/10" },
  urge_resisted:   { icon: <span className="text-sm">🏆</span>,    color: "text-amber-500",      bg: "bg-amber-500/10" },
  urge_purchased:  { icon: <span className="text-sm">📋</span>,    color: "text-blue-500",       bg: "bg-blue-500/10" },
  savings_logged:  { icon: <span className="text-sm">💰</span>,    color: "text-emerald-600",    bg: "bg-emerald-600/10" },
  emotional_checkin:{ icon: <span className="text-sm">❤️</span>,    color: "text-rose-500",       bg: "bg-rose-500/10" },
};

const EMOTIONS = [
  { label: "Happy", emoji: "😊", score: 5 },
  { label: "Normal", emoji: "😐", score: 3 },
  { label: "Stressed", emoji: "😔", score: 2 },
  { label: "Frustrated", emoji: "😤", score: 1 },
  { label: "Tired", emoji: "😴", score: 1 }
];

function timeAgo(createdAt: any): string {
  if (!createdAt) return "";
  const date = createdAt.seconds
    ? new Date(createdAt.seconds * 1000)
    : new Date(createdAt);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, markAsRead, addCheckIn } = useTracking();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    if (unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="p-3 rounded-2xl glass-card hover:bg-muted transition-all active:scale-95 text-muted-foreground hover:text-foreground relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-primary/30"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 bg-background rounded-[1.5rem] shadow-2xl z-[60] border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-bold text-foreground">Notifications</p>
                {notifications.length > 0 && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    {notifications.length} messages
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">No notifications yet.</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Start logging or resisting urges to earn coins!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 px-5 py-4 transition-colors",
                          !n.read ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg, cfg.color)}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className={cn("text-xs font-bold leading-tight", !n.read ? "text-foreground" : "text-foreground/80")}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-wider pt-0.5">
                            {timeAgo(n.createdAt)}
                          </p>
                          
                          {n.type === "emotional_checkin" && !n.read && (
                            <div className="pt-3 pb-1">
                              <div className="grid grid-cols-5 gap-1">
                                {EMOTIONS.map(e => (
                                  <button
                                    key={e.label}
                                    onClick={async (ev) => {
                                      ev.stopPropagation();
                                      await addCheckIn(e.score, e.label);
                                      await markAsRead(n.id);
                                    }}
                                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-muted/80 transition-all active:scale-95"
                                  >
                                    <span className="text-lg">{e.emoji}</span>
                                    <span className="text-[8px] font-bold mt-1 text-muted-foreground">{e.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
