"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";

export type Mood =
  | "idle"
  | "speaking"
  | "thinking"
  | "listening"
  | "waving"
  | "dissolving"
  | "assembling";

export type MovementMode = "glide" | "teleport" | "hidden" | "idle";

export type ChatMessage = {
  id: string;
  role: "user" | "buddy";
  text: string;
  timestamp: number;
  status: "pending" | "streaming" | "complete" | "error";
  error?: string;
};

export type Anchor = { x: number; y: number };

export type Waypoint = {
  id: string;
  scrollProgress: number;
  sectionId: string;
  anchor: Anchor;
  mobileAnchor?: Anchor;
  scale: number;
  mobileScale?: number;
  message?: string;
  messageDelay?: number;
  messageDuration?: number;
  transitionIn: MovementMode | "assemble";
  mood: Mood;
  voiceText?: string;
};

type Persisted = {
  voiceEnabled: boolean;
  voiceSpeed: 0.75 | 1.0 | 1.25;
  chatHistory: ChatMessage[];
  visitCount: number;
  hasSeenIntro: boolean;
  qualityTier: "ultra" | "high" | "medium" | "low";
};

type CompanionState = Persisted & {
  // Position
  currentWaypointId: string | null;
  targetAnchor: Anchor;
  currentAnchor: Anchor;
  targetScale: number;
  currentScale: number;

  // Behavior
  mood: Mood;
  movementMode: MovementMode;
  visible: boolean;
  isTransitioning: boolean;
  scrollVelocity: number;

  // Speech
  currentMessage: string | null;
  messageId: string | null;
  messageStartedAt: number | null;

  // Audio (placeholder; voice deferred)
  audioLevel: number;
  isSpeaking: boolean;

  // Chat
  chatOpen: boolean;
  chatInputValue: string;
  chatIsStreaming: boolean;
  chatError: string | null;

  // Actions
  goToWaypoint: (id: string, waypoint: Waypoint) => void;
  setMovementMode: (mode: MovementMode) => void;
  setMood: (mood: Mood) => void;
  setAnchor: (anchor: Anchor) => void;
  setScale: (scale: number) => void;
  setTransitioning: (t: boolean) => void;
  say: (text: string, durationMs?: number) => void;
  silence: () => void;

  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setChatInput: (v: string) => void;
  appendBuddyChunk: (id: string, text: string) => void;
  setMessageStatus: (
    id: string,
    status: ChatMessage["status"],
    error?: string,
  ) => void;
  pushMessage: (m: ChatMessage) => void;
  setChatStreaming: (b: boolean) => void;
  setChatError: (e: string | null) => void;
  clearChat: () => void;

  setVoiceEnabled: (b: boolean) => void;
  setAudioLevel: (v: number) => void;
  setIsSpeaking: (b: boolean) => void;
  setScrollVelocity: (v: number) => void;
  setQualityTier: (tier: Persisted["qualityTier"]) => void;
  incrementVisit: () => void;
};

const messageTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useCompanion = create<CompanionState>()(
  persist(
    (set, get) => ({
      // persisted defaults
      voiceEnabled: false,
      voiceSpeed: 1.0,
      chatHistory: [],
      visitCount: 0,
      hasSeenIntro: false,
      qualityTier: "high",

      // session defaults
      currentWaypointId: null,
      targetAnchor: { x: 0.5, y: 0.5 },
      currentAnchor: { x: 0.5, y: 0.5 },
      targetScale: 1.6,
      currentScale: 1.6,
      mood: "idle",
      movementMode: "idle",
      visible: true,
      isTransitioning: false,
      scrollVelocity: 0,
      currentMessage: null,
      messageId: null,
      messageStartedAt: null,
      audioLevel: 0,
      isSpeaking: false,
      chatOpen: false,
      chatInputValue: "",
      chatIsStreaming: false,
      chatError: null,

      goToWaypoint: (id, waypoint) => {
        if (id === get().currentWaypointId) return;
        const mode: MovementMode =
          waypoint.transitionIn === "assemble"
            ? "teleport"
            : (waypoint.transitionIn as MovementMode);
        set({
          currentWaypointId: id,
          targetAnchor: waypoint.anchor,
          targetScale: waypoint.scale,
          movementMode: mode,
          mood: waypoint.mood,
          isTransitioning: true,
        });
        if (waypoint.message) {
          const delay = waypoint.messageDelay ?? 1200;
          const dur = waypoint.messageDuration;
          window.setTimeout(() => {
            // skip bubble on fast scroll
            if (Math.abs(get().scrollVelocity) > 3000) return;
            get().say(waypoint.message!, dur);
          }, delay);
        }
      },

      setMovementMode: (mode) => set({ movementMode: mode }),
      setMood: (mood) => set({ mood }),
      setAnchor: (anchor) => set({ currentAnchor: anchor }),
      setScale: (scale) => set({ currentScale: scale }),
      setTransitioning: (t) => set({ isTransitioning: t }),

      say: (text, durationMs) => {
        const id = nanoid();
        // clear previous
        const prevId = get().messageId;
        if (prevId && messageTimers.has(prevId)) {
          clearTimeout(messageTimers.get(prevId)!);
          messageTimers.delete(prevId);
        }
        set({
          currentMessage: text,
          messageId: id,
          messageStartedAt: Date.now(),
        });
        const duration = durationMs ?? Math.max(3000, text.length * 70);
        const t = setTimeout(() => {
          if (get().messageId === id) get().silence();
        }, duration);
        messageTimers.set(id, t);
      },

      silence: () => {
        const id = get().messageId;
        if (id && messageTimers.has(id)) {
          clearTimeout(messageTimers.get(id)!);
          messageTimers.delete(id);
        }
        set({ currentMessage: null, messageId: null, messageStartedAt: null });
      },

      openChat: () => set({ chatOpen: true }),
      closeChat: () => set({ chatOpen: false }),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
      setChatInput: (v) => set({ chatInputValue: v }),
      pushMessage: (m) =>
        set((s) => ({ chatHistory: [...s.chatHistory, m].slice(-50) })),
      appendBuddyChunk: (id, text) =>
        set((s) => ({
          chatHistory: s.chatHistory.map((m) =>
            m.id === id ? { ...m, text: m.text + text } : m,
          ),
        })),
      setMessageStatus: (id, status, error) =>
        set((s) => ({
          chatHistory: s.chatHistory.map((m) =>
            m.id === id ? { ...m, status, error } : m,
          ),
        })),
      setChatStreaming: (b) => set({ chatIsStreaming: b }),
      setChatError: (e) => set({ chatError: e }),
      clearChat: () => set({ chatHistory: [], chatError: null }),

      setVoiceEnabled: (b) => set({ voiceEnabled: b }),
      setAudioLevel: (v) => set({ audioLevel: v }),
      setIsSpeaking: (b) => set({ isSpeaking: b }),
      setScrollVelocity: (v) => set({ scrollVelocity: v }),
      setQualityTier: (tier) => set({ qualityTier: tier }),
      incrementVisit: () => set((s) => ({ visitCount: s.visitCount + 1 })),
    }),
    {
      name: "buddy-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          voiceEnabled: s.voiceEnabled,
          voiceSpeed: s.voiceSpeed,
          chatHistory: s.chatHistory.slice(-20),
          visitCount: s.visitCount,
          hasSeenIntro: s.hasSeenIntro,
          qualityTier: s.qualityTier,
        }) satisfies Persisted,
      skipHydration: true,
    },
  ),
);

// Selector hooks
export const useMood = () => useCompanion((s) => s.mood);
export const useCurrentMessage = () => useCompanion((s) => s.currentMessage);
export const useChatOpen = () => useCompanion((s) => s.chatOpen);
export const useChatHistory = () => useCompanion((s) => s.chatHistory);
export const useIsSpeaking = () => useCompanion((s) => s.isSpeaking);
export const useAudioLevel = () => useCompanion((s) => s.audioLevel);
export const useQualityTier = () => useCompanion((s) => s.qualityTier);
