import { nanoid } from "nanoid";
import { useApp, type ChatMessage } from "./store";
import { hideSummon, quitApp, streamChat, type ChatTurn } from "./ipc";
import { speak } from "./speak";

/**
 * Slash commands that bypass the model entirely. Typed into the input bar
 * and matched at the very start of the message (case-insensitive).
 */
const SLASH_COMMANDS: Record<string, () => Promise<void> | void> = {
  close: async () => {
    await quitApp();
  },
  quit: async () => {
    await quitApp();
  },
  exit: async () => {
    await quitApp();
  },
  hide: async () => {
    await hideSummon();
  },
  new: () => {
    useApp.getState().newSession();
  },
  clear: () => {
    useApp.getState().newSession();
  },
  settings: () => {
    useApp.getState().setSettingsOpen(true);
  },
  help: () => {
    useApp.getState().say(
      "Slash commands: /close /quit /exit · /hide · /new /clear · /settings · /help",
      6500,
    );
  },
};

const DEMO_REPLIES: { match: RegExp | null; reply: string }[] = [
  {
    match: /^(hi|hello|hey|yo|sup)\b/i,
    reply: "Hey yourself. I'm in demo mode — full brain unlocks once you drop an API key in Settings.",
  },
  {
    match: /api key|anthropic|claude|sign in|account/i,
    reply: "Settings is one tray click away. Paste your Anthropic key there and I'll wake up properly.",
  },
  {
    match: /joke|funny/i,
    reply: "I would tell you a UDP joke, but I'm not sure you'd get it.",
  },
  {
    match: /weather|time|news|stock|price/i,
    reply: "Real-world lookups need the live brain. Drop in an API key and I'll fetch it from the web in real time.",
  },
  {
    match: /code|javascript|python|rust/i,
    reply: "I can pretend to write code in demo mode, but you really want the live model for that. One API key and we're cooking.",
  },
  {
    match: /who are you|what are you/i,
    reply: "BUDDY. Desktop AI companion. Currently running on charm and canned replies — connect me to Claude for the real thing.",
  },
  {
    match: /how|why|when|where|what/i,
    reply: "Good question. The real me would actually answer it — try connecting an API key in Settings.",
  },
  {
    match: /thanks|thank you|ty/i,
    reply: "Anytime. Press the hotkey whenever you need me.",
  },
  {
    match: /bye|see you|goodbye/i,
    reply: "I'll be here. Hotkey when you need me.",
  },
  {
    match: null,
    reply: "Heard. I'm in demo mode right now so my brain is on a leash — connect an API key to get a real answer.",
  },
];

function demoReplyFor(text: string): string {
  for (const { match, reply } of DEMO_REPLIES) {
    if (match === null) return reply;
    if (match.test(text)) return reply;
  }
  return DEMO_REPLIES[DEMO_REPLIES.length - 1].reply;
}

async function streamDemo(
  text: string,
  buddyId: string,
): Promise<void> {
  const reply = demoReplyFor(text);
  const tokens = reply.split(/(\s+)/);
  for (const token of tokens) {
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
    useApp.getState().appendBuddyChunk(buddyId, token);
    const acc = useApp.getState().messages.find((m) => m.id === buddyId)?.text;
    if (acc) useApp.getState().say(acc, 999_999);
  }
}

export async function sendMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Slash-command intercept — quit, hide, new, settings, etc.
  const slash = trimmed.match(/^\/(\w+)\b/);
  if (slash) {
    const cmd = slash[1].toLowerCase();
    useApp.getState().setInput("");
    const handler = SLASH_COMMANDS[cmd];
    if (handler) {
      await Promise.resolve(handler());
      return;
    }
    useApp
      .getState()
      .say(
        `No slash command called /${cmd}. Try /close, /hide, /new, or /settings.`,
        4000,
      );
    return;
  }

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

  const store = useApp.getState();
  store.pushMessage(userMsg);
  store.pushMessage(buddyMsg);
  store.setStreaming(true);
  store.setError(null);
  store.setMood("thinking");
  store.setInput("");

  const demo = useApp.getState().demoMode;

  if (demo) {
    // 350-700 ms "thinking" pause to sell the personality
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 350));
    useApp.getState().setMood("speaking");
    await streamDemo(trimmed, buddyId);
    useApp.getState().setMessageStatus(buddyId, "complete");
    useApp.getState().setStreaming(false);
    useApp.getState().setMood("idle");
    const final = useApp.getState().messages.find((m) => m.id === buddyId)?.text;
    if (final) {
      useApp.getState().say(final, 6000);
      speak(buddyId, final);
    }
    return;
  }

  // Live mode — call Claude through the Rust proxy.
  const history: ChatTurn[] = useApp
    .getState()
    .messages.filter(
      (m) => m.status === "complete" && m.id !== userMsg.id && m.id !== buddyId,
    )
    .map((m) => ({
      role: m.role === "buddy" ? "assistant" : "user",
      content: m.text,
    }));
  history.push({ role: "user", content: trimmed });

  let sawFirstToken = false;
  const personality = useApp.getState().personality;

  await streamChat(
    history,
    (chunk) => {
    switch (chunk.type) {
      case "start":
        useApp.getState().setMood("speaking");
        break;
      case "text_delta":
        if (!sawFirstToken) {
          sawFirstToken = true;
          useApp.getState().setMood("speaking");
        }
        useApp.getState().appendBuddyChunk(buddyId, chunk.text);
        {
          const acc = useApp
            .getState()
            .messages.find((m) => m.id === buddyId)?.text;
          if (acc) useApp.getState().say(acc, 999_999);
        }
        break;
      case "tool_use":
        if (chunk.name === "web_search") {
          useApp.getState().markMessageSearched(buddyId);
        }
        break;
      case "citation":
        useApp.getState().addCitation(buddyId, {
          url: chunk.url,
          title: chunk.title || chunk.url,
        });
        break;
      case "done": {
        useApp.getState().setMessageStatus(buddyId, "complete");
        useApp.getState().setStreaming(false);
        useApp.getState().setMood("idle");
        const finalText = useApp
          .getState()
          .messages.find((m) => m.id === buddyId)?.text;
        if (finalText) {
          useApp.getState().say(finalText, 6000);
          speak(buddyId, finalText);
        }
        break;
      }
      case "error":
        useApp.getState().setMessageStatus(buddyId, "error", chunk.message);
        useApp.getState().setStreaming(false);
        useApp.getState().setError(chunk.message);
        useApp.getState().setMood("idle");
        useApp.getState().silence();
        break;
    }
    },
    personality,
  );
}
