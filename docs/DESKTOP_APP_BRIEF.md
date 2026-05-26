# BUDDY — Desktop App Engineering Brief

The full design + engineering brief the codebase was built from. Reference doc for contributors who want to know *why* a decision was made before *how*.

---

## 1. Product

BUDDY is a desktop AI companion. The user installs it once, picks a global hotkey, and from then on BUDDY is always running in the background. Press the hotkey from anywhere — any app, any window — and BUDDY pops up as a small frameless overlay with his 3D glass mascot and a text input. Ask anything (text or voice). BUDDY streams an answer in a Crystal-glass bubble. He runs on Claude with real-time web search, has a quietly funny personality, and never wastes a sentence.

Brand bar: looks and behaves like the same companion the user met on buddy.ai. Same model, same mood states, same speech bubble. The website is the trailer; this is the film.

## 2. Daily UX flow

**First launch (one-time):**
1. Frameless welcome window assembles BUDDY from particles, he says "Hey. I'm BUDDY. Let's pick how you summon me."
2. Hotkey capture screen — user clicks the pill (it glows yellow) and presses any combo with at least one modifier. Live validation against OS-reserved combos (`⌘Q`, `⌘Tab`, `Alt+F4`).
3. Auth step — paste an Anthropic API key OR click **Try demo mode →** to skip and use canned in-character replies.
4. Ready step → **Start BUDDY →**. Window shrinks from 720×640 to 380×440 and re-centers as a frameless transparent overlay. BUDDY is visible immediately.

**Every-day flow:**
- Press the hotkey from anywhere → BUDDY's window springs in at its remembered position, grabs focus, input is pre-focused.
- Type or hold-to-speak. Submit on Enter.
- BUDDY's mood shifts to `thinking` (antenna pulses), then `speaking` as tokens stream in.
- Esc dismisses. Slash-command `/close`, `/hide`, `/new`, `/settings` work inline.
- Conversation is remembered until idle timeout or `/new`.

**Tray menu:** Open BUDDY · New chat · Settings · Quit.

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Tauri 2.x** (Rust + native WebView) | <15 MB bundle, cross-platform, secure boundary between key storage and renderer |
| Frontend | **React 19** + TypeScript strict + Vite | Modern, fast HMR, type-safe |
| Styling | **Tailwind v4** | CSS-based config, glass utility classes |
| 3D | **three.js + @react-three/fiber + @react-three/drei** | Same procedural mascot as the marketing site |
| State | **zustand** + `persist` middleware | Tiny, no providers, persists across runs |
| Animation | **motion** | Successor to framer-motion, lighter |
| LLM | **Anthropic Claude** (`claude-opus-4-7`, streaming, Messages API) | Built-in web search tool, first-class TypeScript SDK |
| Secrets | **OS keychain** via `keyring` Rust crate | macOS Keychain / Windows Credential Manager / Linux Secret Service |
| Markdown | `react-markdown` + `remark-gfm` | Streaming-friendly, no `dangerouslySetInnerHTML` |
| Plugins | `global-shortcut`, `autostart`, `store`, `clipboard-manager`, `notification`, `window-state`, `shell` | Official Tauri plugins |

## 4. Architecture — two processes, one window

**Rust core (Tauri main)** owns: global hotkey, system tray, autostart, key storage, network proxy to Anthropic. The user's API key never enters the renderer process.

**WebView frontend** renders: the 3D BUDDY mascot, speech bubble, input pill, onboarding flow, settings panel. It talks to Rust only through `tauri::command` handlers.

**One window, two views.** The same Tauri window adapts based on `useApp.hasOnboarded`:
- `false` → `<OnboardingWindow>` with `body.opaque` (dark background)
- `true` → `<SummonWindow>` with transparent body (only BUDDY + pill paint pixels)

The `complete_onboarding` IPC command resizes the window, flips `alwaysOnTop` + `skipTaskbar`, re-centers, and keeps it visible — the renderer re-renders into summon mode.

## 5. The 3D mascot

Fully procedural, no GLB assets. Defined in [`apps/desktop/src/components/Companion/BuddyModel.tsx`](../apps/desktop/src/components/Companion/BuddyModel.tsx).

