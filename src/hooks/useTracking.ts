"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getWeekKey } from "@/lib/dateUtils";

export function useTracking() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [urges, setUrges] = useState<any[]>([]);
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

    // Subscribe to Logs (Server-side filtered)
    const logsRef = collection(db, "users", user.uid, "logs");
    const qLogs = query(logsRef, where("weekKey", "==", weekKey));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const l = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      l.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
        const timeB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
        return timeB - timeA;
      });
      setLogs(l);
    }, (err) => console.error("Logs Listener Error:", err));

    // Subscribe to Urges (Server-side filtered)
    const urgesRef = collection(db, "users", user.uid, "urges");
    const qUrges = query(urgesRef, where("weekKey", "==", weekKey));
    const unsubUrges = onSnapshot(qUrges, (snap) => {
      const u = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      u.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setUrges(u);
    }, (err) => console.error("Urges Listener Error:", err));

    return () => {
      unsubBudget();
      unsubLogs();
      unsubUrges();
    };
  }, [user]);

  const savePlan = async (newPlan: any) => {
    if (!user) return;
    const { budget, categoryLimits, currency } = newPlan;
    const budgetRef = doc(db, "users", user.uid);
    await setDoc(budgetRef, { 
      plan: { budget, categoryLimits, currency }, 
      lastUpdated: serverTimestamp() 
    }, { merge: true });
  };

  const addLog = async (log: any) => {
    if (!user) return;
    const { item, amount, decisionType, spendingType, trigger, mood, noSpendDay, date } = log;
    const weekKey = getWeekKey();
    const logRef = doc(collection(db, "users", user.uid, "logs"));
    await setDoc(logRef, { 
      item: String(item).substring(0, 100),
      amount: Number(amount) || 0,
      decisionType,
      spendingType,
      trigger,
      mood: mood || "Calm",
      noSpendDay: !!noSpendDay,
      date,
      uid: user.uid,
      weekKey, 
      createdAt: serverTimestamp() 
    });
  };

  const addUrge = async (urge: any) => {
    if (!user) return;
    const { type, action, resisted24h } = urge;
    const weekKey = getWeekKey();
    const urgeRef = doc(collection(db, "users", user.uid, "urges"));
    await setDoc(urgeRef, { 
      type,
      action,
      resisted24h: !!resisted24h,
      uid: user.uid,
      weekKey, 
      createdAt: serverTimestamp() 
    });
  };

  const addReflection = async (reflection: any) => {
    if (!user) return;
    const { why, beforeFeel, afterFeel, aligned, nextTime } = reflection;
    const weekKey = getWeekKey();
    const reflectionRef = doc(collection(db, "users", user.uid, "reflections"));
    await setDoc(reflectionRef, { 
      why: String(why).substring(0, 1000),
      beforeFeel,
      afterFeel,
      aligned,
      nextTime: String(nextTime).substring(0, 1000),
      uid: user.uid,
      weekKey, 
      createdAt: serverTimestamp() 
    });
  };


  const todayStr = new Date().toISOString().split("T")[0];
  const noSpendDayLogged = logs.some(l => l.date === todayStr && l.noSpendDay === true);
  const spendLoggedToday = logs.some(l => l.date === todayStr && !l.noSpendDay);

  return { plan, logs, urges, savePlan, addLog, addUrge, addReflection, loading, noSpendDayLogged, spendLoggedToday };
}
