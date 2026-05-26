# BUDDY — Roadmap

What's done, what's next. Loose, honest, and updated whenever a chunk lands.

## Shipped (alpha)

- ✅ Tauri 2 desktop scaffold with single-window, frameless transparent overlay
- ✅ Global hotkey (default `⌥ Space` / `Ctrl Space`) — toggle summon
- ✅ Click-to-capture hotkey rebinder (yellow glow, OS-reserved combo detection)
- ✅ System tray icon + menu (Open / New chat / Settings / Quit)
- ✅ OS keychain for Anthropic API key (never in renderer)
- ✅ Anthropic streaming proxy in Rust with SSE parsing
- ✅ Procedural 3D BUDDY mascot — body, eyes (cursor tracking), antenna, mouth, cheeks, internal sparkles, Fresnel rim halo
- ✅ Idle behavior — bob, breathing, random blink, wander, jump-with-squash
- ✅ Streaming markdown speech bubble + chat history
- ✅ Slash commands (`/close`, `/quit`, `/hide`, `/new`, `/clear`, `/settings`)
- ✅ Demo mode (skip API key, canned in-character replies)
- ✅ Onboarding flow: welcome → hotkey → auth → ready
- ✅ Inline settings panel (no separate window)
- ✅ Marketing site (`buddy.ai`) — hero, features, how-it-works, live chat demo, pricing, footer, loading gate
- ✅ Unsigned `.app` and `.dmg` builds

## In progress

- 🔧 Code-sign the macOS `.app` with a real Developer ID + notarize
- 🔧 Custom BUDDY-mint icon (currently the default Tauri icon)
- 🔧 Auto-update plumbing (`tauri-plugin-updater`)

## Next up

- 🟢 Voice input — `whisper.cpp` (offline) with Web Speech API fallback
- 🟢 Voice output — ElevenLabs Turbo v2.5 streaming with Web Audio amplitude → mouth animation
- 🟢 Anthropic web_search tool wired to `stream_chat` for real-time facts
- 🟢 Specialized tools — weather, stocks, news, define, unit conversion
- 🟢 Session history disk persistence under `~/.buddy/sessions/`
- 🟢 Settings — voice picker, history retention slider, telemetry toggle, export/wipe data
- 🟢 Windows + Linux installers (`.msi`, `.AppImage`, `.deb`)

## Later

- 🔵 BUDDY Cloud (free during alpha) — proxied auth so users don't need their own Anthropic key
- 🔵 Optional cloud sync of sessions (client-side encrypted)
- 🔵 Caption mode for voice playback
- 🔵 Konami code, easter eggs from the original brief
- 🔵 Plausible-style opt-in telemetry
- 🔵 Sentry crash reporting with PII scrubbing
- 🔵 i18n (English, German, French to start)

## Done / parked

- 🟡 Particle dissolve/assemble teleport animation — built once, currently inactive in favor of the simpler wander+jump motion. Will revive when window-position animation lands.
