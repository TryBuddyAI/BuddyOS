"use client";

const items = [
  "ALWAYS WITHIN REACH",
  "FRONTIER INTELLIGENCE",
  "MADE OF LIGHT",
  "ON YOUR DESKTOP",
];

export function Marquee() {
  // Repeat the items enough times that the looping translation stays seamless.
  const row = Array.from({ length: 4 }).flatMap(() => items);

  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-4">
      <div className="marquee-track flex w-max gap-12">
        {row.map((label, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap">
            <span className="mono text-[11px] tracking-[0.35em] text-[var(--accent)]">
              {label}
            </span>
            <span className="text-[var(--accent)]/60">✦</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
