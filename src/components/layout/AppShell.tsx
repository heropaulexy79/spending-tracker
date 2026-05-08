"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Onboarding from "../Onboarding";
import ThemeToggle from "../ThemeToggle";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [hasSeenGuide, setHasSeenGuide] = useState<boolean | null>(null);

  useEffect(() => {
    const globalSeen = localStorage.getItem(`hasSeenGuide_global`);
    if (globalSeen) {
      setHasSeenGuide(true);
    } else {
      setHasSeenGuide(false);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem(`hasSeenGuide_global`, "true");
    setHasSeenGuide(true);
  };

  if (loading || hasSeenGuide === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Force Onboarding if not seen
  if (!hasSeenGuide) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  // 2. If not logged in, they can ONLY see the Home page (which has the AuthForm)
  const isAuthPage = pathname === "/";
  if (!user && !isAuthPage) {
    // Redirect or just show nothing if they try to access /plan etc.
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  return (
    <>
      <header className="max-w-lg mx-auto px-6 pt-12 pb-2 flex items-center justify-between">
        <div className="flex-1" />
        <div className="text-center space-y-1 flex-[2]">
          <h1 className="text-sm font-bold text-primary uppercase tracking-[0.6em] font-dm-sans whitespace-nowrap">Crafting the Mind</h1>
          <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.4em] whitespace-nowrap">Spending & Behavioral Tracker</p>
        </div>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        {children}
      </main>
      {user && <BottomNav />}
    </>
  );
}
