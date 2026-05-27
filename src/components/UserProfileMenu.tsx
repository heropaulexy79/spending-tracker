"use client";

import { useState, useRef, useEffect } from "react";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function UserProfileMenu() {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="p-3 rounded-2xl glass-card hover:bg-muted transition-all active:scale-95 text-muted-foreground hover:text-foreground"
      >
        <UserIcon className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 bg-background rounded-[1.5rem] p-2 shadow-2xl z-50 border border-border"
          >
            <div className="p-4 border-b border-border mb-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Identity</p>
              <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
            </div>
            
            <Link 
              href="/settings"
              onClick={() => setShowUserMenu(false)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Settings className="w-4 h-4 text-primary" />
              Settings
            </Link>
            
            <div className="h-[1px] bg-border my-1 mx-2" />
            
            <button 
              onClick={() => {
                setShowUserMenu(false);
                signOut(auth);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-coral/10 text-coral transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
