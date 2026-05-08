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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-3xl border-t border-border pb-safe">
      <div className="flex justify-between items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 relative flex flex-col items-center justify-center transition-all duration-300 py-1",
                isActive ? "text-primary" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive && "scale-110"
              )}>
                <Icon className={cn("w-4.5 h-4.5", isActive && "stroke-[2px]")} />
              </div>
              <span className="text-[6px] font-bold uppercase tracking-[0.1em] mt-1 text-center">
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-4 h-[1px] bg-primary" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
