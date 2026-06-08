"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp, increment, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getWeekKey, getMonthKey, getLocalDateString } from "@/lib/dateUtils";

interface TrackingContextType {
  plan: any;
  rewards: { awarenessPoints: number; badges: string[] };
  logs: any[];
  urges: any[];
  reflections: any[];
  checkIns: any[];
  monthlyIncome: number;
  preAppMonthlySpendingEstimate: number;
  loading: boolean;
  noSpendDayLogged: boolean;
  spendLoggedToday: boolean;
  urgeLoggedToday: boolean;
  reflectionLoggedToday: boolean;
  checkedInToday: boolean;
  savePlan: (newPlan: any) => Promise<void>;
  saveProjectionsBaseline: (income: number, estimate: number) => Promise<void>;
  addLog: (log: any) => Promise<void>;
  addUrge: (urge: any) => Promise<void>;
  resolveUrge: (urgeId: string, action: "Resisted" | "Purchased", shouldSave?: boolean) => Promise<void>;
  addReflection: (reflection: any) => Promise<void>;
  addCheckIn: (score: number) => Promise<void>;
  updateRewards: (pointDelta: number, newBadge?: string) => Promise<void>;
  getHistoricalData: (type: 'week' | 'month', key: string) => Promise<{ logs: any[], urges: any[] }>;
  triggerSystemNotification: (title: string, body: string) => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [rewards, setRewards] = useState<{ awarenessPoints: number, badges: string[] }>({ awarenessPoints: 0, badges: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [urges, setUrges] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [preAppMonthlySpendingEstimate, setPreAppMonthlySpendingEstimate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Reset state on logout
      setPlan(null);
      setRewards({ awarenessPoints: 0, badges: [] });
      setLogs([]);
      setUrges([]);
      setReflections([]);
      setCheckIns([]);
      return;
    }

    setLoading(true);
    const weekKey = getWeekKey();
    const userRef = doc(db, "users", user.uid);

    let unsubUser = () => {};
    let unsubLogs = () => {};
    let unsubUrges = () => {};
    let unsubReflections = () => {};
    let unsubCheckIns = () => {};

    try {
      unsubUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const currentWeek = getWeekKey();
          const userCurrency = data.currency || data.plan?.currency || "₦";
          
          if (data.plan && data.plan.weekKey === currentWeek) {
            setPlan({ ...data.plan, currency: userCurrency });
          } else {
            setPlan({ currency: userCurrency });
          }
          setRewards(data.rewards || { awarenessPoints: 0, badges: [] });
          setMonthlyIncome(Number(data.monthlyIncome) || 0);
          setPreAppMonthlySpendingEstimate(Number(data.preAppMonthlySpendingEstimate) || 0);
        } else {
          setPlan({ currency: "₦" });
        }
        setLoading(false);
      }, (err) => console.error("User Context Error:", err));

