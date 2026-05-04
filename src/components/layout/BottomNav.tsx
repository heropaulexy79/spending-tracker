"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Zap, BookOpen, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-white/5 pb-safe">
      <div className="flex justify-between items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
