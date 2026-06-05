"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Infinity as InfinityIcon,
  Server,
  Mic,
  Command,
  Drama,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

type Cell = {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Tailwind grid-span classes for the desktop bento layout. */
  span: string;
  /** Optional accent treatment for the hero cell. */
  feature?: boolean;
};

const CELLS: Cell[] = [
  {
    icon: InfinityIcon,
    title: "Autonomous & self-improving",
    body: "BUDDY audits its own code, opens issues, ships fixes, and merges them — getting measurably better every day with no hands on the keyboard.",
    span: "md:col-span-2 md:row-span-2",
    feature: true,
  },
  {
    icon: Server,
    title: "100% local with Ollama",
    body: "Run a model on your own machine. No key, no network, no bill. Your conversations never leave the device.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Mic,
    title: "Hold to talk",
    body: "Press, speak, release. Whisper transcribes on-device-fast.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Command,
    title: "Hotkey summon",
    body: "One chord brings BUDDY to the front. Esc and he's gone.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Drama,
    title: "Four personalities",
    body: "Default, Brief, Tutor, or Friend — switch how BUDDY thinks and talks in a click.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    icon: EyeOff,
    title: "Vanishes on focus",
    body: "A transparent overlay that gets out of your way the instant you start working.",
    span: "md:col-span-2 md:row-span-1",
  },
];

export function BentoFeatures() {
  return (
    <section
      id="features"
      data-section="features"
      className="relative mx-auto max-w-7xl px-6 py-28 md:py-36"
    >
      {/* Section header */}
      <div className="mb-12 max-w-2xl md:mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="eyebrow"
        >
          WHAT MAKES BUDDY, BUDDY
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="display mt-4 text-[clamp(34px,5vw,60px)]"
        >
          A companion that{" "}
          <span className="text-gradient-accent">builds itself.</span>
        </motion.h2>
      </div>

      {/* Bento grid */}
      <div className="grid auto-rows-[minmax(180px,1fr)] grid-cols-1 gap-4 md:grid-cols-4">
        {CELLS.map((cell, i) => (
          <BentoCard key={cell.title} cell={cell} index={i} />
        ))}
      </div>
    </section>
  );
}

function BentoCard({ cell, index }: { cell: Cell; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Spotlight position (CSS vars) + 3D tilt (motion values).
  const rx = useMotionValue(0.5);
  const ry = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(ry, [0, 1], [6, -6]), {
    stiffness: 250,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(rx, [0, 1], [-6, 6]), {
    stiffness: 250,
    damping: 22,
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rx.set(px);
    ry.set(py);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const handleLeave = () => {
    rx.set(0.5);
    ry.set(0.5);
  };

  const Icon = cell.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-cursor="magnetic"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={
        "bento-card group relative overflow-hidden rounded-3xl p-6 md:p-7 " +
        cell.span
      }
    >
      {/* Cursor-follow spotlight */}
      <div className="bento-spotlight" />

      <div className="relative z-10 flex h-full flex-col">
        <span
          className={
            "grid place-items-center rounded-xl text-[var(--accent)] transition-colors " +
            (cell.feature ? "h-14 w-14" : "h-11 w-11") +
            " bg-[rgba(0,217,126,0.12)]"
          }
        >
          <Icon size={cell.feature ? 26 : 20} strokeWidth={1.75} />
        </span>

        <div className="mt-auto pt-8">
          <h3
            className={
              "font-semibold leading-tight " +
              (cell.feature
                ? "display text-[clamp(24px,2.4vw,32px)]"
                : "text-[17px]")
            }
          >
            {cell.title}
          </h3>
          <p
            className={
              "mt-2 leading-[1.55] text-[var(--text-dim)] " +
              (cell.feature ? "max-w-[42ch] text-[15px]" : "text-[13px]")
            }
          >
            {cell.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
