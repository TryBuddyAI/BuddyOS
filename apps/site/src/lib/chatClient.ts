"use client";

import { nanoid } from "nanoid";
import { useCompanion, type ChatMessage } from "@/lib/companionStore";

export async function sendChatMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const userMsg: ChatMessage = {
    id: nanoid(),
    role: "user",
    text: trimmed,
    timestamp: Date.now(),
    status: "complete",
  };
  const buddyId = nanoid();
  const buddyMsg: ChatMessage = {
    id: buddyId,
    role: "buddy",
    text: "",
    timestamp: Date.now(),
    status: "streaming",
  };

  const store = useCompanion.getState();
  store.pushMessage(userMsg);
  store.pushMessage(buddyMsg);
  store.setChatStreaming(true);
  store.setChatError(null);
  store.setMood("thinking");

  // Build history payload from already-complete prior messages (excluding this turn)
  const history = useCompanion
    .getState()
    .chatHistory.filter(
      (m) => m.status === "complete" && m.id !== userMsg.id && m.id !== buddyId,
    )
    .map((m) => ({
      role: m.role === "buddy" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    }));

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed, history }),
    });

    if (!res.ok) {
      let errMsg = "Couldn't reach the network. Try again?";
      try {
        const j = await res.json();
        if (j?.error === "rate_limit") {
          errMsg = `You've sent a lot of messages. Try again in ${Math.max(1, Math.round((j.retryAfterSec ?? 60) / 60))} minutes.`;
        } else if (j?.error === "missing_api_key") {
          errMsg =
            "Server isn't configured yet — add ANTHROPIC_API_KEY to .env.local.";
        }
      } catch {
        // ignore parse failure
      }
      useCompanion.getState().setMessageStatus(buddyId, "error", errMsg);
      useCompanion.getState().setChatError(errMsg);
      return;
    }

    useCompanion.getState().setMood("speaking");

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("No response stream available.");
    }
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        useCompanion.getState().appendBuddyChunk(buddyId, chunk);
      }
    }

    useCompanion.getState().setMessageStatus(buddyId, "complete");
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Couldn't reach the network.";
    useCompanion.getState().setMessageStatus(buddyId, "error", msg);
    useCompanion.getState().setChatError(msg);
  } finally {
    useCompanion.getState().setChatStreaming(false);
    useCompanion.getState().setMood("idle");
  }
}
