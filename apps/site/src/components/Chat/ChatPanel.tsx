"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCompanion } from "@/lib/companionStore";
import { sendChatMessage } from "@/lib/chatClient";

const QUICK_PROMPTS = [
  "What can you do?",
  "How do you work?",
  "Show me code",
  "Draft a tweet",
];

export function ChatPanel() {
  const history = useCompanion((s) => s.chatHistory);
  const streaming = useCompanion((s) => s.chatIsStreaming);
  const close = useCompanion((s) => s.closeChat);
  const inputValue = useCompanion((s) => s.chatInputValue);
  const setInput = useCompanion((s) => s.setChatInput);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  const isEmpty = history.length === 0;

  const submit = (text?: string) => {
    const v = (text ?? inputValue).trim();
    if (!v || streaming) return;
    setTouched(true);
    setInput("");
    sendChatMessage(v);
  };

  return (
    <div
      role="dialog"
      aria-label="Chat with BUDDY"
      className="glass-crystal flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="brand-dot" />
          <span className="text-sm font-semibold tracking-wide">BUDDY</span>
        </div>
        <button
          onClick={close}
          aria-label="Close chat"
          className="focus-ring rounded-full p-1.5 text-[var(--text-dim)] hover:bg-white/5 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {isEmpty && !touched ? (
          <EmptyState onPick={submit} />
        ) : (
          history.map((m) => (
            <MessageRow key={m.id} role={m.role} text={m.text} status={m.status} error={m.error} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-3">
        <div className="glass-frost flex items-end gap-2 rounded-xl px-3 py-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask me anything…"
            rows={1}
            maxLength={2000}
            disabled={streaming}
            className="min-h-[24px] flex-1 resize-none bg-transparent text-[14px] text-white outline-none placeholder:text-[var(--text-faint)] disabled:opacity-60"
          />
          <button
            aria-label="Send message"
            disabled={streaming || !inputValue.trim()}
            onClick={() => submit()}
            className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[var(--canvas)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-[15px] text-white">
        Hey. Ask me anything — what I can do, how I work, or just say hi.
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="glass-frost focus-ring rounded-full px-3 py-1.5 text-[12px] text-[var(--text-dim)] transition-colors hover:text-white"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageRow({
  role,
  text,
  status,
  error,
}: {
  role: "user" | "buddy";
  text: string;
  status: string;
  error?: string;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[var(--surface-2)] px-3.5 py-2 text-[14px] text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[88%] gap-2">
        <span className="brand-dot mt-1.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="prose prose-invert prose-sm max-w-none break-words text-[14px] text-white">
            {text ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            ) : status === "streaming" ? (
              <span className="text-[var(--text-faint)]">
                thinking
                <span className="stream-cursor" />
              </span>
            ) : null}
            {status === "streaming" && text ? (
              <span className="stream-cursor" />
            ) : null}
          </div>
          {status === "error" && error ? (
            <div className="text-[12px] text-[var(--accent-warm)]">
              ⚠ {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
