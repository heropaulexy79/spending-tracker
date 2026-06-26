"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { EmailAuthProvider, linkWithCredential, updateProfile, getAdditionalUserInfo } from "firebase/auth";
import { doc, setDoc, serverTimestamp, increment, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

interface DemoUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isExpired?: boolean;
}

export default function DemoUpgradeModal({ isOpen, onClose, isExpired = false }: DemoUpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const getFriendlyErrorMessage = (code: string) => {
    const map: Record<string, string> = {
      "auth/invalid-email": "That doesn't look like a valid email address.",
      "auth/weak-password": "Your password is too short. Please use at least 6 characters.",
      "auth/email-already-in-use": "An account with this email already exists. Please log in instead.",
      "auth/credential-already-in-use": "This email is already linked to another account.",
    };
    return map[code] || `Error: ${code}. Please try again.`;
  };

  const grantWelcomeCoins = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { "rewards.awarenessPoints": increment(3) }).catch(() =>
        setDoc(userRef, { "rewards.awarenessPoints": 3 }, { merge: true })
      );
      const notifRef = doc(db, "users", uid, "notifications", Date.now().toString());
      await setDoc(notifRef, {
        title: "🎉 Welcome! +3 Coins",
        body: "Welcome to Crafting the Mind. Your full awareness journey starts now.",
        type: "coin_earned",
        read: false,
        data: null,
        createdAt: serverTimestamp(),
        uid,
      });
    } catch (e) {
      console.error("Welcome coin grant failed:", e);
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user currently signed in.");
      }

      const credential = EmailAuthProvider.credential(formData.email, formData.password);
      
      const result = await linkWithCredential(user, credential);
      await updateProfile(result.user, { displayName: formData.name });
      
      // Trigger Welcome Email (Now Secure)
      try {
        const idToken = await result.user.getIdToken();
        await fetch("/api/welcome", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, name: formData.name }),
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
        });
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }

      await grantWelcomeCoins(result.user.uid);
      
      toast.success("Account successfully created! Your data is saved.");
      onClose();
    } catch (err: any) {
      console.error("Upgrade error", err);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-background border border-border rounded-[2rem] overflow-hidden shadow-2xl relative"
        >
          {!isExpired && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-foreground tracking-tight mb-2">
                Save Your Progress
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isExpired
                  ? "Your 7-day demo has expired. Create a full account to save your logs and continue your journey."
                  : "Create a full account to ensure your logs and data are securely saved."}
              </p>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl pl-12 pr-12 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-coral-400 bg-coral-400/5 p-4 rounded-xl border border-coral-400/10 font-bold uppercase tracking-wider"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] transition-all mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            
            {isExpired && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    auth.signOut();
                    window.location.reload();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Or sign out and lose your demo data
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
