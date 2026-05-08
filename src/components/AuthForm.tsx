"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from "firebase/auth";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const getFriendlyErrorMessage = (code: string) => {
    const map: Record<string, string> = {
      "auth/invalid-email": "That doesn't look like a valid email address.",
      "auth/user-not-found": "No account found with that email. Want to sign up?",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password. Please check and try again.",
      "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
      "auth/weak-password": "Your password is too short. Please use at least 6 characters.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
      "auth/network-request-failed": "No internet connection. Please check your network.",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage("Password reset link sent! Check your inbox.");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Attempt to trigger welcome email ONLY for new users
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        try {
          const idToken = await result.user.getIdToken();
          await fetch("/api/welcome", {
            method: "POST",
            body: JSON.stringify({ 
              email: result.user.email, 
              name: result.user.displayName || "Friend" 
            }),
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
          });
        } catch (e) {
          console.error("Failed to trigger welcome flow for Google user:", e);
        }
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === "auth/unauthorized-domain") {
        setError("Your Vercel domain isn't authorized in the Firebase Console yet.");
      } else {
        setError(getFriendlyErrorMessage(err.code));
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetMode) {
      handleResetPassword(e);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(cred.user, { displayName: formData.name });
        
        // Trigger Welcome Email (Now Secure)
        try {
          const idToken = await cred.user.getIdToken();
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
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 glass-card animate-in relative overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif text-foreground mb-3 tracking-tight">
          {isResetMode ? "Restoring Access" : isLogin ? "Welcome Back" : "Begin the Journey"}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isResetMode 
            ? "Enter your email to receive a secure reset link." 
            : isLogin ? "Continue your practice of behavioral awareness." : "Join Crafting the Mind to start your guided behavioral tracking."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && !isResetMode && (
            <motion.div 
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground outline-none focus:border-primary transition-all"
                required={!isLogin && !isResetMode}
              />
            </motion.div>
          )}
        </AnimatePresence>

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

        {!isResetMode && (
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                required={!isResetMode}
              />
            </div>
            {isLogin && (
              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-xs text-primary/80 hover:text-primary hover:underline font-bold tracking-tight"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-coral-400 bg-coral-400/5 p-4 rounded-xl border border-coral-400/10 font-bold uppercase tracking-wider"
          >
            {error}
          </motion.p>
        )}

        {message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-emerald-400 bg-emerald-400/5 p-4 rounded-xl border border-emerald-400/10 font-bold uppercase tracking-wider"
          >
            {message}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(176,132,71,0.2)] active:scale-[0.98] transition-all mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isResetMode ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {!isResetMode && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-background px-4 text-muted-foreground/60 font-bold">Secure Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-muted border border-border text-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-muted/80 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </>
      )}

      <div className="mt-8 text-center">
        {isResetMode ? (
          <button
            onClick={() => setIsResetMode(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            Back to Login
          </button>
        ) : (
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
