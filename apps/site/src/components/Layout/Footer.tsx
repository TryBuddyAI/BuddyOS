"use client";

const cols = [
  {
    title: "PRODUCT",
    links: ["Features", "How it works", "Pricing", "Docs"],
  },
  {
    title: "COMPANY",
    links: ["About", "Careers", "Contact", "Press"],
  },
  {
    title: "CONNECT",
    links: ["X / Twitter", "GitHub", "Discord", "Newsletter"],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 pb-12 pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-12 md:grid-cols-12 md:gap-x-8">
        {/* Brand block */}
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center gap-2 text-[14px] font-bold tracking-[0.05em]">
            <span className="brand-dot" />
            BUDDY
          </div>
          <p className="mt-5 max-w-[24ch] text-[13px] leading-[1.55] text-[var(--text-dim)]">
            Made of light.
            <br />
            Built for thinking.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <div className="mono text-[10px] tracking-[0.3em] text-[var(--text-faint)]">
              {col.title}
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-dim)]">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Copyright tucked to the right */}
        <div className="col-span-2 md:col-span-2">
          <p className="text-right text-[11px] leading-[1.5] text-[var(--text-faint)]">
            © 2026 BUDDY Labs, Inc.
            <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
