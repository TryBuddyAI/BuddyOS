"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Full-viewport loading overlay shown until the WebGL hero canvas has had a
 * chance to mount. Two trigger points dismiss it:
 *   1. The `buddy-canvas-ready` window event (fired by HeroScene's onCreated).
 *   2. A hard 3.5s timeout — guarantees we never trap the user behind it.
 *
 * The progress bar is a smooth simulated curve that eases up to 90% over ~2s
 * and snaps to 100% when the canvas signals ready.
 */
export function LoadingGate() {
  const [progress, setProgress] = useState(8);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      // Ease toward 90% over ~2.2s, then linger.
      const target = Math.min(90, 8 + Math.pow(elapsed / 2.2, 0.85) * 82);
      setProgress((p) => (p < target ? target : p));
      if (!done) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const finish = () => {
      setProgress(100);
      // Let the user see the snap, then fade away.
      setTimeout(() => setDone(true), 320);
    };
    const onReady = () => finish();
    window.addEventListener("buddy-canvas-ready", onReady);
    const timeout = setTimeout(finish, 3500);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
      window.removeEventListener("buddy-canvas-ready", onReady);
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeOut" } }}
          className="pointer-events-auto fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--canvas)]"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Pulsing brand dot */}
            <div className="flex items-center gap-3">
              <span className="brand-dot" />
              <span className="text-[14px] font-bold tracking-[0.05em]">
                BUDDY
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-[3px] w-[220px] overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#A5FFD9]"
                style={{ width: `${progress}%` }}
                transition={{ type: "tween", duration: 0.2 }}
              />
            </div>

            <p className="mono text-[10px] tracking-[0.3em] text-[var(--text-faint)]">
              ASSEMBLING · {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
