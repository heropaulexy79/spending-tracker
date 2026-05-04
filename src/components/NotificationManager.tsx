"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/context/AuthContext";

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
          // In a real app, save this token to the user's document in Firestore
        } else if (permission === "granted" && !vapidKey) {
          console.warn("Notification permission granted, but NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing in .env.local");
        }

        onMessage(m, (payload) => {
          console.log("Message received: ", payload);
          // Handle foreground message
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [user]);

  return null;
}
