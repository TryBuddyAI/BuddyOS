"use client";

import { useEffect } from "react";
import { useCompanion } from "@/lib/companionStore";
import { detectQualityTier } from "@/lib/viewport";

export function ClientBoot() {
  useEffect(() => {
    // Hydrate persisted store
    useCompanion.persist?.rehydrate?.();

    // Increment visit counter
    useCompanion.getState().incrementVisit();

    // Quality tier auto-detect (only override if still default `high`)
    const detected = detectQualityTier();
    useCompanion.getState().setQualityTier(detected);

  }, []);

  return null;
}
