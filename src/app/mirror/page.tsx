"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Sparkles, Heart } from "lucide-react";

export default function MirrorPage() {
  return (
    <div className="space-y-8 animate-in pb-12">
      <header className="space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Mirror</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Monthly Mirror</h1>
        <p className="text-muted-foreground">A summary of your behavior this month.</p>
      </header>

      {/* Growth Narrative */}
      <div className="p-8 glass rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Calendar className="w-32 h-32 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Growth Narrative
        </h2>
        <div className="space-y-4 text-white/80 leading-relaxed">
          <p className="italic">“Your narrative is forming. Complete your first month to reveal your growth story.”</p>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Total Spent</p>
          <p className="text-2xl font-bold text-white">₦0</p>
        </div>
        <div className="p-6 glass rounded-3xl space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Total Saved</p>
          <p className="text-2xl font-bold text-emerald-400">₦0</p>
        </div>
      </div>

      {/* Behavior Consistency */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Consistency</h2>
        <div className="p-6 glass rounded-3xl space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Adherence</span>
              <span className="text-white font-medium">0%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-0" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">No-Spend Consistency</span>
              <span className="text-white font-medium">0 Days</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Most Common Trigger</p>
              <p className="text-sm font-semibold text-white">N/A</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Impulse Rate</p>
              <p className="text-sm font-semibold text-white">0%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Message */}
      <div className="text-center py-10 space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400/20" />
        </div>
        <p className="text-muted-foreground italic px-8">
          "This is not about perfection. It is about awareness and progress."
        </p>
      </div>
    </div>
  );
}
