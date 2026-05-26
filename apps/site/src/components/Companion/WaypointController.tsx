"use client";

import { useEffect, useRef } from "react";
import { useCompanion } from "@/lib/companionStore";
import { waypoints } from "@/lib/waypoints";
import { subscribeLenis } from "@/components/Layout/SmoothScroll";
import { isMobile } from "@/lib/viewport";

const HIT_RANGE = 0.05;
const FAST_VELOCITY_PX = 3000;

export function WaypointController() {
  const goToWaypoint = useCompanion((s) => s.goToWaypoint);
  const setScrollVelocity = useCompanion((s) => s.setScrollVelocity);
  const lastWaypointId = useRef<string | null>(null);
  const lingerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = subscribeLenis(({ progress, velocity }) => {
      setScrollVelocity(velocity);

      // Find nearest waypoint within hit range
      let nearest = null as (typeof waypoints)[number] | null;
      let nearestDist = HIT_RANGE;
      for (const w of waypoints) {
        const d = Math.abs(w.scrollProgress - progress);
        if (d < nearestDist) {
          nearest = w;
          nearestDist = d;
        }
      }

      if (!nearest) return;
      if (nearest.id === lastWaypointId.current) return;

      const adjusted: typeof nearest = isMobile()
        ? {
            ...nearest,
            anchor: nearest.mobileAnchor ?? nearest.anchor,
            scale: nearest.mobileScale ?? nearest.scale,
          }
        : nearest;

      const apply = () => {
        lastWaypointId.current = adjusted.id;
        goToWaypoint(adjusted.id, adjusted);
      };

      // Fast scroll: defer until user lingers >800ms
      if (Math.abs(velocity) > FAST_VELOCITY_PX) {
        if (lingerTimer.current) clearTimeout(lingerTimer.current);
        lingerTimer.current = setTimeout(apply, 800);
      } else {
        if (lingerTimer.current) {
          clearTimeout(lingerTimer.current);
          lingerTimer.current = null;
        }
        apply();
      }
    });

    return () => {
      unsub();
      if (lingerTimer.current) clearTimeout(lingerTimer.current);
    };
  }, [goToWaypoint, setScrollVelocity]);

  // Kick off the first waypoint on mount, so BUDDY isn't stranded if the
  // user lands without scrolling.
  useEffect(() => {
    const initial = waypoints[0];
    if (!initial) return;
    const t = setTimeout(() => {
      if (!lastWaypointId.current) {
        lastWaypointId.current = initial.id;
        const adj = isMobile()
          ? {
              ...initial,
              anchor: initial.mobileAnchor ?? initial.anchor,
              scale: initial.mobileScale ?? initial.scale,
            }
          : initial;
        useCompanion.getState().goToWaypoint(initial.id, adj);
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return null;
}
