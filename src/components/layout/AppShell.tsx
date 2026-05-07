"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Onboarding from "../Onboarding";

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
      <header className="max-w-lg mx-auto px-6 pt-10 pb-2">
        <h1 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] font-dm-sans">Crafting the Mind</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        {children}
      </main>
      {user && <BottomNav />}
    </>
  );
}
