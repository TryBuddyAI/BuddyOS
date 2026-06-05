"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Epic, on-brand entry loader — "BUDDY assembles from light."
 *
 * A charging core orb (the pilot light), expanding sonar rings, orbiting
 * light motes, the wordmark, a progress bar, and a cycling status readout.
 * On completion the core blooms and the whole overlay flashes + scales away
 * to reveal the hero.
 *
 * Dismissal waits for BOTH:
 *   1. a minimum visible window (so it always reads as intentional and the
 *      page has time to preload), and
 *   2. the WebGL canvas signalling ready (`buddy-canvas-ready`) OR a hard
 *      fallback timeout (so we never trap the user).
 *
 * Respects prefers-reduced-motion with a calm, near-static variant.
 */

const MIN_VISIBLE_MS = 2000;
const HARD_TIMEOUT_MS = 4200;

const STATUS = [
  { until: 28, label: "WAKING BUDDY" },
  { until: 55, label: "GATHERING LIGHT" },
  { until: 82, label: "ASSEMBLING FORM" },
  { until: 100, label: "ALMOST THERE" },
];

function statusFor(p: number) {
  return (STATUS.find((s) => p < s.until) ?? STATUS[STATUS.length - 1]).label;
}

export function LoadingGate() {
  const [progress, setProgress] = useState(6);
  const [finishing, setFinishing] = useState(false);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    mountedAt.current = performance.now();
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client media-query read after mount (SSR-safe)
    setReduced(prefersReduced);

    let rafId = 0;
    let start: number | null = null;
    let finished = false;

    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      // Ease toward 92% over ~2.4s, then linger until the real finish.
      const target = Math.min(92, 6 + Math.pow(elapsed / 2.4, 0.82) * 86);
      setProgress((p) => (p < target ? target : p));
      if (!finished) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const finish = () => {
      if (finished) return;
      finished = true;
      const elapsed = performance.now() - mountedAt.current;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => {
        setProgress(100);
        setFinishing(true);
        // Hold on the bloom flash, then reveal.
        window.setTimeout(() => setDone(true), prefersReduced ? 240 : 620);
      }, wait);
    };

    const onReady = () => finish();
    window.addEventListener("buddy-canvas-ready", onReady);
    const timeout = window.setTimeout(finish, HARD_TIMEOUT_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
      window.removeEventListener("buddy-canvas-ready", onReady);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: reduced ? 1 : 1.06,
            filter: reduced ? "none" : "blur(6px)",
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
          className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#0B0F14]"
        >
          {/* Atmospheric aurora wash */}
          {!reduced && (
            <>
              <motion.div
                aria-hidden
                className="absolute h-[60vmin] w-[60vmin] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,217,126,0.22), transparent 65%)",
                  filter: "blur(60px)",
                }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="absolute right-[18%] top-[22%] h-[34vmin] w-[34vmin] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(94,255,176,0.18), transparent 65%)",
                  filter: "blur(70px)",
                }}
                animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          <div className="relative flex flex-col items-center gap-9">
            {/* Core stage */}
            <div className="relative grid h-44 w-44 place-items-center">
              {/* Expanding sonar rings */}
              {!reduced &&
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute rounded-full border border-[var(--accent)]/40"
                    style={{ width: 64, height: 64 }}
                    initial={{ scale: 0.4, opacity: 0.55 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut",
                    }}
                  />
                ))}

              {/* Orbiting light motes */}
              {!reduced && (
                <motion.div
                  aria-hidden
                  className="absolute h-36 w-36"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                >
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <span
                      key={deg}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#A5FFD9]"
                      style={{
                        transform: `rotate(${deg}deg) translateY(-72px)`,
                        opacity: 0.4 + (i % 3) * 0.2,
                        boxShadow: "0 0 8px rgba(165,255,217,0.8)",
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Charging core orb */}
              <motion.div
                aria-hidden
                className="relative h-16 w-16 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 38% 34%, #CFFFE9, #00D97E 55%, #007A47 100%)",
                  boxShadow:
                    "0 0 36px 6px rgba(0,217,126,0.55), inset 0 0 12px rgba(255,255,255,0.4)",
                }}
                animate={
                  finishing
                    ? { scale: 1.5, boxShadow: "0 0 90px 30px rgba(0,217,126,0.9)" }
                    : reduced
                      ? { scale: 1 }
                      : { scale: [1, 1.12, 1] }
                }
                transition={
                  finishing
                    ? { duration: 0.5, ease: "easeOut" }
                    : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                }
              />
            </div>

            {/* Wordmark */}
            <motion.div
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <span className="brand-dot" />
              <span className="display text-[20px] tracking-[0.08em]">
                BUDDY
              </span>
            </motion.div>

            {/* Progress bar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-[3px] w-[240px] overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, var(--accent), #5EFFB0 60%, #A5FFD9)",
                    boxShadow: "0 0 12px rgba(0,217,126,0.7)",
                    width: `${progress}%`,
                  }}
                  transition={{ type: "tween", duration: 0.2 }}
                />
              </div>
              <p className="mono text-[10px] tracking-[0.34em] text-[var(--text-faint)]">
                {finishing ? "READY" : statusFor(progress)} ·{" "}
                {Math.round(progress)}%
              </p>
            </div>
          </div>

          {/* Bloom flash on reveal */}
          <AnimatePresence>
            {finishing && !reduced && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(165,255,217,0.85), rgba(0,217,126,0.3) 40%, transparent 70%)",
                }}
                initial={{ scale: 0.1, opacity: 0.9 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
