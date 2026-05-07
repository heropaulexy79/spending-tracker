"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function DynamicBackground() {
  const [hour, setHour] = useState(new Date().getHours());
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  let gradient = isDark ? "from-[#0A0A0B] to-[#0A0A0B]" : "from-[#fcfcfc] to-[#f5f5f5]";
  let accent = "opacity-0";

  if (isDark) {
    if (hour >= 5 && hour < 10) {
      gradient = "from-[#0A0B10] via-[#0D1117] to-[#0A0A0B]";
      accent = "bg-blue-500/5 opacity-100";
    } else if (hour >= 17 && hour < 21) {
      gradient = "from-[#0D0C0B] via-[#11100F] to-[#0A0A0B]";
      accent = "bg-orange-500/5 opacity-100";
    } else if (hour >= 21 || hour < 5) {
      gradient = "from-[#050506] to-[#0A0A0B]";
      accent = "bg-purple-900/5 opacity-100";
    }
  } else {
    // Light mode variations
    if (hour >= 5 && hour < 10) {
      gradient = "from-[#f0f4ff] via-[#f8faff] to-[#ffffff]";
      accent = "bg-blue-200/20 opacity-100";
    } else if (hour >= 17 && hour < 21) {
      gradient = "from-[#fff8f0] via-[#fffbf5] to-[#ffffff]";
      accent = "bg-orange-200/20 opacity-100";
    }
  }

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base Background */}
      <motion.div 
        initial={false}
        animate={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out bg-gradient-to-br ${gradient}`}
      />
      
      {/* Subtle Glow Accent */}
      <motion.div 
        initial={false}
        animate={{ opacity: accent.includes("opacity-100") ? 1 : 0 }}
        className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out ${accent} blur-[120px]`}
      />

      {/* Grain/Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
