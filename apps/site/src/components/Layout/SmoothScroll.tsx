"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

type Listener = (e: { progress: number; velocity: number }) => void;
const listeners = new Set<Listener>();

export function subscribeLenis(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      // Skip Lenis, fall back to native scroll. Still emit progress events.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, window.scrollY / max));
        listeners.forEach((fn) => fn({ progress, velocity: 0 }));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      lerp: 0.1,
    });
    lenisInstance = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on("scroll", (l: Lenis) => {
      listeners.forEach((fn) => fn({ progress: l.progress, velocity: l.velocity }));
    });

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <div ref={wrapper}>{children}</div>;
}
