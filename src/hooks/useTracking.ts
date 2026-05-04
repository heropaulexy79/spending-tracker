"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getWeekKey } from "@/lib/dateUtils";

export function useTracking() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const weekKey = getWeekKey();

    // Subscribe to Budget (Hierarchical path)
    const budgetRef = doc(db, "users", user.uid);
    const unsubBudget = onSnapshot(budgetRef, (doc) => {
      if (doc.exists()) {
        setPlan(doc.data().plan || null);
      }
      setLoading(false);
    }, (err) => console.error("Budget Listener Error:", err));

    // Subscribe to Logs (Hierarchical subcollection)
    const logsRef = collection(db, "users", user.uid, "logs");
    const q = query(logsRef);
    const unsubLogs = onSnapshot(q, (snap) => {
      const l = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((log: any) => log.weekKey === weekKey);
      l.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLogs(l);
    }, (err) => console.error("Logs Listener Error:", err));

    return () => {
      unsubBudget();
      unsubLogs();
    };
  }, [user]);

  const savePlan = async (newPlan: any) => {
    if (!user) return;
    const budgetRef = doc(db, "users", user.uid);
    await setDoc(budgetRef, { plan: newPlan, lastUpdated: new Date().toISOString() }, { merge: true });
  };

  const addLog = async (log: any) => {
    if (!user) return;
    const weekKey = getWeekKey();
    const logRef = doc(collection(db, "users", user.uid, "logs"));
    await setDoc(logRef, { 
      ...log, 
      uid: user.uid,
      amount: Number(log.amount) || 0,
      weekKey, 
      createdAt: new Date().toISOString() 
    });
  };


  return { plan, logs, savePlan, addLog, loading };
}
