"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApp, type ChatMessage } from "../../lib/store";

export function MessageList() {
  const messages = useApp((s) => s.messages);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div
      ref={ref}
      className="no-drag flex-1 space-y-3 overflow-y-auto px-4 py-2"
    >
      {messages.map((m) => (
        <Row key={m.id} m={m} />
      ))}
    </div>
  );
}

function Row({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-[var(--surface-2)] px-3 py-1.5 text-[13.5px] text-white">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[92%] gap-2">
        <span className="brand-dot mt-1.5 shrink-0" />
        <div className="prose prose-invert prose-sm max-w-none break-words text-[13.5px] text-white">
          {m.text ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          ) : m.status === "streaming" ? (
            <span className="text-[var(--text-faint)]">
              thinking
              <span className="stream-cursor" />
            </span>
          ) : null}
          {m.status === "streaming" && m.text ? (
            <span className="stream-cursor" />
          ) : null}
          {m.status === "error" && m.error ? (
            <div className="mt-1 text-[12px] text-[var(--accent-warm)]">
              ⚠ {m.error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
