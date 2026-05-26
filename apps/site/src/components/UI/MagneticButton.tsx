"use client";

import { ReactNode, useRef, MouseEvent } from "react";

const cx = (...parts: Array<string | undefined | false>) =>
  parts.filter(Boolean).join(" ");

type Props = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

export function MagneticButton({
  children,
  variant = "primary",
  href,
  onClick,
  className,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const base =
    "focus-ring inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-semibold transition-[transform,background,opacity,color] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]";
  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-[var(--canvas)] hover:opacity-90"
      : "border border-white/15 text-white hover:bg-white/5";

  const common = {
    ref: (el: HTMLElement | null) => (ref.current = el),
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    className: cx(base, styles, className),
    "aria-label": ariaLabel,
    "data-cursor": "magnetic",
  } as const;

  if (href) {
    return (
      <a {...(common as Record<string, unknown>)} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button {...(common as Record<string, unknown>)} onClick={onClick}>
      {children}
    </button>
  );
}
