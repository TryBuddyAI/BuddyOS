"use client";

/**
 * Page-wide atmospheric aurora. Three large, slowly-drifting radial-gradient
 * blooms in the brand green + a warm accent, sitting behind all content at
 * z-[-1]. Pure transform/opacity animation (GPU-cheap), blurred heavily so it
 * reads as ambient light rather than shapes. Fades out under prefers-reduced-
 * motion via globals.css.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-blob aurora-blob--3" />
      {/* Fine grain to kill gradient banding */}
      <div className="aurora-grain" />
    </div>
  );
}
