"use client";

export function Nav() {
  return (
    <nav className="glass-frost fixed inset-x-0 top-0 z-30 h-14 px-6">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 text-[13px] font-bold tracking-[0.05em]"
        >
          <span className="brand-dot" />
          BUDDY
        </a>
        <div className="hidden gap-7 text-[13px] text-[var(--text-dim)] md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#" className="hover:text-white">
            Docs
          </a>
        </div>
        <a
          href="#pricing"
          className="focus-ring rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--canvas)] transition-opacity hover:opacity-90"
        >
          Download
        </a>
      </div>
    </nav>
  );
}
