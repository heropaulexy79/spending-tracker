"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize analytics and log page views
    const trackPage = async () => {
      try {
        const analyticsInstance = await analytics();
        if (analyticsInstance) {
          logEvent(analyticsInstance, "page_view", {
            page_path: pathname,
            page_search: searchParams?.toString(),
          });
        }
      } catch (error) {
        console.error("Analytics Error:", error);
      }
    };

    trackPage();
  }, [pathname, searchParams]);

  return null;
}
