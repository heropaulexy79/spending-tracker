"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
        
        // Trigger Welcome Email
        try {
          await fetch("/api/welcome", {
            method: "POST",
            body: JSON.stringify({ email: formData.email, name: formData.name }),
            headers: { "Content-Type": "application/json" },
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
