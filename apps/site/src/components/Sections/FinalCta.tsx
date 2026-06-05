"use client";

import { Apple, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type OS = "Mac" | "Windows" | "Linux";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "Mac";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "Mac";
  if (ua.includes("win")) return "Windows";
  return "Linux";
}

export function FinalCta() {
  const [os, setOs] = useState<OS>("Mac");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time OS detection after mount (SSR-safe)
    setOs(detectOS());
  }, []);

  return (
    <section
      id="final"
      data-section="final"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <p className="eyebrow">READY WHEN YOU ARE</p>
          <h2 className="headline mt-3 text-[clamp(32px,4.4vw,52px)]">
            Try BUDDY today.
          </h2>
        </div>

        <div className="md:col-span-7">
          <div className="flex flex-wrap items-center gap-4">
            <button
              data-cursor="magnetic"
              className="focus-ring inline-flex h-12 items-center gap-3 rounded-full bg-[var(--accent)] pl-3 pr-4 text-[14px] font-semibold text-[var(--canvas)] transition-opacity hover:opacity-90"
            >
              <Apple size={16} />
              Download for {os}
              <span className="grid h-6 w-6 place-items-center rounded-full bg-black/15">
                <ChevronDown size={14} />
              </span>
            </button>
            <span className="text-[13px] text-[var(--text-dim)]">
              Auto-detects your OS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
