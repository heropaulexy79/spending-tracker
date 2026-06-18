"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp, increment, arrayUnion, limit, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getWeekKey, getMonthKey, getLocalDateString } from "@/lib/dateUtils";

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "coin_earned" | "urge_activated" | "urge_followup" | "weekly_summary" | "general"
    | "spend_logged" | "no_spend_day" | "check_in" | "reflection" | "urge_resisted" | "urge_purchased" | "savings_logged" | "emotional_checkin";
  read: boolean;
  createdAt: any;
  data?: any;
}

interface TrackingContextType {
  plan: any;
  rewards: { awarenessPoints: number; badges: string[] };
  logs: any[];
  urges: any[];
  reflections: any[];
  checkIns: any[];
  notifications: AppNotification[];
  unreadCount: number;
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
  resolveUrge: (urgeId: string, action: "Resisted" | "Purchased", shouldSave?: boolean, saveAmount?: number, followUpData?: any) => Promise<void>;
  addReflection: (reflection: any) => Promise<void>;
  addCheckIn: (score: number, emotion?: string) => Promise<void>;
  updateRewards: (pointDelta: number, newBadge?: string) => Promise<void>;
  addNotification: (title: string, body: string, type: AppNotification["type"], data?: any) => Promise<void>;
  markAllRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [preAppMonthlySpendingEstimate, setPreAppMonthlySpendingEstimate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setPlan(null);
      setRewards({ awarenessPoints: 0, badges: [] });
      setLogs([]);
      setUrges([]);
      setReflections([]);
      setCheckIns([]);
      setNotifications([]);
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
    let unsubNotifications = () => {};

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
      // Fetch more than just current week for the history page
      const qUrges = query(urgesRef, orderBy("createdAt", "desc"), limit(100));
      unsubUrges = onSnapshot(qUrges, (snap) => {
        const u = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUrges(u);
      }, (err) => console.error("Urges Context Error:", err));
      
      const reflectionsRef = collection(db, "users", user.uid, "reflections");
      const qReflections = query(reflectionsRef, where("weekKey", "==", weekKey));
      unsubReflections = onSnapshot(qReflections, (snap) => {
        const r = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReflections(r);
      }, (err) => console.error("Reflections Context Error:", err));

      const checkInsRef = collection(db, "users", user.uid, "checkins");
      const qCheckIns = query(checkInsRef, orderBy("createdAt", "desc"), limit(30));
      unsubCheckIns = onSnapshot(qCheckIns, (snap) => {
        const c = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCheckIns(c);
      }, (err) => console.error("Check-ins Context Error:", err));

      // Subscribe to notifications (last 30)
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const qNotifications = query(notificationsRef, orderBy("createdAt", "desc"), limit(30));
      unsubNotifications = onSnapshot(qNotifications, (snap) => {
        const n = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
        setNotifications(n);
      }, (err) => console.error("Notifications Context Error:", err));

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
      unsubNotifications();
    };
  }, [user]);

  const triggerFiredRef = React.useRef(false);

  // Handle auto-generating the emotional check-in
  useEffect(() => {
    if (!user || loading || notifications.length === 0 && checkIns.length === 0) return;
    if (triggerFiredRef.current) return;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(Sun), 1(Mon), 2(Tue), 3(Wed), 4(Thu), 5(Fri), 6(Sat)
    if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
      const todayStr = getLocalDateString(today);
      
      // Check if we already have an emotional checkin notification today
      const hasPendingCheckinNotif = notifications.some(n => 
        n.type === "emotional_checkin" && 
        n.createdAt && 
        getLocalDateString(n.createdAt.seconds ? new Date(n.createdAt.seconds * 1000) : new Date(n.createdAt)) === todayStr
      );
      
      // Check if user already checked in with an emotion today
      const hasCheckedInToday = checkIns.some(c => c.date === todayStr && c.emotion);
      
      if (!hasPendingCheckinNotif && !hasCheckedInToday) {
        triggerFiredRef.current = true;
        addNotification(
          "How are you feeling?",
          "Tap to log your emotional state.",
          "emotional_checkin"
        );
      }
    }
  }, [user, loading, notifications, checkIns]);

  const addNotification = async (title: string, body: string, type: AppNotification["type"], data?: any) => {
    if (!user) return;
    const notifRef = doc(collection(db, "users", user.uid, "notifications"));
    await setDoc(notifRef, {
      title,
      body,
      type,
      read: false,
      data: data || null,
      createdAt: serverTimestamp(),
      uid: user.uid,
    });
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read && n.type !== "emotional_checkin"); // don't auto-read emotional checkin
    await Promise.all(unread.map(n => {
      const ref = doc(db, "users", user.uid, "notifications", n.id);
      return updateDoc(ref, { read: true });
    }));
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "notifications", id);
    await updateDoc(ref, { read: true });
  };

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
    // 2 coins per log entry
    await updateRewards(2);
    if (noSpendDay) {
      await addNotification(
        "🌿 No-Spend Day Logged",
        "You chose not to spend today. That discipline is building your future.",
        "no_spend_day"
      );
    } else if (isSavings) {
      await addNotification(
        "💰 Savings Logged (+2 coins)",
        `${String(item).substring(0, 40)} – your future self is proud.`,
        "savings_logged"
      );
    } else {
      await addNotification(
        "📝 Spending Logged (+2 coins)",
        `Choice logged: ${String(item).substring(0, 40)}`,
        "spend_logged"
      );
    }
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
      convertedToSavings: null,
      uid: user.uid,
      weekKey, 
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    // Notify about urge being tracked
    await addNotification(
      "⏱ Urge Paused",
      `You paused on: ${item || "an item"}. Check back in 24h to close the loop.`,
      "urge_activated",
      { item, amount }
    );
  };

  const resolveUrge = async (urgeId: string, action: "Resisted" | "Purchased", shouldSave: boolean = false, saveAmount?: number, followUpData?: any) => {
    if (!user) return;
    const urgeRef = doc(db, "users", user.uid, "urges", urgeId);
    const urgeSnap = urges.find(u => u.id === urgeId);
    
    await updateDoc(urgeRef, { 
      action,
      resolvedAt: serverTimestamp(),
      convertedToSavings: shouldSave,
      savedAmount: shouldSave ? (saveAmount || urgeSnap?.amount || 0) : null,
      ...followUpData
    });

    if (shouldSave && urgeSnap) {
      const amountToSave = saveAmount || urgeSnap.amount;
      await addLog({
        item: `Awareness Savings: ${urgeSnap.item}`,
        amount: amountToSave,
        category: "Growth",
        spendingType: "Savings",
        isSavings: true,
        date: getLocalDateString(),
        createdAt: new Date()
      });
      // +1 coin for redirecting money to savings after urge resistance
      await updateRewards(1);
      await addNotification(
        "🌱 Awareness Saving (+1 coin)",
        `${plan?.currency || "₦"}${Number(amountToSave).toLocaleString()} redirected from "${urgeSnap.item}" to your Growth Goal.`,
        "savings_logged",
        { item: urgeSnap.item, amount: amountToSave }
      );
    }

    if (action === "Resisted") {
      // 2 coins for resisting an urge
      await updateRewards(2);
      await addNotification(
        "🏆 Urge Resisted! (+2 coins)",
        `You resisted buying "${urgeSnap?.item || "an item"}". That's real awareness.`,
        "urge_resisted"
      );
    } else if (action === "Purchased") {
      await addNotification(
        "📋 Purchase Reflected",
        `You reflected on buying "${urgeSnap?.item || "an item"}". Every choice is data.`,
        "urge_purchased"
      );
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
    await addNotification(
      "🧠 Reflection Logged (+5 coins)",
      "Your reflection was logged. That self-awareness is priceless.",
      "reflection"
    );
  };

  const addCheckIn = async (score: number, emotion?: string) => {
    if (!user) return;
    const weekKey = getWeekKey();
    const checkInRef = doc(collection(db, "users", user.uid, "checkins"));
    await setDoc(checkInRef, { 
      score: Number(score) || 0,
      emotion: emotion || null,
      date: getLocalDateString(),
      uid: user.uid,
      weekKey, 
      monthKey: getMonthKey(),
      createdAt: serverTimestamp() 
    });
    await updateRewards(5);
    await addNotification(
      "🌱 Daily Check-in (+5 coins)",
      "You checked in today. Consistency builds awareness.",
      "check_in"
    );
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
        });
      } catch (err) {
        console.warn("System notification failed:", err);
      }
    }
  };

  return (
    <TrackingContext.Provider value={{ 
      plan, rewards, logs, urges, reflections, checkIns, notifications, unreadCount, loading,
      noSpendDayLogged, spendLoggedToday, urgeLoggedToday, reflectionLoggedToday, checkedInToday,
      monthlyIncome, preAppMonthlySpendingEstimate, savePlan, saveProjectionsBaseline,
      addLog, addUrge, resolveUrge, addReflection, addCheckIn, updateRewards,
      addNotification, markAllRead, markAsRead, getHistoricalData, triggerSystemNotification
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
