"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicBackground() {
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Determine theme based on hour
  // Morning (5-10): Deep Blue
  // Day (10-17): Standard Dark
  // Evening (17-21): Warm Charcoal
  // Night (21-5): Midnight
  
  let gradient = "from-[#0A0A0B] to-[#0A0A0B]";
  let accent = "opacity-0";

  if (hour >= 5 && hour < 10) {
    // Dawn: Soft Indigo/Blue
    gradient = "from-[#0A0B10] via-[#0D1117] to-[#0A0A0B]";
    accent = "bg-blue-500/5 opacity-100";
  } else if (hour >= 10 && hour < 17) {
    // Day: Standard Deep Dark
    gradient = "from-[#0A0A0B] to-[#0A0A0B]";
    accent = "opacity-0";
  } else if (hour >= 17 && hour < 21) {
    // Evening: Warm Charcoal/Bronze
    gradient = "from-[#0D0C0B] via-[#11100F] to-[#0A0A0B]";
    accent = "bg-orange-500/5 opacity-100";
  } else {
    // Night: Midnight
    gradient = "from-[#050506] to-[#0A0A0B]";
    accent = "bg-purple-900/5 opacity-100";
  }

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base Background */}
      <motion.div 
        initial={false}
        animate={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
        className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out bg-gradient-to-br ${gradient}`}
      />
      
      {/* Subtle Glow Accent */}
      <motion.div 
        initial={false}
        animate={{ opacity: hour >= 17 && hour < 21 ? 1 : hour >= 5 && hour < 10 ? 0.6 : 0 }}
        className={`absolute inset-0 transition-all duration-[5000ms] ease-in-out ${accent} blur-[120px]`}
      />

      {/* Grain/Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
