import type { Waypoint } from "./companionStore";

/**
 * Waypoint scales: BUDDY is the visual anchor in the hero and then quickly
 * shrinks to a "side character" across the rest of the page so the chat
 * dock can carry the brand presence. This matches the mockup, where BUDDY
 * is huge in the hero and then small/peripheral everywhere else.
 */
export const waypoints: Waypoint[] = [
  {
    id: "hero",
    scrollProgress: 0.0,
    sectionId: "hero",
    anchor: { x: 0.72, y: 0.42 },
    // Mobile: small + high so BUDDY floats above the stacked copy, not over it.
    mobileAnchor: { x: 0.5, y: 0.16 },
    scale: 2.0,
    mobileScale: 0.52,
    message: "Hey. I'm BUDDY.",
    messageDelay: 1400,
    messageDuration: 4500,
    transitionIn: "assemble",
    mood: "speaking",
  },
  {
    id: "marquee",
    scrollProgress: 0.18,
    sectionId: "marquee",
    anchor: { x: 0.92, y: 0.85 },
    mobileAnchor: { x: 0.85, y: 0.9 },
    scale: 0.45,
    mobileScale: 0.4,
    transitionIn: "glide",
    mood: "idle",
  },
  {
    // Bento features grid is full-width, so BUDDY tucks small into the
    // top-right corner above the grid (near the section header whitespace)
    // rather than parking over the cells.
    id: "features",
    scrollProgress: 0.42,
    sectionId: "features",
    anchor: { x: 0.9, y: 0.16 },
    mobileAnchor: { x: 0.84, y: 0.1 },
    scale: 0.34,
    mobileScale: 0.3,
    message: "This part? I built it myself.",
    messageDelay: 700,
    messageDuration: 3800,
    transitionIn: "glide",
    mood: "speaking",
  },
  {
    id: "how-intro",
    scrollProgress: 0.72,
    sectionId: "how",
    anchor: { x: 0.92, y: 0.5 },
    mobileAnchor: { x: 0.85, y: 0.85 },
    scale: 0.4,
    mobileScale: 0.35,
    message: "Three simple steps.",
    messageDelay: 600,
    messageDuration: 3000,
    transitionIn: "glide",
    mood: "speaking",
  },
  {
    id: "demo",
    scrollProgress: 0.87,
    sectionId: "demo",
    anchor: { x: 0.92, y: 0.5 },
    mobileAnchor: { x: 0.85, y: 0.85 },
    scale: 0.4,
    mobileScale: 0.35,
    message: "Try me. Ask anything.",
    messageDelay: 700,
    messageDuration: 3500,
    transitionIn: "glide",
    mood: "speaking",
  },
  {
    id: "pricing",
    scrollProgress: 0.94,
    sectionId: "pricing",
    anchor: { x: 0.92, y: 0.5 },
    mobileAnchor: { x: 0.85, y: 0.85 },
    scale: 0.4,
    mobileScale: 0.35,
    message: "Free during alpha.",
    messageDelay: 600,
    messageDuration: 3000,
    transitionIn: "glide",
    mood: "speaking",
  },
  {
    id: "final",
    scrollProgress: 0.99,
    sectionId: "final",
    anchor: { x: 0.92, y: 0.85 },
    mobileAnchor: { x: 0.85, y: 0.9 },
    scale: 0.35,
    mobileScale: 0.3,
    message: "Ready when you are.",
    messageDelay: 600,
    messageDuration: 3500,
    transitionIn: "glide",
    mood: "speaking",
  },
];

export const waypointById = (id: string) =>
  waypoints.find((w) => w.id === id) ?? null;