- **Body:** `MeshPhysicalMaterial` (mint base + sheen + clearcoat + emissive). We tried `MeshTransmissionMaterial` for true glass refraction — beautiful, but it rendered the whole scene multiple times per frame, tanking the framerate and turning BUDDY into a chrome mirror. The current physical-material + Fresnel-rim combo gives the "made of light" feel for ~1% the cost.
- **Fresnel rim:** custom GLSL `shaderMaterial` doing `pow(1 - dot(normal, viewDir), 2.5)` in mint, additively blended. Cheap, gorgeous.
- **Internal sparkles:** drei `<Sparkles>`, count scales with quality tier (`ultra` 50 / `high` 30 / `low` 0).
- **Eyes:** two white spheres + two dark pupils that lerp toward the cursor; random blink scheduler 3–7 s with a 20% double-blink.
- **Antenna:** cylinder + emissive mint orb that pulses with mood.
- **Mouth:** custom `THREE.Shape` quadratic curve.
- **Cheeks:** two coral discs at 50% opacity.
- **Motion (overlay only):** wander (lemniscate drift + 0.7-unit x offset) + jump physics (gravity, squash-and-stretch on land).

Quality tier auto-detected from `navigator.deviceMemory` and `navigator.hardwareConcurrency`.

## 6. The hotkey

Default: `⌥ Space` on macOS, `Ctrl Space` on Windows/Linux. Rebindable any time from onboarding or settings.

**Click-to-capture flow** ([`apps/desktop/src/components/Onboarding/HotkeyCapture.tsx`](../apps/desktop/src/components/Onboarding/HotkeyCapture.tsx)):
1. Click the pill → it glows yellow with a soft animated halo.
2. Press your combo — must include at least one modifier (⌘ ⌃ ⌥ ⇧).
3. Validation rejects single-key combos and OS-reserved combos.
4. The Rust `register_hotkey` command unregisters the previous shortcut and binds the new one.

The Rust handler reads the current shortcut from a `Mutex<Option<Shortcut>>` every fire, so rebinds work without a restart.

**macOS gotcha:** some combos require Accessibility permission. We deep-link into System Settings → Privacy → Accessibility if missing.

## 7. Personality + length

The system prompt lives verbatim in [`apps/desktop/src-tauri/src/chat.rs`](../apps/desktop/src-tauri/src/chat.rs). Hard rules:

- **1–10 sentences.** Length scales with the question.
- **Cite sources inline** as `(example.com)` when web_search was used.
- **Never break character.** "I'm just an AI" is banned.
- **No filler openers.** Never starts with "Great question" / "I'd be happy to" / "Sure!".
- **No exclamation marks** unless the user used one first.

Personality samples:

> **User:** What's the capital of Australia?
> **BUDDY:** Canberra — picked as a compromise so Sydney and Melbourne wouldn't keep fighting about it.

> **User (rude):** this is dumb.
> **BUDDY:** Fair — what would make it less so? I can re-explain, shorten it, or come at it from a different angle.

## 8. Privacy

- **API keys** stored in OS keychain, never in the renderer.
- **Conversations** stay local on disk (last 20 sessions in `localStorage`). Never uploaded.
- **Telemetry** is opt-in. Only event names + numeric metadata, never content.
- **Demo mode** keeps everything 100% offline.

## 9. Performance budget

- Idle CPU < 1% (pause WebGL render loop while hidden)
- Idle RAM < 80 MB
- Cold start to first paint < 700 ms
- Hotkey-press to window-visible < 100 ms (window pre-created, just shown)
- First token latency < 600 ms (Anthropic streaming)
- 60 fps while window is open

## 10. Build pipeline

```
apps/desktop/                npm run tauri build
  ├─ Vite builds the frontend → apps/desktop/dist/
  ├─ Rust release build       → src-tauri/target/release/buddy-desktop
  └─ Bundler packages         → src-tauri/target/release/bundle/macos/BUDDY.app
                              → src-tauri/target/release/bundle/dmg/BUDDY_*.dmg
```

Total release `.dmg` size: ~6.4 MB. End users get one drag-to-Applications install.

## 11. Anti-patterns (must NOT do)

- ❌ Electron. We promised <15 MB.
- ❌ Keep the API key in the webview process. Always proxy through Rust.
- ❌ Spawn `web_search` for every question — only when the prompt justifies fresh data.
- ❌ Block the input while BUDDY is thinking. The user should be able to cancel.
- ❌ Auto-listen by default. Voice is opt-in.
- ❌ Pad answers. The 1–10 sentence rule is hard.
- ❌ Break the visual identity from the marketing site.
- ❌ Generic "I'm a language model" disclaimers. BUDDY doesn't say that.
- ❌ Ship without signed builds (planned).
- ❌ Stock 3D models. Build procedurally.
- ❌ Animation that doesn't mean something.

## 12. Reference bar

Raycast (hotkey UX) · Linear (typography, glass) · Arc (playful + serious polish) · Spotlight/Alfred (overlay pattern) · Cursor / Continue.dev (LLM streaming UX).

If a build doesn't *feel* like it belongs here, iterate.
