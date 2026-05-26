"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCompanion } from "@/lib/companionStore";
import { ChatPanel } from "@/components/Chat/ChatPanel";

export function ChatDock() {
  const open = useCompanion((s) => s.chatOpen);
  const isStreaming = useCompanion((s) => s.chatIsStreaming);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="pointer-events-auto"
          >
            <ChatPanel />
          </motion.div>
        ) : (
          <motion.button
            key="dock"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={() => useCompanion.getState().openChat()}
            className="glass-lens focus-ring pointer-events-auto relative grid h-14 w-14 cursor-pointer place-items-center rounded-full"
            aria-label="Open chat with BUDDY"
          >
            <span className="brand-dot" />
            {isStreaming && (
              <span className="absolute inset-0 rounded-full border-2 border-[var(--accent)] opacity-60 animate-ping" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
