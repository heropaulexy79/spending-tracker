"use client";

import LogForm from "@/components/LogForm";
import { useState } from "react";
import { motion } from "framer-motion";

import { useTracking } from "@/hooks/useTracking";

export default function LogPage() {
  const { logs, addLog, loading } = useTracking();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogSubmit = async (data: any) => {
    await addLog(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Reality Log</h1>
        <p className="text-muted-foreground">Log your daily spending. Slow down and reflect.</p>
      </header>

      <LogForm onSubmit={handleLogSubmit} />

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl text-center font-medium"
        >
          Reality Logged Successfully!
        </motion.div>
      )}

      {logs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Log History</h2>
          <div className="space-y-3 pb-8">
            {logs.map((log, i) => (
              <motion.div 
                key={log.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 glass rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-white">{log.item || "Unspecified Item"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {log.spendingType} • {log.decisionType} • Trigger: {log.trigger}
                  </p>
                </div>
                <p className="font-bold text-white">{log.amount ? `₦${Number(log.amount).toLocaleString()}` : "—"}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
