# apps/desktop — the BUDDY companion

The actual desktop AI companion. Tauri 2 + React + Three.js. Runs as a frameless transparent overlay; pops up when you press the hotkey from any app.

Part of the [BUDDY monorepo](../../README.md). For the architecture write-up, see [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md). For the original engineering brief, see [`docs/DESKTOP_APP_BRIEF.md`](../../docs/DESKTOP_APP_BRIEF.md).

## Run in dev

```bash
npm install
npm run tauri dev
# → onboarding window opens
# → walk through it, click Start
# → press your hotkey from any app to summon BUDDY
```

You need **Node 18+** and **Rust** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).

## Build a `.app` / `.dmg`

```bash
npm run tauri build
# → src-tauri/target/release/bundle/macos/BUDDY.app
# → src-tauri/target/release/bundle/dmg/BUDDY_X.X.X_aarch64.dmg
```

The unsigned `.app` is fine for local use. macOS Gatekeeper will require **right-click → Open** the first time. Code-signing + notarization is on the roadmap.

## Slash commands

Type these into BUDDY's input pill instead of asking a question:

| Command | Action |
|---|---|
| `/close` · `/quit` · `/exit` | Quit BUDDY entirely |
| `/hide` | Hide the summon window (hotkey reopens) |
| `/new` · `/clear` | Start a fresh chat |
| `/settings` | Open the inline settings panel |

## Demo mode

If you don't have an Anthropic key, click **Try demo mode →** during onboarding. BUDDY runs on canned in-character replies — useful for showing the UX without spending tokens.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Tauri 2 (Rust + native WebView, ~6 MB `.dmg`) |
| Frontend | React 19 + TypeScript strict + Vite + Tailwind v4 |
| 3D | three.js + @react-three/fiber + @react-three/drei |
| Animation | motion |
| State | zustand + persist |
| LLM | Anthropic Claude (`claude-opus-4-7`, streaming) |
| Secrets | OS keychain via the `keyring` Rust crate |
| Plugins | global-shortcut, autostart, store, clipboard-manager, notification, window-state, shell |

## Layout

```
src/
  App.tsx              Single-window router (hasOnboarded ? Summon : Onboarding)
  main.tsx
  windows/
    Summon.tsx         Frameless transparent overlay (BUDDY + input pill)
    Onboarding.tsx     Opaque dark welcome flow (welcome → hotkey → auth → ready)
    Settings.tsx       Inline settings (rendered inside Summon)
  components/
    Companion/         BuddyModel.tsx, CompanionStage.tsx, SpeechBubble.tsx
    Chat/              MessageList.tsx, InputBar.tsx
    Onboarding/        HotkeyCapture.tsx (the click-to-capture pill)
  lib/
    store.ts           Zustand store
    ipc.ts             Typed wrappers around tauri::invoke + event listeners
    sendMessage.ts     Turn orchestration + slash command intercept
  styles/globals.css   Design tokens, glass tiers, drag-region

src-tauri/
  src/
    main.rs            Entry — calls into lib::run()
    lib.rs             Plugins, tray, global shortcut, command handlers
    chat.rs            Anthropic Messages API streaming proxy + system prompt
    keychain.rs        OS keychain wrapper (keyring crate)
  tauri.conf.json      Window flags, bundling, identifier (ai.buddy.desktop)
  capabilities/
    default.json       Capability allow-list (single window, scoped permissions)
```

## How the hotkey works

1. On boot, the default platform combo (`⌥ Space` on macOS, `Ctrl Space` elsewhere) is registered via `tauri-plugin-global-shortcut`.
2. The user can rebind any time via `HotkeyCapture.tsx` — click the pill, it glows yellow, press a new combo, the `register_hotkey` IPC unregisters the old and binds the new.
3. The Rust handler reads the *current* registered shortcut from a `Mutex<Option<Shortcut>>` so it survives rebinds.
4. macOS requires Accessibility permission for some combos — we deep-link into System Settings if it's missing.