      const logsRef = collection(db, "users", user.uid, "logs");
      const qLogs = query(logsRef, where("monthKey", "==", getMonthKey()));
      unsubLogs = onSnapshot(qLogs, (snap) => {
        const l = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        l.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
          const timeB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
          return timeB - timeA;
        });
        setLogs(l);
      }, (err) => console.error("Logs Context Error:", err));

      const urgesRef = collection(db, "users", user.uid, "urges");
      const qUrges = query(urgesRef, where("weekKey", "==", weekKey));
      unsubUrges = onSnapshot(qUrges, (snap) => {
        const u = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        u.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setUrges(u);
      }, (err) => console.error("Urges Context Error:", err));
      
      const reflectionsRef = collection(db, "users", user.uid, "reflections");
      const qReflections = query(reflectionsRef, where("weekKey", "==", weekKey));
      unsubReflections = onSnapshot(qReflections, (snap) => {
        const r = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReflections(r);
      }, (err) => console.error("Reflections Context Error:", err));

      const checkInsRef = collection(db, "users", user.uid, "checkins");
      const qCheckIns = query(checkInsRef, where("weekKey", "==", weekKey));
      unsubCheckIns = onSnapshot(qCheckIns, (snap) => {
        const c = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCheckIns(c);
      }, (err) => console.error("Check-ins Context Error:", err));
    } catch (err) {
      console.error("Setup Context Listeners Error:", err);
      setLoading(false);
    }

    return () => {
      unsubUser();
      unsubLogs();
      unsubUrges();
      unsubReflections();
      unsubCheckIns();
    };
  }, [user]);

  const savePlan = async (newPlan: any) => {
    if (!user) return;
    const { budget = "", categoryLimits = {}, ...rest } = newPlan;
    const currency = newPlan.currency || plan?.currency || "₦";
    const userRef = doc(db, "users", user.uid);
    const weekKey = getWeekKey();
    await setDoc(userRef, { 
      plan: { budget, categoryLimits, currency, weekKey, ...rest }, 
      currency,
      lastUpdated: serverTimestamp() 
    }, { merge: true });
  };

  const saveProjectionsBaseline = async (income: number, estimate: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { 
      monthlyIncome: Number(income) || 0,
      preAppMonthlySpendingEstimate: Number(estimate) || 0,
      lastUpdated: serverTimestamp() 
    }, { merge: true });
  };

  const addLog = async (log: any) => {
    if (!user) return;
    const { item, amount, category, subCategory, behaviorTags, spendingType, mood, noSpendDay, date, isSavings } = log;
    const weekKey = getWeekKey();
    const logRef = doc(collection(db, "users", user.uid, "logs"));
    await setDoc(logRef, { 
      item: String(item).substring(0, 100),
      amount: Number(amount) || 0,
      category: category || null,
      subCategory: subCategory || null,
      behaviorTags: behaviorTags || [],
      spendingType: spendingType || category || "Uncategorized",
      mood: mood || "Calm",
      noSpendDay: !!noSpendDay,
      isSavings: !!isSavings,
      date,
      uid: user.uid,
      weekKey, 
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    await updateRewards(5);
  };

  const addUrge = async (urge: any) => {
    if (!user) return;
    const { item, amount, type, action, resisted24h, trigger, delayReason, delayRevisit } = urge;
    const weekKey = getWeekKey();
    const urgeRef = doc(collection(db, "users", user.uid, "urges"));
    await setDoc(urgeRef, { 
      item: item || "Unspecified Item",
      amount: Number(amount) || 0,
      type,
      action,
      resisted24h: !!resisted24h,
      trigger: trigger || null,
      delayReason: delayReason || null,
      delayRevisit: delayRevisit || null,
      uid: user.uid,
      weekKey, 
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    if (action === "Resisted" || action === "Delayed") {
      await updateRewards(10);
    }
  };

  const resolveUrge = async (urgeId: string, action: "Resisted" | "Purchased", shouldSave: boolean = false) => {
    if (!user) return;
    const urgeRef = doc(db, "users", user.uid, "urges", urgeId);
    const urgeSnap = urges.find(u => u.id === urgeId);
    
    await updateDoc(urgeRef, { 
      action,
      resolvedAt: serverTimestamp(),
      convertedToSavings: shouldSave
    });

    if (shouldSave && urgeSnap) {
      await addLog({
        item: `Savings from: ${urgeSnap.item}`,
        amount: urgeSnap.amount,
        category: "Growth",
        spendingType: "Savings",
        isSavings: true,
        date: getLocalDateString(),
        createdAt: new Date()
      });
    }

    if (action === "Resisted") {
      await updateRewards(15); // Bonus for following through
    }
  };

  const updateRewards = async (pointDelta: number, newBadge?: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const updateData: any = { "rewards.awarenessPoints": increment(pointDelta) };
    if (newBadge) updateData["rewards.badges"] = arrayUnion(newBadge);
    try {
      await updateDoc(userRef, updateData);
    } catch (err) {
      await setDoc(userRef, updateData, { merge: true });
    }
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
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    await updateRewards(5);
  };

  const addCheckIn = async (score: number) => {
    if (!user) return;
    const weekKey = getWeekKey();
    const checkInRef = doc(collection(db, "users", user.uid, "checkins"));
    await setDoc(checkInRef, { 
      score: Number(score) || 0,
      date: getLocalDateString(),
      uid: user.uid,
      weekKey, 
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    await updateRewards(5);
  };

  const todayStr = getLocalDateString();
  const noSpendDayLogged = logs.some(l => l.date === todayStr && l.noSpendDay === true);
  const spendLoggedToday = logs.some(l => l.date === todayStr && !l.noSpendDay && !l.isSavings);
  const urgeLoggedToday = urges.some(u => {
    if (u.type === "Calm") return false;
    let uDate: Date;
    if (u.createdAt && typeof u.createdAt === "object" && "seconds" in u.createdAt) {
      uDate = new Date((u.createdAt as any).seconds * 1000);
    } else {
      uDate = u.createdAt ? new Date(u.createdAt) : new Date();
    }
    return getLocalDateString(uDate) === todayStr;
  });
  const reflectionLoggedToday = reflections.some(r => {
    let rDate: Date;
    if (r.createdAt && typeof r.createdAt === "object" && "seconds" in r.createdAt) {
      rDate = new Date((r.createdAt as any).seconds * 1000);
    } else {
      rDate = r.createdAt ? new Date(r.createdAt) : new Date();
    }
    return getLocalDateString(rDate) === todayStr;
  });
  const checkedInToday = checkIns.some(c => c.date === todayStr);

  const getHistoricalData = async (type: 'week' | 'month', key: string) => {
    if (!user) return { logs: [], urges: [] };
    const logsRef = collection(db, "users", user.uid, "logs");
    const urgesRef = collection(db, "users", user.uid, "urges");
    const field = type === 'week' ? "weekKey" : "monthKey";
    const qLogs = query(logsRef, where(field, "==", key));
    const qUrges = query(urgesRef, where(field, "==", key));
    const { getDocs } = await import("firebase/firestore");
    const [lSnap, uSnap] = await Promise.all([getDocs(qLogs), getDocs(qUrges)]);
    return {
      logs: lSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      urges: uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  };

  const triggerSystemNotification = async (title: string, body: string) => {
    // Notifications removed per user request
    return;
  };

  return (
    <TrackingContext.Provider value={{ 
      plan, rewards, logs, urges, reflections, checkIns, loading,
      noSpendDayLogged, spendLoggedToday, urgeLoggedToday, reflectionLoggedToday, checkedInToday,
      monthlyIncome, preAppMonthlySpendingEstimate, savePlan, saveProjectionsBaseline,
      addLog, addUrge, resolveUrge, addReflection, addCheckIn, updateRewards, getHistoricalData, triggerSystemNotification
    }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error("useTrackingContext must be used within a TrackingProvider");
  }
  return context;
}
