# BUDDY — Architecture

This document covers how the desktop app and website are wired internally. For the visual / UX brief, see [DESKTOP_APP_BRIEF.md](DESKTOP_APP_BRIEF.md).

---

## Two products, one identity

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   apps/site                 │         │   apps/desktop              │
│   Next.js 16 (App Router)   │  ←──→   │   Tauri 2 (Rust + WebView)  │
│   Marketing + live demo     │ shared  │   The actual companion      │
│                             │  brand  │                             │
│   buddy.ai                  │         │   .app / .dmg / installer   │
└─────────────────────────────┘         └─────────────────────────────┘
                  │                                   │
                  └───────── same procedural ─────────┘
                            3D BUDDY model
```

The two apps render BUDDY with the same procedural Three.js mascot (sphere + custom Fresnel rim + sparkles + procedural eyes/antenna/cheeks). The site uses it as a hero element; the desktop app uses it as the always-on companion.

---

## Desktop app — two processes

```
┌──────────────────────────────────────────────────────────────────┐
│  Rust core (Tauri main)                                          │
│  ─ Global hotkey listener (tauri-plugin-global-shortcut)         │
│  ─ System tray icon + menu                                       │
│  ─ Autostart-on-login (tauri-plugin-autostart)                   │
│  ─ OS keychain wrapper (keyring crate)                           │
│  ─ Anthropic Messages API streaming proxy                        │
│  ─ Window state, lifecycle, close-to-tray                        │
└──────────────────────────────────────────────────────────────────┘
                       ▲ tauri::command   ▼ Window::emit
┌──────────────────────────────────────────────────────────────────┐
│  WebView frontend (React 19 + TypeScript strict)                 │
│  ─ One window, two views (router: hasOnboarded ? Summon : Onb.)  │
│  ─ React Three Fiber canvas with the 3D BUDDY                    │
│  ─ Streaming markdown speech bubble                              │
│  ─ Hotkey-capture component (click → yellow glow → record combo) │
│  ─ Zustand store with persisted state                            │
└──────────────────────────────────────────────────────────────────┘
```

### Why two processes

- **Security.** A compromised webview (XSS in markdown, malicious file URL, …) cannot read the user's API key — those live in the Rust process's OS-keychain wrapper. Every Anthropic / ElevenLabs call is proxied through Rust, which injects the key into request headers server-side.
- **Performance.** Heavy work (file system, network, OS APIs) stays on the Rust side. The WebView only renders.
- **Native feel.** The system tray, global shortcut, window flags (frameless, transparent, always-on-top) are all native Rust calls — not approximations.

### IPC surface

```ts
// commands the renderer can call
invoke("show_summon" | "hide_summon" | "open_settings"
     | "close_onboarding" | "complete_onboarding" | "quit_app"
     | "default_hotkey_label" | "register_hotkey"
     | "set_api_key" | "has_api_key" | "clear_api_key"
     | "stream_chat", payload)

// events the Rust core emits to the renderer
"summon-shown"
"new-chat"           // tray menu → New chat
"open-settings"      // tray menu → Settings
"onboarding-complete"
"chat-chunk:<id>"    // streaming token deltas with request id
```

---

## The single-window model

We use **one Tauri window** with a query-string-free, state-driven router:

```
App.tsx
  └─ useApp.hasOnboarded
       false  → <OnboardingWindow>  (body class "opaque" → dark background)
       true   → <SummonWindow>      (transparent body, only BUDDY + pill paint)
```

When the user finishes onboarding, the React layer calls the `complete_onboarding` IPC command, which:
1. Resizes the window from `720 × 640` (onboarding) to `380 × 440` (overlay).
2. Sets `alwaysOnTop: true` and `skipTaskbar: true`.
3. Re-centers the window and emits `summon-shown` so the renderer focuses the input.

The window stays **the same OS window** the whole time. We never spawn extras.

### Why one window, not three

Earlier drafts had `onboarding`, `summon`, and `settings` as separate Tauri windows. That ran fine but:
- The user saw "three apps" in mission control even though only one was meant to be visible.
- Coordinating state across windows (zustand stores per webview) was awkward.
- The frameless-transparent overlay vs. the framed-opaque onboarding wanted different window flags, but Tauri allows changing `decorations` and `alwaysOnTop` at runtime — so a single window adapts cleanly.

Settings now opens inline (`useApp.setSettingsOpen(true)`) as a sliding glass card inside the summon view.

---

## The 3D mascot

[`apps/desktop/src/components/Companion/BuddyModel.tsx`](../apps/desktop/src/components/Companion/BuddyModel.tsx) (and a near-identical version at [`apps/site/src/components/Hero/BuddyModel.tsx`](../apps/site/src/components/Hero/BuddyModel.tsx)) defines BUDDY entirely procedurally:

- **Body:** `MeshPhysicalMaterial` (mint base + sheen + clearcoat + emissive glow). No transmission — we tried it and it cost too much per frame.
- **Rim halo:** custom GLSL `shaderMaterial` doing a Fresnel pow(2.5) edge glow in mint, additively blended. Cheap.
- **Antenna:** cylinder + emissive sphere tip, pulses with mood.
- **Eyes:** two white spheres + two dark pupils that lerp toward the cursor.
- **Cheeks:** two coral discs at ~50% opacity.
- **Mouth:** custom `THREE.Shape` quadratic curve for the smile.
- **Internal sparkles:** drei `<Sparkles>` count scales with quality tier.
- **Motion:** idle bob (sin t·1.2), breathing scale (sin t·0.8), random blink every 3–7s, wander+jump physics on the desktop overlay only.

Quality tier (`ultra | high | medium | low`) is auto-detected on boot from `navigator.deviceMemory` and `navigator.hardwareConcurrency` and controls geometry segments, sparkle count, and shadow toggles.

---

## State

We use **zustand with `persist`** in both apps.

```ts
// apps/desktop/src/lib/store.ts (excerpt)
{
  // persisted
  hotkey, hasOnboarded, demoMode, qualityTier, history,

  // transient
  mood, isStreaming, currentMessage, messages, input, error,
  settingsOpen,

  // actions
  setMood, say, silence, pushMessage, appendBuddyChunk,
  setMessageStatus, newSession, setInput, setError, setHotkey,
  setOnboarded, setDemoMode, setQualityTier, setSettingsOpen,
}
```

Persistence is `localStorage`, partialized to keep only the user-visible state. Streaming chunks and transient mood states do **not** persist.

---

## Build pipeline

```
Source                       Tooling                     Output
─────────────────────────────────────────────────────────────────────
apps/site                  Next.js 16 build         .next/  → Vercel
apps/desktop frontend      Vite 7 (Tailwind v4)     dist/
apps/desktop Rust          cargo build --release    target/release/buddy-desktop
apps/desktop bundle        tauri build              BUDDY.app, BUDDY_*.dmg
```

The frontend dist is embedded into the Tauri binary at build time. End users get a single `.app` with no external dependencies (other than the system WebView, which ships with macOS / Windows / most Linux distros).

---

## Privacy boundaries

```
[User input] ─────► WebView ─────► invoke("stream_chat", history)
                                          │
                                          ▼
                                 Rust: read key from OS keychain
                                          │
                                          ▼
                                 reqwest → api.anthropic.com
                                          │  (SSE stream)
                                          ▼
                                 emit("chat-chunk:<id>", chunk)
                                          │
                                          ▼
                                       WebView renders the token
```

The API key crosses zero JavaScript boundaries. The renderer only ever sees text deltas.
