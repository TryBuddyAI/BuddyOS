"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { useCompanion } from "@/lib/companionStore";

const codeSnippet = `function formatDate(date) {
  return new Intl.DateTimeFormat(
    'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
}`;

// Pre-tokenised version for static syntax coloring (avoids shipping a full
// highlighter here since this is a marketing visual, not the real chat panel).
const tokens: { t: string; c?: string }[] = [
  { t: "function", c: "fn" },
  { t: " " },
  { t: "formatDate", c: "fn-name" },
  { t: "(" },
  { t: "date", c: "var" },
  { t: ") {\n  " },
  { t: "return", c: "kw" },
  { t: " " },
  { t: "new", c: "kw" },
  { t: " " },
  { t: "Intl", c: "type" },
  { t: "." },
  { t: "DateTimeFormat", c: "type" },
  { t: "(\n    " },
  { t: "'en-US'", c: "str" },
  { t: ", {\n      " },
  { t: "dateStyle", c: "key" },
  { t: ": " },
  { t: "'medium'", c: "str" },
  { t: ",\n      " },
  { t: "timeStyle", c: "key" },
  { t: ": " },
  { t: "'short'", c: "str" },
  { t: "\n    }).format(" },
  { t: "date", c: "var" },
  { t: ");\n}" },
];

const tokenClass: Record<string, string> = {
  fn: "text-[#FF7B72]",
  "fn-name": "text-[#D2A8FF]",
  kw: "text-[#FF7B72]",
  type: "text-[#79C0FF]",
  str: "text-[#A5D6A7]",
  key: "text-[#79C0FF]",
  var: "text-[#E6EDF3]",
};

export function ChatDemo() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section
      id="demo"
      data-section="demo"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:gap-10">
        {/* Title block left */}
        <div className="md:col-span-4">
          <p className="eyebrow">LIVE DEMO</p>
          <h2 className="headline mt-3 text-[clamp(28px,3.6vw,44px)]">
            See BUDDY in action
          </h2>
          <p className="mt-5 max-w-[34ch] text-[14.5px] leading-[1.6] text-[var(--text-dim)]">
            Streaming with Anthropic&apos;s Claude.
            <br />
            Thoughtful responses, in real time.
          </p>
          <button
            onClick={() => useCompanion.getState().openChat()}
            className="focus-ring mt-6 inline-flex h-10 items-center rounded-full bg-[var(--accent)] px-4 text-[13px] font-semibold text-[var(--canvas)] transition-opacity hover:opacity-90"
          >
            Try it →
          </button>
        </div>

        {/* Chat panel right */}
        <div className="md:col-span-8">
          <div className="glass-crystal grid grid-cols-1 gap-4 rounded-2xl p-5 md:grid-cols-12 md:gap-5">
            {/* Mini-BUDDY + typing bubble */}
            <div className="flex items-center gap-3 md:col-span-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,rgba(0,217,126,0.35),rgba(0,217,126,0.05))] ring-1 ring-[rgba(0,217,126,0.35)]">
                <div className="relative h-8 w-8 rounded-full bg-[radial-gradient(circle,rgba(165,255,217,0.9),rgba(0,217,126,0.6))] shadow-[0_0_18px_rgba(0,217,126,0.7)]">
                  <span className="absolute left-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#0F1419]" />
                  <span className="absolute right-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#0F1419]" />
                </div>
              </div>
              <div className="glass-frost flex h-9 items-center gap-1 rounded-full px-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-dim)] [animation-delay:-0.32s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-dim)] [animation-delay:-0.16s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-dim)]" />
              </div>
            </div>

            {/* Code block */}
            <div className="md:col-span-5">
              <div className="rounded-xl border border-white/[0.08] bg-[#0B0F18]/80 px-3 py-3 font-mono text-[12px] leading-[1.55]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] text-[var(--text-faint)]">
                    JS
                  </span>
                  <button
                    onClick={copy}
                    className="focus-ring rounded p-1 text-[var(--text-dim)] transition-colors hover:text-white"
                    aria-label="Copy code"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words text-[#E6EDF3]">
                  {tokens.map((tok, i) => (
                    <span
                      key={i}
                      className={tok.c ? tokenClass[tok.c] : undefined}
                    >
                      {tok.t}
                    </span>
                  ))}
                </pre>
                {copied && (
                  <p className="mt-1 text-[10px] text-[var(--accent)]">
                    Copied
                  </p>
                )}
              </div>
            </div>

            {/* Mock chat bubbles */}
            <div className="space-y-3 md:col-span-3">
              <div className="glass-frost ml-auto max-w-full rounded-2xl rounded-tr-md px-3 py-2 text-[12.5px] text-white">
                Can you format this for me?
              </div>
              <div className="glass-frost mr-auto max-w-full rounded-2xl rounded-tl-md px-3 py-2 text-[12.5px] text-white">
                Of course. Here you go.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
