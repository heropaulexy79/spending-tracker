"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { Loader2, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Onboarding from "../Onboarding";
import ThemeToggle from "../ThemeToggle";
import CurrencySwitcher from "../CurrencySwitcher";
import HelpModal from "../HelpModal";
import UserProfileMenu from "../UserProfileMenu";
import NotificationCenter from "../NotificationCenter";
import { useTheme } from "next-themes";
import Image from "next/image";
import { doc, setDoc } from "firebase/firestore";
import { db, messaging } from "@/lib/firebase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [hasSeenGuide, setHasSeenGuide] = useState<boolean | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Register service worker for PWA support and messaging
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  // Request push notification permission and save FCM token
  useEffect(() => {
    if (!user) return;
    const requestPushPermission = async () => {
      try {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const messagingInstance = await messaging();
        if (!messagingInstance) return;

        const { getToken } = await import("firebase/messaging");
        // VAPID key from Firebase Console → Project Settings → Cloud Messaging
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;

        const token = await getToken(messagingInstance, { vapidKey });
        if (token) {
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { fcmToken: token }, { merge: true });
          console.log("FCM token saved.");
        }
      } catch (err) {
        console.warn("Push notification setup failed:", err);
      }
    };
    requestPushPermission();
  }, [user]);

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
      <header className="max-w-lg mx-auto px-4 pt-10 pb-2">
        {/* Row 1: Logo + Notification */}
        <div className="flex items-center justify-between mb-1">
          <div className="w-8" /> {/* spacer */}
          <div className="flex flex-col items-center">
            {mounted ? (
              <Image
                src={resolvedTheme === "dark" ? "/spendingtracker(black_bac_logo).png" : "/Spendingtracker(white_bac_logo).png"}
                alt="Crafting the Mind"
                width={160}
                height={36}
                className="h-auto w-auto max-h-10"
                priority
              />
            ) : (
              <div className="h-10 w-36" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {user && <NotificationCenter />}
          </div>
        </div>

        {/* Row 2: Utility icons */}
        {user && (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl glass-card hover:bg-muted transition-all active:scale-95 text-muted-foreground hover:text-foreground"
              aria-label="Open guidance and FAQ"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <CurrencySwitcher />
            <ThemeToggle />
            <UserProfileMenu />
          </div>
        )}
        {!user && (
          <div className="flex items-center justify-end gap-1">
            <ThemeToggle />
          </div>
        )}
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">
        {children}
      </main>
      {user && <BottomNav />}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
