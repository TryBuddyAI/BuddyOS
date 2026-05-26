"use client";

import { Sparkles, Cpu, EyeOff } from "lucide-react";

const cards = [
  {
    icon: Sparkles,
    title: "Always there",
    body: "Lives at the edge of your screen. One click to summon. Zero windows to manage.",
  },
  {
    icon: Cpu,
    title: "Frontier intelligence",
    body: "Powered by the latest Claude. Real answers, real code, in under a second.",
  },
  {
    icon: EyeOff,
    title: "Vanishes when needed",
    body: "Reads your focus state. Goes silent when you do. Reappears when you're back.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      data-section="features"
      className="relative mx-auto max-w-6xl px-6 py-32"
    >
      <div className="max-w-2xl">
        <p className="eyebrow">§ BUILT TO STAY OUT OF YOUR WAY</p>
        <h2 className="headline mt-3 text-[clamp(32px,4vw,52px)]">
          Three principles. No exceptions.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group rounded-2xl border border-white/[0.06] bg-[var(--surface)] p-6 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[rgba(0,217,126,0.3)]"
          >
            <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(0,217,126,0.12)] text-[var(--accent)]">
              <Icon size={18} />
            </span>
            <h3 className="text-[15px] font-semibold">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-[var(--text-dim)]">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
