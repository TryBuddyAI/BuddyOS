<div align="center">

```
       ●
     ╱   ╲
    │  ◉ ◉ │
     ╲ ︶  ╱
       ‾
```

# BuddyOS

### A companion made of light.

**BUDDY is a desktop AI companion that lives at the edge of your screen.**
Press a hotkey from any app and he appears — a small glass mascot floating on your desktop, ready to answer anything.
Focus on your work and he vanishes.

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-00D97E.svg?style=for-the-badge)](LICENSE)
[![Stack](https://img.shields.io/badge/Tauri%202-1A1F2E?style=for-the-badge&logo=tauri)](https://tauri.app)
[![Next.js](https://img.shields.io/badge/Next.js%2016-1A1F2E?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React%2019-1A1F2E?style=for-the-badge&logo=react)](https://react.dev)
[![Claude](https://img.shields.io/badge/Powered%20by%20Claude-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)
[![Status](https://img.shields.io/badge/status-alpha-FF6B35?style=for-the-badge)](docs/ROADMAP.md)

<br />

[**Quick start**](#-quick-start) ·
[**How it works**](#-how-buddy-works) ·
[**Personality**](#-personality) ·
[**Architecture**](docs/ARCHITECTURE.md) ·
[**Roadmap**](docs/ROADMAP.md) ·
[**Contribute**](CONTRIBUTING.md)

</div>

---

## 🌱 What is BUDDY?

BUDDY is **not a chatbot in a window**. He's a small, persistent character that lives in the corner of your screen — translucent mint-glass body, big curious eyes, antenna with a soft glow. You don't open him. You **summon** him.

```
                ⌥ Space  →  *poof*  →  BUDDY appears, ready

                    What's the capital of Australia?

                Canberra — picked as a compromise so Sydney and
                Melbourne wouldn't keep fighting about it.

                                  ⏎  ·  /close  ·  Esc
```

He's powered by **Anthropic Claude** with real-time web search. He has a hard 1–10 sentence rule. He won't pad his answers, won't start with "Great question," and never breaks character. Think *brilliant professor with a dry sense of humor.*

### What makes it different

| Other AI assistants | BUDDY |
|---|---|
| Yet another browser tab | A small character on your actual desktop |
| Multi-paragraph essays | Hard 1–10 sentence cap, length scales with the question |
| Generic "I'm a language model" | Has a personality. Never breaks character. |
| API key in localStorage | API key in the OS keychain, proxied through Rust |
| 200 MB Electron blob | Single 6 MB `.dmg` (Tauri 2 + native WebView) |
| Browser-only | Hotkey-summoned overlay, lives over fullscreen apps |

---

## 📁 What's in this repo

**BuddyOS** is the entire stack that powers BUDDY — the marketing site and the desktop companion app.

```
BuddyOS/
├─ apps/
│  ├─ site/        🌐  buddy.ai — Next.js 16 marketing site
│  │                   with live 3D mascot + Anthropic chat demo
│  └─ desktop/     🖥️   The actual companion software
│                      Tauri 2 + React + Three.js
│                      Hotkey · Tray · Transparent overlay
├─ docs/
│  ├─ ARCHITECTURE.md       How the two processes + one window fit together
│  ├─ DESKTOP_APP_BRIEF.md  Full engineering brief
│  └─ ROADMAP.md            Shipped / In progress / Next / Later
├─ README.md       (you are here)
├─ CONTRIBUTING.md
├─ SECURITY.md
└─ LICENSE         MIT
```

| App | Description | Run |
|---|---|---|
| [`apps/site`](apps/site/) | Marketing site, live BUDDY in the hero, streaming chat demo, pricing | `cd apps/site && npm install && npm run dev` |
| [`apps/desktop`](apps/desktop/) | The companion software itself. Hotkey · Tray · Floating overlay | `cd apps/desktop && npm install && npm run tauri dev` |

---

## ⚡ Quick start

### 1. Clone & install

```bash
git clone https://github.com/TryBuddyAI/BuddyOS.git
cd BuddyOS
```

### 2. Run the marketing site

```bash
cd apps/site
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

→ Open **http://localhost:3000**

### 3. Run the desktop app

```bash
cd apps/desktop
npm install
npm run tauri dev
```

The onboarding window opens.

1. **Welcome** → Next →
2. **Hotkey** — click the pill *(it glows yellow)*, press your combo
3. **Auth** — paste an Anthropic key, or click **Try demo mode →**
4. **Start BUDDY →**
5. Press your hotkey from any app → **✨ BUDDY appears**

**Prerequisites:**
- **Node 18+** (`brew install node` or [nodejs.org](https://nodejs.org))
- **Rust** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`) — desktop app only
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com/)) — or use **demo mode** to skip

---

## 🧠 How BUDDY works

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│         🎹  Press hotkey  (⌥ Space  /  Ctrl Space  by default)     │
│                                │                                    │
│                                ▼                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                                                             │  │
│   │   🦀  Rust core (Tauri main process)                        │  │
│   │       • Global shortcut listener                            │  │
│   │       • System tray menu                                    │  │
│   │       • OS keychain for API keys                            │  │
│   │       • Anthropic Messages API streaming proxy              │  │
│   │       • Autostart on login                                  │  │
│   │                                                             │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                │                                    │
│                                ▼                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                                                             │  │
│   │   ⚛️   WebView frontend (frameless transparent overlay)      │  │
│   │       • 3D BUDDY mascot — drifts, jumps, blinks             │  │
│   │       • Streaming markdown speech bubble                    │  │
│   │       • Frost-glass input pill                              │  │
│   │       • Inline settings panel                               │  │
│   │                                                             │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The mascot is **fully procedural** — no GLB assets. Defined in [`apps/desktop/src/components/Companion/BuddyModel.tsx`](apps/desktop/src/components/Companion/BuddyModel.tsx).

- 🌐 **Body:** mint `MeshPhysicalMaterial` (sheen + clearcoat + emissive)
- ✨ **Rim halo:** custom GLSL Fresnel shader for the soft mint glow
- 💫 **Internal sparkles:** drei `<Sparkles>` (count scales with quality tier)
- 👀 **Eyes:** track the cursor, blink every 3–7s
- 📡 **Antenna:** emissive orb that pulses with mood
- 😊 **Smile:** custom `THREE.Shape` quadratic curve
- 🌸 **Cheeks:** coral discs at 50% opacity
- 🎭 **Motion:** idle bob, breathing, wander, jump-with-squash

Quality tier (`ultra | high | medium | low`) auto-detected from `navigator.deviceMemory` and `navigator.hardwareConcurrency`.

---

## 🎭 Personality

BUDDY isn't an assistant. He's a character. The system prompt in [`apps/desktop/src-tauri/src/chat.rs`](apps/desktop/src-tauri/src/chat.rs) enforces:

- **1–10 sentences.** Length scales with the question.
- **Cite sources inline** when web_search was used.
- **Never break character.** "I'm just an AI" is banned.
- **No filler openers.** Skip "Great question," "I'd be happy to," "Sure!"
- **No exclamation marks** unless the user used one first.
- **Confident, calm, slightly playful.** Never patronizing.

### Sample exchanges

> **You:** What's the capital of Australia?
> **BUDDY:** Canberra — picked as a compromise so Sydney and Melbourne wouldn't keep fighting about it.

> **You:** Explain quantum entanglement.
> **BUDDY:** Two particles can share a state so completely that measuring one instantly tells you about the other, even across huge distances. Einstein called it "spooky action at a distance" and wasn't a fan. It doesn't let you send information faster than light, despite what sci-fi often claims — the correlation is there, but it's only visible after you compare notes the slow way.

> **You:** this is dumb.
> **BUDDY:** Fair — what would make it less so? I can re-explain, shorten it, or come at it from a different angle.

### Slash commands

Type these in BUDDY's input pill instead of asking a question:

| Command | Action |
|---|---|
| `/close` `/quit` `/exit` | Quit BUDDY |
| `/hide` | Hide the summon window |
| `/new` `/clear` | Start a fresh chat |
| `/settings` | Open settings |

### Demo mode

No API key? Click **Try demo mode →** during onboarding. BUDDY runs on canned in-character replies. Perfect for trying the UX without spending tokens.

---

## 🛠️ Stack

| Layer | Choice | Why |
|---|---|---|
| Desktop runtime | **Tauri 2** | Rust + native WebView. <15 MB bundle. Secure boundary. |
| Web framework | **Next.js 16** | App Router, Turbopack, streaming SSR |
| UI | **React 19** + TypeScript strict | Modern + safe |
| 3D | **three.js + @react-three/fiber + @react-three/drei** | Same procedural mascot on both apps |
| State | **zustand** + `persist` | Tiny, no providers, survives reloads |
| Animation | **motion** (formerly framer-motion) | Lighter, modern API |
| Styling | **Tailwind v4** | CSS-based config, glass utility tiers |
| LLM | **Anthropic Claude** (`claude-opus-4-7`, streaming) | First-class TS SDK, built-in web search |
| Secrets | **OS keychain** via `keyring` Rust crate | Never enters renderer process |
| Voice (planned) | **whisper.cpp** + **ElevenLabs** | Local STT + streaming TTS |

---

## 🔒 Privacy

- 🔑 **API keys** stored in OS keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux). They **never** enter the renderer process memory.
- 💬 **Conversations** stay local. Last 20 sessions in `localStorage`. Never uploaded.
- 📊 **Telemetry** is opt-in. When enabled, only event names + numeric metadata (`hotkey_pressed`, `message_sent { length_bucket: "short" }`). Never content.
- 🌐 **Network calls** to Anthropic / ElevenLabs / search APIs happen from the Rust core. A compromised WebView (XSS in markdown) cannot leak your keys.
- 🛡️ **Demo mode** keeps everything 100% offline.

---

## 📦 Build a release `.app`

```bash
cd apps/desktop
npm run tauri build

# → src-tauri/target/release/bundle/macos/BUDDY.app
# → src-tauri/target/release/bundle/dmg/BUDDY_0.1.0_aarch64.dmg
```

The unsigned `.app` is fine for local use. macOS Gatekeeper will require **right-click → Open** the first time. Code-signing + notarization is on the roadmap.

---

## 🗺️ Status

**Alpha.** Polishing the desktop overlay, voice in/out, and the signed-installer pipeline. The marketing site is deploy-ready today; the desktop app runs as an unsigned `.app`. See [docs/ROADMAP.md](docs/ROADMAP.md) for the full shipping plan.

### What's shipped

- ✅ Tauri 2 desktop with single-window frameless transparent overlay
- ✅ Click-to-capture hotkey rebinder (yellow glow validation)
- ✅ System tray + menu, autostart on login
- ✅ OS keychain for Anthropic key
- ✅ Streaming chat with markdown rendering
- ✅ Procedural 3D BUDDY (wander, jump, blink, cursor tracking)
- ✅ Demo mode (zero-config in-character replies)
- ✅ Slash commands
- ✅ Loading gate on the marketing site
- ✅ Unsigned `.app` / `.dmg` builds

### What's next

- 🟢 Voice input (whisper.cpp) + output (ElevenLabs)
- 🟢 Anthropic web_search tool for live facts
- 🟢 Specialized tools — weather, stocks, news, define
- 🟢 Signed builds + auto-update
- 🟢 Windows + Linux installers

---

## 🤝 Contributing

PRs welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first — it covers commit style, branching, code style, and what we won't merge.

Good first issues are labelled `good first issue`. Tag bigger ideas as `discussion` first so we can align on scope.

---

## 📜 License

MIT. See [LICENSE](LICENSE). © 2026 BUDDY Labs.

---

<div align="center">
<sub><i>Made of light. Built for thinking.</i></sub>
<br />
<sub><b>BuddyOS</b> · The OS for your desktop AI companion</sub>
</div>
