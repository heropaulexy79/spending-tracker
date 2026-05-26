"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getWeekKey, getMonthKey, getLocalDateString } from "@/lib/dateUtils";

export function useTracking() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [rewards, setRewards] = useState<{ coins: number, badges: string[] }>({ coins: 0, badges: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [urges, setUrges] = useState<any[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [preAppMonthlySpendingEstimate, setPreAppMonthlySpendingEstimate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const weekKey = getWeekKey();

    // Subscribe to Budget (Hierarchical path)
    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentWeek = getWeekKey();
        const userCurrency = data.currency || data.plan?.currency || "₦";
        
        if (data.plan && data.plan.weekKey === currentWeek) {
          setPlan({ ...data.plan, currency: userCurrency });
        } else {
          setPlan({ currency: userCurrency });
        }
        setRewards(data.rewards || { coins: 0, badges: [] });
        setMonthlyIncome(Number(data.monthlyIncome) || 0);
        setPreAppMonthlySpendingEstimate(Number(data.preAppMonthlySpendingEstimate) || 0);
      } else {
        setPlan({ currency: "₦" });
      }
      setLoading(false);
    }, (err) => console.error("User Listener Error:", err));

    // Subscribe to Logs (Server-side filtered)
    const logsRef = collection(db, "users", user.uid, "logs");
    const qLogs = query(logsRef, where("monthKey", "==", getMonthKey()));
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
      unsubUser();
      unsubLogs();
      unsubUrges();
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
  };

  const addUrge = async (urge: any) => {
    if (!user) return;
    const { type, action, resisted24h, trigger, delayReason, delayRevisit } = urge;
    const weekKey = getWeekKey();
    const urgeRef = doc(collection(db, "users", user.uid, "urges"));
    await setDoc(urgeRef, { 
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

    // Reward for resisting
    if (action === "Resisted" || action === "Delayed") {
      await updateRewards(10); // 10 coins for resisting
    }
  };

  const updateRewards = async (coinDelta: number, newBadge?: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const currentCoins = rewards.coins || 0;
    const currentBadges = rewards.badges || [];
    
    const updateData: any = {
      "rewards.coins": currentCoins + coinDelta,
    };

    if (newBadge && !currentBadges.includes(newBadge)) {
      updateData["rewards.badges"] = [...currentBadges, newBadge];
    }

    await setDoc(userRef, updateData, { merge: true });
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
  };


  const todayStr = getLocalDateString();
  const noSpendDayLogged = logs.some(l => l.date === todayStr && l.noSpendDay === true);
  const spendLoggedToday = logs.some(l => l.date === todayStr && !l.noSpendDay && !l.isSavings);

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
    if (typeof window === "undefined" || !("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: "/spendingtracker(black_bac_logo).png",
          badge: "/spendingtracker(black_bac_logo).png",
          tag: "behavior-reminder", // Avoid duplicate notifications
        });
      } catch (err) {
        console.error("SW Notification Error:", err);
        // Fallback to simple notification
        new Notification(title, { body });
      }
    }
  };

  return { 
    plan, 
    rewards,
    logs, 
    urges, 
    savePlan, 
    addLog, 
    addUrge, 
    addReflection, 
    updateRewards,
    getHistoricalData,
    triggerSystemNotification,
    monthlyIncome,
    preAppMonthlySpendingEstimate,
    saveProjectionsBaseline,
    loading, 
    noSpendDayLogged, 
    spendLoggedToday 
  };
}
