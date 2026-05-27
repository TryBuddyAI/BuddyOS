import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { nanoid } from "nanoid";

export type ChatRole = "user" | "assistant";
export type ChatTurn = { role: ChatRole; content: string };

export type ChatChunk =
  | { type: "start"; id: string }
  | { type: "text_delta"; text: string }
  | { type: "tool_use"; name: string }
  | { type: "citation"; url: string; title: string }
  | { type: "done" }
  | { type: "error"; message: string };

export async function showSummon() {
  await invoke("show_summon");
}
export async function hideSummon() {
  await invoke("hide_summon");
}
export async function completeOnboarding(firstTime: boolean = false) {
  await invoke("complete_onboarding", { firstTime });
}
/** Open settings inline (in the same window). The Rust core just shows the
 * window and emits `open-settings`; the React layer renders the panel. */
export async function openSettings() {
  await invoke("show_summon");
}
export async function quitApp() {
  await invoke("quit_app");
}
export async function setApiKey(provider: string, key: string) {
  await invoke("set_api_key", { provider, key });
}
export async function hasApiKey(provider: string): Promise<boolean> {
  return invoke("has_api_key", { provider });
}
export async function clearApiKey(provider: string): Promise<void> {
  await invoke("clear_api_key", { provider });
}

// Voice
export async function hasWhisperModel(): Promise<boolean> {
  return invoke("has_whisper_model");
}
export async function downloadWhisperModel(): Promise<void> {
  await invoke("download_whisper_model");
}
export async function transcribe(audio: Uint8Array): Promise<string> {
  return invoke("transcribe", { audio: Array.from(audio) });
}
export function isVoiceModelMissing(err: unknown): boolean {
  return typeof err === "string" && err.includes("VOICE_MODEL_MISSING");
}
export function isOpenAIKeyMissing(err: unknown): boolean {
  return typeof err === "string" && err.includes("OPENAI_KEY_MISSING");
}
export async function defaultHotkeyLabel(): Promise<string> {
  return invoke("default_hotkey_label");
}
export async function registerHotkey(combo: string): Promise<void> {
  await invoke("register_hotkey", { combo });
}
export async function openAccessibilitySettings(): Promise<void> {
  await invoke("open_accessibility_settings");
}

/** True when a register_hotkey rejection looks like missing macOS Accessibility. */
export function isAccessibilityError(err: unknown): boolean {
  return typeof err === "string" && err.includes("ACCESSIBILITY_DENIED");
}

/**
 * Stream a chat completion. The Rust side proxies Anthropic streaming and
 * emits `chat-chunk:<id>` events with `ChatChunk` payloads. Returns an
 * abort function that unlistens and (best-effort) requests cancellation.
 */
export async function streamChat(
  messages: ChatTurn[],
  onChunk: (chunk: ChatChunk) => void,
  personality?: string,
): Promise<{ requestId: string; abort: () => Promise<void> }> {
  const requestId = nanoid();
  const event = `chat-chunk:${requestId}`;
  const unlisten: UnlistenFn = await listen<ChatChunk>(event, (e) =>
    onChunk(e.payload),
  );

  invoke("stream_chat", { requestId, messages, personality }).catch((err) => {
    onChunk({ type: "error", message: String(err) });
  });

  return {
    requestId,
    abort: async () => {
      // Flip the server-side abort flag so the SSE loop breaks and stops
      // billing. The unlisten happens after, since aborts are infrequent
      // and we'd rather block briefly than leak a listener.
      try {
        await invoke("abort_chat", { requestId });
      } catch {
        // best-effort
      }
      unlisten();
    },
  };
}
