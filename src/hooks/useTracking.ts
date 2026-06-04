"use client";

import { useTrackingContext } from "@/context/TrackingContext";

export function useTracking() {
  return useTrackingContext();
}
