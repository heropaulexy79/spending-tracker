"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTracking } from "@/hooks/useTracking";
import { currencies } from "@/lib/currencies";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function CurrencySwitcher() {
  const { plan, savePlan, loading } = useTracking();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = plan?.currency || "₦";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (symbol: string) => {
    setIsOpen(false);
    try {
      await savePlan({ ...plan, currency: symbol });
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  if (loading) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-muted border border-border text-primary hover:bg-muted/80 transition-all shadow-lg backdrop-blur-md font-serif font-bold text-lg"
        aria-label="Switch currency"
      >
        {currentCurrency}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 max-h-60 overflow-y-auto glass-card rounded-[1.5rem] p-2 shadow-2xl z-50 border border-border scrollbar-thin"
          >
            <div className="p-3 border-b border-border mb-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Select Currency</p>
            </div>
            <div className="space-y-0.5">
              {currencies.map((curr) => {
                const isSelected = currentCurrency === curr.symbol;
                return (
                  <button
                    key={curr.code}
                    onClick={() => handleSelect(curr.symbol)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left ${
                      isSelected ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-serif font-bold w-5 text-center">{curr.symbol}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{curr.code} - {curr.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
