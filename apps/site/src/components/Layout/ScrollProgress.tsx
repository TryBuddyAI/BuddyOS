"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/**
 * Fixed vertical scroll-progress rail on the right edge. A thin track with a
 * spring-smoothed accent fill that scales from the top as the page scrolls —
 * a quiet "this is a journey" signal. Hidden on small screens and under
 * reduced-motion (the spring would fight the user's preference).
 */
export function ScrollProgress() {
  const [show, setShow] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client media-query read after mount (SSR-safe)
    setShow(!reduced);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="fixed right-5 top-1/2 z-40 hidden h-40 w-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/8 lg:block"
    >
      <motion.div
        className="h-full w-full origin-top rounded-full"
        style={{
          scaleY,
          background:
            "linear-gradient(to bottom, var(--accent), #5effb0 60%, #a5ffd9)",
          boxShadow: "0 0 12px rgba(0,217,126,0.6)",
        }}
      />
    </div>
  );
}
