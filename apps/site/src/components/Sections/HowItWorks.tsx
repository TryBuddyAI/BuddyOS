"use client";

const steps = [
  { n: "01", title: "Install", body: "40MB download" },
  { n: "02", title: "Shows up", body: "in your corner" },
  { n: "03", title: "Click. Ask.", body: "Answer." },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      data-section="how"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        {/* Title block left */}
        <div className="md:col-span-4">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 className="headline mt-3 text-[clamp(28px,3.6vw,44px)]">
            Three simple steps
          </h2>
        </div>

        {/* Connected steps right */}
        <div className="md:col-span-8">
          <div className="relative grid grid-cols-3 gap-4 md:gap-8">
            {/* connecting hairline */}
            <div className="pointer-events-none absolute left-2 right-2 top-3 hidden h-px bg-gradient-to-r from-[rgba(0,217,126,0.0)] via-[rgba(0,217,126,0.5)] to-[rgba(0,217,126,0.0)] md:block" />

            {steps.map(({ n, title, body }) => (
              <div key={n} className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="relative z-10 h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_3px_var(--canvas)]" />
                  <span className="mono text-[11px] tracking-[0.3em] text-[var(--accent)]">
                    {n}
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold leading-tight">
                  {title}
                </h3>
                <p className="mt-1 text-[13px] leading-[1.5] text-[var(--text-dim)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
