"use client";

import { Apple } from "lucide-react";

// SVGs for Windows and Linux (lucide doesn't ship a Windows or Linux logo).
function WindowsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 5.4 11 4.3v7.4H3V5.4Zm0 13.2V12h8v7.7L3 18.6Zm9-13.4L21 4v8.4h-9V5.2Zm0 14.6V12h9v8l-9-.2Z" />
    </svg>
  );
}

function LinuxIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3c-2.5 0-4 2.5-4 5 0 1.7.6 3 1 4-1.5 1-3 3-3 5.5 0 2 1 3.5 3 3.5h6c2 0 3-1.5 3-3.5 0-2.5-1.5-4.5-3-5.5.4-1 1-2.3 1-4 0-2.5-1.5-5-4-5Z" />
      <circle cx="10.5" cy="8.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="8.5" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      data-section="pricing"
      className="relative mx-auto max-w-7xl px-6 py-20"
    >
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-6">
        {/* Eyebrow */}
        <div className="md:col-span-2">
          <p className="eyebrow">PRICING</p>
        </div>

        {/* Two compact cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-7 md:gap-4">
          <div className="glass-crystal rounded-2xl border-[rgba(0,217,126,0.4)] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-semibold">Alpha</h3>
              <span className="text-[11px] text-[var(--text-dim)]">
                Free during alpha.
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-[34px] font-bold leading-none tracking-tight">
                Free
              </div>
              <span className="text-[11px] text-[var(--text-dim)]">
                No credit card.
              </span>
            </div>
          </div>

          <div className="glass-crystal rounded-2xl p-4 opacity-70">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-semibold">Pro</h3>
              <span className="mono text-[10px] tracking-[0.2em] text-[var(--text-faint)]">
                COMING SOON
              </span>
            </div>
            <div className="mt-2 flex items-end gap-1">
              <div className="text-[34px] font-bold leading-none tracking-tight">
                $9
              </div>
              <span className="pb-1 text-[13px] text-[var(--text-dim)]">
                /mo
              </span>
            </div>
          </div>
        </div>

        {/* Platform icons */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-start gap-6 text-[var(--text-dim)] md:justify-end">
            <Apple size={22} />
            <WindowsIcon size={20} />
            <LinuxIcon size={20} />
          </div>
          <p className="mono mt-2 text-right text-[10px] tracking-[0.25em] text-[var(--text-faint)]">
            MAC · WINDOWS · LINUX
          </p>
        </div>
      </div>
    </section>
  );
}
