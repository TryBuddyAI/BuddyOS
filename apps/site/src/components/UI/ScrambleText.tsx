"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&/<>*";

/**
 * Decode/scramble text effect. On mount, each character cycles through random
 * glyphs before locking into its final letter, left-to-right. Used for the
 * hero eyebrow / a key phrase to give that "terminal booting up" flourish.
 *
 * Respects prefers-reduced-motion (renders final text immediately).
 */
export function ScrambleText({
  text,
  className,
  speed = 28,
  revealPerTick = 1,
  startDelay = 0,
}: {
  text: string;
  className?: string;
  /** ms between ticks */
  speed?: number;
  /** how many characters lock in per tick */
  revealPerTick?: number;
  /** ms before the scramble begins */
  startDelay?: number;
}) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setDisplay(text);
      return;
    }

    let revealed = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        frame.current += 1;
        const out = text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealed) return text[i];
            return GLYPHS[Math.floor((frame.current * (i + 7)) % GLYPHS.length)];
          })
          .join("");
        setDisplay(out);
        revealed += revealPerTick;
        if (revealed >= text.length) {
          setDisplay(text);
          if (interval) clearInterval(interval);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, revealPerTick, startDelay]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
