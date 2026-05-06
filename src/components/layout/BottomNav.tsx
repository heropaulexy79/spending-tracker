"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Zap, BookOpen, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Plan", href: "/plan" },
  { icon: PenLine, label: "Log", href: "/log" },
  { icon: Zap, label: "Urge", href: "/urge" },
  { icon: BookOpen, label: "Reflect", href: "/reflect" },
  { icon: BarChart3, label: "Stats", href: "/stats" },
  { icon: Calendar, label: "Mirror", href: "/mirror" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-3xl border-t border-white/5 pb-safe">
      <div className="flex justify-between items-center h-20 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "scale-105" : "hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 text-primary" : "bg-transparent text-muted-foreground"
              )}>
                <Icon className={cn("w-4.5 h-4.5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[7px] xs:text-[8px] font-bold uppercase tracking-[0.1em] transition-all duration-300",
                isActive ? "opacity-100 text-primary" : "opacity-40 text-muted-foreground"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
