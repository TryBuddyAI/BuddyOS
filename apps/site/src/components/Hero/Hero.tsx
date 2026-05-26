"use client";

import dynamic from "next/dynamic";
import { MagneticButton } from "@/components/UI/MagneticButton";
import { motion } from "motion/react";
import { Zap, Sparkles, EyeOff, Play } from "lucide-react";

const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  { ssr: false },
);

const inlineFeatures = [
  {
    icon: Zap,
    title: "Always there",
    body: "BUDDY lives in your corner. It's ready when you are.",
  },
  {
    icon: Sparkles,
    title: "Frontier intelligence",
    body: "Powered by Claude. Fast, capable, and reliable.",
  },
  {
    icon: EyeOff,
    title: "Vanishes when needed",
    body: "Focus is yours. BUDDY gets out of the way.",
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative w-full overflow-hidden"
    >
      {/* WebGL hero scene */}
      <div className="pointer-events-none absolute inset-0 h-screen">
        <HeroScene />
      </div>
      {/* Soft floor gradient for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-[55vh] h-[45vh] bg-gradient-to-b from-transparent via-[var(--canvas)]/70 to-[var(--canvas)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pt-28 md:pt-32">
        <div className="grid flex-1 grid-cols-1 items-center gap-12 pb-12 md:grid-cols-12 md:gap-6">
          {/* Left column — copy + CTAs */}
          <div className="md:col-span-6 lg:col-span-5">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="eyebrow inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(0,217,126,0.3)] bg-[rgba(0,217,126,0.06)] px-3 py-1.5"
            >
              <span className="brand-dot !w-1.5 !h-1.5" />
              DESKTOP AI · NOW IN ALPHA
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="headline mt-6 text-[clamp(48px,7vw,84px)]"
            >
              Your AI,
              <br />
              always within reach.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6 max-w-[40ch] text-[17px] leading-[1.55] text-[var(--text-dim)]"
            >
              BUDDY lives at the edge of your screen. One click to summon.
              Focus makes it disappear.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <MagneticButton variant="primary" href="#pricing">
                Download free →
              </MagneticButton>
              <a
                href="#demo"
                data-cursor="magnetic"
                className="focus-ring inline-flex items-center gap-3 rounded-full text-[14px] text-[var(--text-dim)] transition-colors hover:text-white"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15">
                  <Play size={13} className="ml-0.5 fill-current" />
                </span>
                Watch demo
              </a>
            </motion.div>
          </div>

          {/* Right column — reserved space for BUDDY (rendered in CompanionStage). */}
          <div className="hidden md:col-span-6 lg:col-span-7 md:block" />
        </div>

        {/* Inline feature cards along the bottom of the hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="relative z-10 grid grid-cols-1 gap-3 pb-12 md:grid-cols-3 md:gap-4 md:pb-16"
        >
          {inlineFeatures.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="glass-crystal flex items-start gap-3 rounded-2xl p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(0,217,126,0.12)] text-[var(--accent)]">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold leading-tight">
                  {title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-[var(--text-dim)]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
