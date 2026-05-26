"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCurrentMessage, useApp } from "../../lib/store";

export function SpeechBubble() {
  const message = useCurrentMessage();
  const id = useApp((s) => s.messageId);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            key={id ?? "msg"}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="glass-crystal max-w-[260px] rounded-2xl px-4 py-2.5 text-center text-[13.5px] leading-snug text-white"
          >
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
