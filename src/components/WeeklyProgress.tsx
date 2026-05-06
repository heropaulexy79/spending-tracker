"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyProgressProps {
  logs: any[];
}

export default function WeeklyProgress({ logs }: WeeklyProgressProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 is Sunday, map to 6

  // Helper to check if a day has logs
  const isDayComplete = (dayIndex: number) => {
    // This is a simplified check. In a real app, we'd compare dates properly.
    // For now, we'll assume days before today with any logs are complete.
    // In a more robust version, we'd check if specific daily goals were met.
    const dayDate = new Date();
    const diff = currentDayIndex - dayIndex;
    dayDate.setDate(today.getDate() - diff);
    const dateString = dayDate.toISOString().split("T")[0];
    
    return logs.some(log => log.date === dateString);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-serif text-white">Weekly Journey</h3>
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
          {logs.filter((v, i, a) => a.findIndex(t => t.date === v.date) === i).length}/7 Days
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isPast = i < currentDayIndex;
          const isToday = i === currentDayIndex;
          const isFuture = i > currentDayIndex;
          const completed = isDayComplete(i);

          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full aspect-square rounded-xl flex items-center justify-center border transition-all duration-500",
                  completed && "bg-emerald-500/10 border-emerald-500/50 text-emerald-500",
                  isToday && !completed && "bg-primary/10 border-primary/50 text-primary animate-pulse",
                  isFuture && "bg-white/5 border-white/5 text-muted-foreground/30",
                  isPast && !completed && "bg-coral/10 border-coral/50 text-coral"
                )}
              >
                {completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isFuture ? (
                  <Lock className="w-4 h-4 opacity-20" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tighter",
                isToday ? "text-primary" : "text-muted-foreground/60"
              )}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
