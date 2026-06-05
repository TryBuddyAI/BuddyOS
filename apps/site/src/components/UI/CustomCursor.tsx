"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Awwwards-signature custom cursor.
 *
 * Two layers:
 *  - a crisp dot that tracks the pointer near-instantly
 *  - a lagging ring on a spring, which grows and inverts over interactive
 *    elements (anything with [data-cursor], a, button, input, [role=button]).
 *
 * Uses mix-blend-mode: difference so the cursor inverts whatever is beneath
 * it — white over dark, dark over the green accent. Disabled entirely on
 * touch devices and when the user prefers reduced motion (native cursor
 * stays in that case).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hidden, setHidden] = useState(true);

  // Raw pointer position (the dot rides these directly).
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Spring-smoothed position for the lagging ring.
  const ringX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 });

  useEffect(() => {
    // Gate: pointer-fine devices only, and respect reduced-motion.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const INTERACTIVE =
      'a, button, input, textarea, select, [role="button"], [data-cursor], label';

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest(INTERACTIVE)));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setHidden(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ mixBlendMode: "difference" }}
    >
      {/* Lagging ring */}
      <motion.div
        className="absolute left-0 top-0 rounded-full border border-white"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 56 : 34,
          height: hovering ? 56 : 34,
          opacity: hidden ? 0 : hovering ? 1 : 0.6,
          scale: pressed ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      />
      {/* Crisp dot */}
      <motion.div
        className="absolute left-0 top-0 rounded-full bg-white"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 6 : 7,
          height: hovering ? 6 : 7,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
