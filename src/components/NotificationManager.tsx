"use client";

import { useEffect } from "react";
import { messaging, db } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";

export default function NotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        const m = await messaging();
        if (!m) return;

        const permission = await Notification.requestPermission();
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

        if (permission === "granted" && vapidKey) {
          const token = await getToken(m, { vapidKey });
          console.log("FCM Token:", token);
          
          // Save token to Firestore
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { fcmToken: token });
          
        } else if (permission === "granted" && !vapidKey) {
          console.warn("Notification permission granted, but VAPID key is missing.");
        }

        onMessage(m, (payload) => {
          console.log("Foreground Message received: ", payload);
          
          if (payload.notification) {
            new Notification(payload.notification.title || "Reminder", {
              body: payload.notification.body,
              icon: "/spendingtracker(black_bac_logo).png",
            });
          }
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [user]);

  return null;
}
