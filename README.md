<div align="center">

# BUDDY

**A companion made of light.**

BUDDY is a desktop AI companion that lives at the edge of your screen. Press a hotkey from any app and he appears — a small glass mascot floating on your desktop, ready to answer anything. Focus on your work and he vanishes.

[![License: MIT](https://img.shields.io/badge/License-MIT-00D97E.svg?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-Tauri%20%C2%B7%20Next.js%20%C2%B7%20React-1A1F2E?style=flat-square)](#stack)
[![Status](https://img.shields.io/badge/status-alpha-FF6B35?style=flat-square)](#status)

</div>

---

## What's in here

This is the BUDDY monorepo. Two apps, shared docs.

```
buddy/
├─ apps/
│  ├─ site/        Marketing site — buddy.ai (Next.js 16 + R3F)
│  └─ desktop/     The companion software itself (Tauri 2 + R3F)
├─ docs/           Architecture, design briefs, contributor guides
├─ README.md       (you are here)
├─ CONTRIBUTING.md
├─ SECURITY.md
└─ LICENSE         MIT
```

| App | What it is | Run |
|---|---|---|
| [`apps/site`](apps/site/) | The marketing website with the live 3D mascot, chat demo, pricing | `cd apps/site && npm install && npm run dev` |
| [`apps/desktop`](apps/desktop/) | The actual BUDDY desktop app — hotkey, tray, transparent overlay | `cd apps/desktop && npm install && npm run tauri dev` |

## Status

**Alpha.** We're polishing the desktop overlay, voice in/out, and signed installer pipeline. The marketing site is live-deployable today; the desktop app runs in dev and as an unsigned `.app` bundle. See [docs/ROADMAP.md](docs/ROADMAP.md).

## How BUDDY works

```
┌──────────────────────────────────────────────────────────────────┐
│  Press hotkey (default ⌥ Space / Ctrl Space) from any app        │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Tauri Rust core                                           │ │
│  │   • Global shortcut listener                               │ │
│  │   • Tray icon + menu                                       │ │
│  │   • OS keychain for API keys                               │ │
│  │   • Anthropic Messages API streaming proxy                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frameless transparent WebView (React + Three.js)          │ │
│  │   • 3D BUDDY mascot — drifts, jumps, blinks                │ │
│  │   • Floating speech bubble (streaming)                     │ │
│  │   • Frost-glass input pill                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

The mascot itself is **fully procedural** — no GLB assets. The 3D model is defined in [`apps/desktop/src/components/Companion/BuddyModel.tsx`](apps/desktop/src/components/Companion/BuddyModel.tsx) and is shared in spirit with the marketing site's hero scene. Same brand, same character.

## Quick start (both apps)

```bash
git clone https://github.com/TryBuddyAI/buddy.git
cd buddy

# 1) Run the marketing site
cd apps/site
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
# → http://localhost:3000

# 2) Run the desktop app
cd ../desktop
npm install
npm run tauri dev
# → onboarding window opens, walk through it, press hotkey to summon BUDDY
```

> **Desktop app needs:** Node 18+, Rust (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).
> **Marketing site needs:** Node 18+ and an Anthropic API key for the `/api/chat` route.

## Stack

| Layer | Choice |
|---|---|
| Desktop runtime | **Tauri 2** (Rust + native WebView, <15 MB bundle) |
| Web framework | **Next.js 16** (App Router, Turbopack) |
| UI | **React 19** + TypeScript strict |
| 3D | **three.js + @react-three/fiber + @react-three/drei** |
| Animation | **motion** (formerly framer-motion) |
| State | **zustand** (with `persist` middleware) |
| LLM | **Anthropic Claude** (`claude-opus-4-7`, streaming) |
| Styling | **Tailwind v4** (CSS-based config) |
| Voice (planned) | **whisper.cpp** (local STT) + **ElevenLabs** (TTS) |

## Personality

BUDDY has a hard 1–10 sentence rule, no filler openers, never breaks character, and a dry sense of humor. The system prompt that enforces this lives in [`apps/desktop/src-tauri/src/chat.rs`](apps/desktop/src-tauri/src/chat.rs). Sample exchanges:

> **User:** What's the capital of Australia?
> **BUDDY:** Canberra — picked as a compromise so Sydney and Melbourne wouldn't keep fighting about it.

> **User:** Explain quantum entanglement.
> **BUDDY:** Two particles can share a state so completely that measuring one instantly tells you about the other, even across huge distances. Einstein called it "spooky action at a distance" and wasn't a fan. It doesn't let you send information faster than light, despite what sci-fi often claims — the correlation is there, but it's only visible after you compare notes the slow way.

## Privacy

- Conversations stay local. Nothing is uploaded unless you explicitly enable cloud sync (not yet shipped).
- API keys are stored in the OS keychain via the [`keyring`](https://crates.io/crates/keyring) Rust crate. They never enter the renderer process memory.
- Telemetry is opt-in. When enabled, only event names + numeric metadata (`hotkey_pressed`, `message_sent`, `length_bucket`). Never message content.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — How the desktop app's two processes and three views fit together
- [docs/DESKTOP_APP_BRIEF.md](docs/DESKTOP_APP_BRIEF.md) — The full engineering brief Claude Code used to build this
- [docs/ROADMAP.md](docs/ROADMAP.md) — What's done, what's next
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [SECURITY.md](SECURITY.md) — Responsible disclosure

## License

MIT. See [LICENSE](LICENSE). © 2026 BUDDY Labs.

---

<div align="center">
<sub><i>Made of light. Built for thinking.</i></sub>
</div>
