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
export async function completeOnboarding() {
  await invoke("complete_onboarding");
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
export async function defaultHotkeyLabel(): Promise<string> {
  return invoke("default_hotkey_label");
}
export async function registerHotkey(combo: string): Promise<void> {
  await invoke("register_hotkey", { combo });
}

/**
 * Stream a chat completion. The Rust side proxies Anthropic streaming and
 * emits `chat-chunk:<id>` events with `ChatChunk` payloads. Returns an
 * abort function that unlistens and (best-effort) requests cancellation.
 */
export async function streamChat(
  messages: ChatTurn[],
  onChunk: (chunk: ChatChunk) => void,
): Promise<{ abort: () => Promise<void> }> {
  const requestId = nanoid();
  const event = `chat-chunk:${requestId}`;
  const unlisten: UnlistenFn = await listen<ChatChunk>(event, (e) =>
    onChunk(e.payload),
  );

  // Fire and forget — the command completes when the stream is done.
  invoke("stream_chat", { requestId, messages }).catch((err) => {
    onChunk({ type: "error", message: String(err) });
  });

  return {
    abort: async () => {
      unlisten();
    },
  };
}
