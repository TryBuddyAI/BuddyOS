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
    mobileAnchor: { x: 0.85, y: 0.18 },
    scale: 2.0,
    mobileScale: 0.7,
    message: "Hey. I'm BUDDY.",
    messageDelay: 1400,
    messageDuration: 4500,
    transitionIn: "assemble",
    mood: "speaking",
  },
  {
    id: "marquee",
    scrollProgress: 0.12,
    sectionId: "marquee",
    anchor: { x: 0.92, y: 0.85 },
    mobileAnchor: { x: 0.85, y: 0.9 },
    scale: 0.45,
    mobileScale: 0.4,
    transitionIn: "glide",
    mood: "idle",
  },
  {
    id: "how-intro",
    scrollProgress: 0.28,
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
    scrollProgress: 0.52,
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
    scrollProgress: 0.74,
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
    scrollProgress: 0.88,
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
