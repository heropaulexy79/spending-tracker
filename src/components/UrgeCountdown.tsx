"use client";

import React, { useState, useEffect } from "react";
import { Timer, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgeCountdownProps {
  createdAt: any; // Firestore Timestamp or Date
  className?: string;
}

export default function UrgeCountdown({ createdAt, className }: UrgeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      let createdDate: Date;
      if (createdAt?.seconds) {
        createdDate = new Date(createdAt.seconds * 1000);
      } else {
        createdDate = new Date(createdAt);
      }

      const targetDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(0);
        setIsReady(true);
      } else {
        setTimeLeft(diff);
        setIsReady(false);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (timeLeft === null) return null;

  if (isReady) {
    return (
      <div className={cn("flex items-center gap-1.5 text-emerald-500 font-bold", className)}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">Ready to Resolve</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className={cn("flex items-center gap-1.5 text-muted-foreground font-mono", className)}>
      <Clock className="w-3.5 h-3.5 opacity-50" />
      <span className="text-sm font-bold tracking-tighter">
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
