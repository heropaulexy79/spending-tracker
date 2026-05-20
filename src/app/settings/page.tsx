"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { currencies } from "@/lib/currencies";
import { motion } from "framer-motion";
import { User, Settings, Globe, Check, ChevronLeft, LogOut, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { plan, savePlan, loading } = useTracking();
  const [displayName, setDisplayName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("₦");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
    if (plan?.currency) {
      setSelectedCurrency(plan.currency);
    }
  }, [user, plan]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Update Firebase Profile
      if (user && displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // Update Plan Currency
      await savePlan({ ...plan, currency: selectedCurrency });

      setMessage({ type: "success", text: "Settings updated successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="flex items-center gap-4 pt-4">
        <Link 
          href="/" 
          className="p-3 rounded-2xl glass-card hover:bg-muted transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-serif tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Personalize your experience</p>
        </div>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl border text-sm font-medium",
            message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-coral/10 border-coral/20 text-coral"
          )}
        >
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-serif text-foreground">Identity</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl pl-11 pr-5 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-5 py-4 text-muted-foreground outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-serif text-foreground">Preferences</h2>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Preferred Currency</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.symbol)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1",
                    selectedCurrency === curr.symbol
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                  )}
                >
                  <span className="text-lg font-serif">{curr.symbol}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{curr.code}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Security / About */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-serif text-foreground">Account</h2>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-coral/5 border border-coral/10 text-coral hover:bg-coral/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
              </div>
            </button>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
