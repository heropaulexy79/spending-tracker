"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // If new user, trigger welcome email
      const isNewUser = (result.user.metadata as any).createdAt === (result.user.metadata as any).lastLoginAt;
      if (isNewUser) {
        try {
          const idToken = await result.user.getIdToken();
          await fetch("/api/welcome", {
            method: "POST",
            body: JSON.stringify({ email: result.user.email, name: result.user.displayName }),
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
          });
        } catch (e) {
          console.error("Failed to send welcome email for Google user:", e);
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
    setLoading(true);
    setError("");

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
    <div className="w-full max-w-md mx-auto p-8 glass rounded-[2.5rem] animate-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isLogin ? "Welcome Back" : "Join the Movement"}
        </h2>
        <p className="text-muted-foreground">
          {isLogin ? "Track your behavior with intention." : "Start your journey to financial awareness."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-primary transition-all"
              required={!isLogin}
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-primary transition-all"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-primary transition-all"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-coral-400 bg-coral-400/10 p-3 rounded-xl border border-coral-400/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0A0A0B] px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all"
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

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground hover:text-white transition-colors"
        >
          {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
