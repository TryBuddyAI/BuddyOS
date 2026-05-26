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

export type ChatMessage = {
  id: string;
  role: "user" | "buddy";
  text: string;
  timestamp: number;
  status: "pending" | "streaming" | "complete" | "error";
  error?: string;
};

type Persisted = {
  hotkey: string;
  hasOnboarded: boolean;
  demoMode: boolean;
  qualityTier: "ultra" | "high" | "medium" | "low";
  history: ChatMessage[][];
};

type AppState = Persisted & {
  mood: Mood;
  isStreaming: boolean;
  currentMessage: string | null;
  messageId: string | null;
  messages: ChatMessage[];
  input: string;
  error: string | null;
  setMood: (m: Mood) => void;
  setStreaming: (b: boolean) => void;
  say: (text: string, duration?: number) => void;
  silence: () => void;
  pushMessage: (m: ChatMessage) => void;
  appendBuddyChunk: (id: string, chunk: string) => void;
  setMessageStatus: (
    id: string,
    status: ChatMessage["status"],
    error?: string,
  ) => void;
  newSession: () => void;
  setInput: (v: string) => void;
  setError: (e: string | null) => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  setHotkey: (h: string) => void;
  setOnboarded: (b: boolean) => void;
  setDemoMode: (b: boolean) => void;
  setQualityTier: (t: Persisted["qualityTier"]) => void;
};

const messageTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hotkey: "",
      hasOnboarded: false,
      demoMode: false,
      qualityTier: "high",
      history: [],

      mood: "idle",
      isStreaming: false,
      currentMessage: null,
      messageId: null,
      messages: [],
      input: "",
      error: null,
      settingsOpen: false,

      setMood: (mood) => set({ mood }),
      setStreaming: (isStreaming) => set({ isStreaming }),

      say: (text, duration) => {
        const id = nanoid();
        const prev = get().messageId;
        if (prev && messageTimers.has(prev)) {
          clearTimeout(messageTimers.get(prev)!);
          messageTimers.delete(prev);
        }
        set({ currentMessage: text, messageId: id });
        const ms = duration ?? Math.max(3000, text.length * 60);
        const t = setTimeout(() => {
          if (get().messageId === id) get().silence();
        }, ms);
        messageTimers.set(id, t);
      },
      silence: () => {
        const id = get().messageId;
        if (id && messageTimers.has(id)) {
          clearTimeout(messageTimers.get(id)!);
          messageTimers.delete(id);
        }
        set({ currentMessage: null, messageId: null });
      },

      pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      appendBuddyChunk: (id, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, text: m.text + chunk } : m,
          ),
        })),
      setMessageStatus: (id, status, error) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, status, error } : m,
          ),
        })),

      newSession: () =>
        set((s) => ({
          history:
            s.messages.length > 0
              ? [...s.history.slice(-19), s.messages]
              : s.history,
          messages: [],
          input: "",
          error: null,
          isStreaming: false,
          mood: "idle",
          currentMessage: null,
          messageId: null,
        })),

      setInput: (v) => set({ input: v }),
      setError: (error) => set({ error }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setHotkey: (hotkey) => set({ hotkey }),
      setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setQualityTier: (qualityTier) => set({ qualityTier }),
    }),
    {
      name: "buddy-app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          hotkey: s.hotkey,
          hasOnboarded: s.hasOnboarded,
          demoMode: s.demoMode,
          qualityTier: s.qualityTier,
          history: s.history.slice(-20),
        }) satisfies Persisted,
      skipHydration: true,
    },
  ),
);

export const useMood = () => useApp((s) => s.mood);
export const useQualityTier = () => useApp((s) => s.qualityTier);
export const useCurrentMessage = () => useApp((s) => s.currentMessage);
