"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // 1. Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    }

    // 3. Handle Android/Chrome Install Prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 4. Show iOS prompt after a short delay (Safari doesn't have an event)
    if (/iphone|ipad|ipod/.test(userAgent)) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50"
        >
          <div className="glass-card p-6 shadow-2xl relative overflow-hidden border-primary/20">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-foreground tracking-tight leading-tight">Crafting the Mind Spending and Behavioral Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {platform === "ios" 
                    ? "Tap the share icon and select 'Add to Home Screen' for a premium experience."
                    : "Add to your home screen for quick access and behavioral reminders."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {platform === "ios" ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-xs font-bold text-foreground uppercase tracking-wider">
                  <Share className="w-4 h-4 text-primary" /> Step-by-step
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Install Now
                </button>
              )}
              <button
                onClick={() => setShowPrompt(false)}
                className="px-6 py-3 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
