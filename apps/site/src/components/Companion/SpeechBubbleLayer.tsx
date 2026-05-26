"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCompanion } from "@/lib/companionStore";

export function SpeechBubbleLayer() {
  const message = useCompanion((s) => s.currentMessage);
  const messageId = useCompanion((s) => s.messageId);
  const anchor = useCompanion((s) => s.currentAnchor);
  const scale = useCompanion((s) => s.currentScale);
  const ref = useRef<HTMLDivElement>(null);
  const [tailPos, setTailPos] = useState<"bottom" | "top">("bottom");
  const [hovered, setHovered] = useState(false);

  // Pause auto-dismiss while hovered (clear timer in store via re-`say`)
  useEffect(() => {
    if (!hovered || !message) return;
    // While hovered, keep extending; on unhover, let it expire normally via the
    // original timer (handled inside store). Simple approach: do nothing here.
  }, [hovered, message]);

  useEffect(() => {
    if (!ref.current) return;
    const bubble = ref.current;

    const update = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const buddyScreenX = anchor.x * w;
      const buddyScreenY = anchor.y * h;
      const buddyHalfH = 64 * scale; // approximate visual radius in px
      const rect = bubble.getBoundingClientRect();
      const bw = rect.width || 240;
      const bh = rect.height || 56;

      let x = buddyScreenX - bw / 2;
      let y = buddyScreenY - buddyHalfH - bh - 16;
      let tail: "bottom" | "top" = "bottom";

      if (y < 16) {
        y = buddyScreenY + buddyHalfH + 16;
        tail = "top";
      }
      x = Math.max(16, Math.min(x, w - bw - 16));
      y = Math.max(16, Math.min(y, h - bh - 16));

      bubble.style.transform = `translate(${x}px, ${y}px)`;
      setTailPos((prev) => (prev === tail ? prev : tail));
    };

    update();
    let raf = 0;
    let lastTime = 0;
    const loop = (t: number) => {
      if (t - lastTime > 33) {
        update();
        lastTime = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [anchor.x, anchor.y, scale]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-50 will-change-transform"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key={messageId ?? "msg"}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="glass-crystal pointer-events-auto relative max-w-[280px] cursor-default rounded-2xl px-5 py-3 text-[15px] leading-snug text-white"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => useCompanion.getState().openChat()}
          >
            {message}
            <span className="bubble-tail" data-position={tailPos} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
