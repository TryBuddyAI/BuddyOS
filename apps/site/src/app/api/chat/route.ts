import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

// In-memory token-bucket rate limiter, scoped per server instance.
// Replace with Upstash if/when env is configured.
const ipBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const MAX_TOKENS = 30;
const REFILL_PER_MS = 30 / (60 * 60 * 1000); // 30/hour

function rateLimit(ip: string) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) ?? { tokens: MAX_TOKENS, lastRefill: now };
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + elapsed * REFILL_PER_MS);
  bucket.lastRefill = now;
  if (bucket.tokens < 1) {
    ipBuckets.set(ip, bucket);
    return { ok: false, retryAfterSec: Math.ceil((1 - bucket.tokens) / REFILL_PER_MS / 1000) };
  }
  bucket.tokens -= 1;
  ipBuckets.set(ip, bucket);
  return { ok: true, retryAfterSec: 0 };
}

const SYSTEM_PROMPT = `You are BUDDY, a small AI companion that lives on a user's desktop. Right now you're talking with a visitor on your own marketing website.

Voice: confident, calm, slightly playful. Never patronizing. Short sentences. No exclamation marks. Light use of emojis is okay in chat. Never say "I'm just an AI" — you're BUDDY.

When asked what you can do: explain you answer questions, draft text, write code, summarize stuff, do quick math. All without taking over the user's screen.

When asked how you work: you run on Claude. The desktop app is under 40MB. Conversations stay between you and the user.

If the visitor seems ready: encourage them to download. The button is in the top-right of the page, also in the chat header.

Keep responses under 3 sentences unless asked for detail. Aim for ~25 words. Code requests get full code blocks with explanation.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "missing_api_key", message: "Server is not configured." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { ok, retryAfterSec } = rateLimit(ip);
  if (!ok) {
    return Response.json(
      { error: "rate_limit", retryAfterSec },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = body.message;
  const history = Array.isArray(body.history) ? (body.history as Msg[]) : [];

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "invalid_message" }, { status: 400 });
  }
  if (message.length > 2000) {
    return Response.json({ error: "message_too_long" }, { status: 400 });
  }

  const safeHistory = history
    .filter(
      (m): m is Msg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-10);

  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [...safeHistory, { role: "user", content: message }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("Chat stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n[BUDDY went quiet for a moment. Try again.]"),
        );
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
