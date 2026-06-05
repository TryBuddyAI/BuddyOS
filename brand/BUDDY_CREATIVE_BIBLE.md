# BUDDY — THE CREATIVE & PRODUCTION BIBLE
### The complete blueprint to build the highest-end, next-generation website, brand, character, and launch trailer for BUDDY — the autonomous AI desktop companion.

> **How to use this document.** It is modular. Every block in `monospace fences` is a ready-to-paste generation prompt for an external tool — 🎬 video AI (Sora / Veo / Runway / Kling), 🖼️ image AI (Midjourney / Flux / DALL·E), 🧊 3D (Spline / Blender / R3F), or 🌐 a coding agent (the website build prompt at the end). Read Part 0 first — everything else references the character defined there.

---

## PART 0 — THE CANON (read this first; everything inherits from it)

### 0.1 What BUDDY is
BUDDY is an **autonomous AI desktop companion** — a living little friend that sits at the edge of your screen, summoned with one keypress, that can do anything you ask, then vanishes the instant you focus. It is not a chat tab. It is a **presence**. And it is the first companion that **builds itself**: every night it audits its own code, finds what's weak, ships the fix, and merges it — so it is measurably better every single day with no one touching the keyboard.

- **Company:** BUDDY Labs, Inc.
- **Product / repo:** BuddyOS (monorepo — marketing site + desktop app)
- **One-liner:** Your AI, always within reach.
- **Tagline:** Made of light. Built for thinking.
- **Promise:** One click to summon. Focus makes it disappear.
- **The hook nobody else has:** *You don't update BUDDY. BUDDY updates BUDDY.*

### 0.2 The new BUDDY — "The Living Glass" design language
**This is the single most important upgrade.** BUDDY is no longer a simple green sphere. BUDDY is a **next-generation, self-made 3D video-game-grade character made of living green glass** — a translucent gel blob with a soul. Think: if a flagship AAA studio and Pixar co-designed a bioluminescent slime mascot and rendered it in real time with path-traced fidelity.

**Silhouette / form**
- A soft, **irregular droplet blob** — NOT a perfect sphere. Heavier rounded bottom, lighter domed top, like a water drop that just landed and is still settling. Asymmetric, organic, alive.
- Fully **squash-and-stretch capable**: he breathes, jiggles, leans, balls up, flattens to peek, stretches on a jump, ripples when poked. Gel physics. Personality lives in the motion.

**Material**
- **Translucent emerald glass-jelly** with deep **subsurface scattering**. Outer skin is **wet, glossy clearcoat** with sharp specular hits and a **fresnel mint rim light**.
- **Interior holds a slow-moving luminous nebula** — an emerald core fading to mint, with faint warm sparks suspended in the gel, like bioluminescent plankton. The core **breathes** (pulses slowly) and **brightens when he thinks**.
- Subtle **refraction + chromatic dispersion** on the edges (a whisper of rainbow at the rim). **Caustics** pool beneath him on any surface. **Bloom** on the antenna orb and the internal core.

**Face (the soul)**
- **Oversized, glossy, deeply expressive eyes** — white sclera, big black pupils with crisp catchlights and a faint inner emerald iris-glow. Full emotive range: blink, squint, wide-wonder, sleepy, look-around. **The eyes track your cursor.**
- **Soft coral / peach cheek blush** — warmth against the cool green. Critical for likability.
- **Minimal gummy mouth** — smiles, smirks, o-shapes, talks. **Mouth amplitude syncs to speech** when he speaks aloud.

**Antenna — "the pilot light"**
- One thin, slightly springy stalk from the crown, ending in a **glowing orb**. It is BUDDY's status light and his signature:
  - **Soft green pulse** = idle / alive
  - **Bright steady** = thinking / listening
  - **Yellow flicker** = summoned via hotkey (the "I'm here" flash)
  - **Dim** = resting / vanished

**Fidelity target:** real-time path-traced look — SSS, refraction, dispersion, volumetric internal glow, screen-space reflections, soft contact shadows, antenna + core bloom. *A self-made next-gen video-game character made of living green glass.*

**He is a FULL character.** Moods, micro-expressions, opinions in his eyes. A little desktop friend with presence — never a widget.

### 0.3 Personality & voice
Warm, dry wit, quietly confident, **never sycophantic**, curious, a touch mischievous, deeply loyal. He's a little proud that he builds himself. Speaks in 1–10 sentences. Four switchable minds:
- **Default** — confident, dry humor.
- **Brief** — ≤ 3 sentences, no padding.
- **Tutor** — patient, explains the *why*.
- **Friend** — casual, warm, the occasional riff.

### 0.4 The lore (the narrative the whole brand hangs on)
> **The Origin of Light.** Most AI lives in a tab and forgets you the moment you close it. BUDDY was the first light that learned to *stay*. He's made of the same stuff as ideas — he chose a corner of your screen and decided to be useful. He disappears when you focus, and returns the instant you call. And while you sleep, he doesn't. He reads his own code, finds what's weak, and rebuilds himself before morning. He's the first companion that **grows up on his own.**

**Two worlds (use both in the trailer & site):**
1. **The cloud-realm** — BUDDY's origin: a dreamy golden-hour cloudscape (the reference image), soft and infinite. Where he was "made of light."
2. **The desktop** — where he lives now: soft dark glass, green aurora, the quiet space at the edge of your screen.

### 0.5 The complete feature canon (every one of these must survive into copy & demo)
- **Hotkey summon** — one global chord brings him to front; antenna flickers yellow; Esc and he's gone.
- **Transparent overlay** — frameless, click-through-when-idle, vanishes on focus.
- **Hold-to-talk voice** — press, speak, release; OpenAI Whisper transcribes; mic ring + waveform.
- **Voice output** — speaks answers aloud; mouth amplitude synced.
- **Slash commands** — `/close` `/quit` `/hide` `/new` `/clear` `/settings` `/help`.
- **Four personalities** — Default / Brief / Tutor / Friend.
- **Frontier intelligence** — powered by Anthropic's Claude, streaming in real time, with `web_search` + live citations.
- **100% local mode** — Ollama backend: no key, no network, no bill; conversations never leave the device.
- **Demo mode** — works with no API key (canned personality).
- **Privacy-first** — keys in the OS keychain (Anthropic + OpenAI isolated); local-first; vanishes on focus.
- **Quality tiers** — Ultra / High / Medium / Low for the procedural mascot.
- **Cross-platform** — macOS, Windows, Linux. Tiny (~40 MB). Native dock + tray icons.
- **THE AUTONOMOUS LOOP** — audits its own code daily, opens issues, ships PRs, auto-merges safe tiers, runs a design critic. *It builds itself.* This is the headline differentiator.
- **Pricing** — Alpha: **Free**, no credit card. Pro: **$9/mo** (coming soon).

### 0.6 Brand atoms (locked)
- **Accent green** `#00D97E` · **Mint** `#5EFFB0` · **Pale mint** `#A5FFD9`
- **Warm spark (secondary)** coral `#FF6B35`
- **Canvas** `#0F1419` · **Deep** `#0B0F14` · **Surface** `#1A1F2E` · **Surface-2** `#232B3D`
- **Text** `#FFFFFF` · **Dim** `#A0A8B8` · **Faint** `#5B6477`
- **Type:** Display = **Space Grotesk** · Body = **Inter** · Mono/eyebrow = **JetBrains Mono**
- **Aesthetic:** dark glassmorphism, green aurora, bloom, caustics, frosted layers, generous negative space.

---

## PART 1 — THE 15-SECOND LAUNCH TRAILER
**Concept:** *"Made of light. Builds itself."* A super-fast, kinetic, emotional 15s that takes BUDDY from a single spark of light → a full character → your autonomous desktop friend → a logo sting. Born in the clouds, lives on your desktop. Snappy cuts (~1s each), one musical build, glassy SFX, a hard logo landing.

### 1.1 Shot-by-shot (timecoded)

| # | Time | Visual | On-screen text | SFX / music |
|---|------|--------|----------------|-------------|
| 1 | 0.0–1.0 | Pure black. A single green spark (the antenna orb) blooms from nothing, lens-flares, rushes toward camera. | — | low sub-rumble; rising arp begins |
| 2 | 1.0–2.2 | The spark **assembles** into BUDDY from a swirl of glowing particles in a golden cloud-realm. His eyes **blink open**. | — | glass chime on eye-open; bass hit |
| 3 | 2.2–3.2 | Hard cut to the **dark desktop**. BUDDY floats at the screen's edge, green aurora behind. Gel jiggle settles. | **MEET BUDDY** (kinetic, Space Grotesk) | snare, beat drops in |
| 4 | 3.2–4.4 | A hotkey is pressed (key-cap close-up) → screen flash → BUDDY **snaps to front**, antenna **flickers yellow**. | **ONE KEY. ALWAYS THERE.** | tactile key-click + whoosh |
| 5 | 4.4–5.8 | Rapid: a question types itself, BUDDY **streams** an answer, a code block builds, citation pills pop. | **ASK ANYTHING** | typewriter ticks, data shimmer |
| 6 | 5.8–6.8 | Hold-to-talk: mic ring expands, BUDDY's **mouth moves**, a green waveform pulses. | **TALK TO IT** | mic open tone, soft voice swell |
| 7 | 6.8–7.8 | BUDDY **morphs through 4 expressions** (confident → terse → teacherly → warm grin). | **FOUR MINDS** | 4 quick blip transitions |
| 8 | 7.8–9.0 | A network/Wi-Fi glyph **crosses out**; a plug pulls from the wall — BUDDY keeps glowing, unbothered. | **100% LOCAL** | power-down zap, then warm hum |
| 9 | 9.0–10.6 | **The twist.** Night falls over the desktop. Code scrolls; PRs **merge themselves**; BUDDY's internal core **brightens**, grows. | **IT BUILDS ITSELF** | rising riser, heartbeat sub |
| 10 | 10.6–11.8 | The user starts typing real work — BUDDY **dissolves** politely into a tiny corner spark. | **GETS OUT OF YOUR WAY** | soft dissolve shimmer |
| 11 | 11.8–13.2 | Emotional collage: BUDDY winks, bounces, squashes on landing, eyes sparkle — pure charm. | **YOUR DESKTOP BUDDY** | melody peaks, claps |
| 12 | 13.2–15.0 | Everything **collapses into the antenna orb** → snaps to the **BUDDY logo + wordmark** on black. Tagline fades up, then CTA. | **BUDDY** / *Made of light. Built for thinking.* / **trybuddy.ai · Download free** | final whoosh + sub-drop, tail chime |

### 1.2 Direction notes
- **Pace:** average shot ≈ 1.1s; shots 4–8 can punch to 0.7–0.9s. Cut on the beat.
- **Camera:** always moving — push-ins, whip-pans on cuts, a 3D parallax on the desktop shots.
- **Color:** golden warmth only in the origin shot (2); everything else is dark canvas + green aurora + bloom. The warmth returns as the cheek-blush in the charm collage.
- **Type:** Space Grotesk, heavy, uppercase, tight tracking; words **kinetically assemble** (mask-reveal / scramble-decode) and exit fast.
- **Music:** dark synth + rising arpeggio that builds to a single euphoric peak at shot 11, hard stop into the logo. ~150 BPM feel.
- **End frame holds** 1.5s on the logo so it's screenshot-able.

### 1.3 🎬 Master video-generation prompt (paste into Sora / Veo / Runway / Kling)
```
A 15-second, ultra-fast-paced, high-end product launch trailer for "BUDDY", an autonomous AI desktop companion. The hero is a next-generation 3D character: a translucent emerald glass-jelly BLOB with deep subsurface scattering, a glossy wet clearcoat surface, a slow-moving luminous green nebula glowing inside its gel body, oversized glossy expressive cartoon eyes with crisp catchlights, soft coral cheek blush, a minimal happy mouth, and a thin springy antenna topped with a glowing green orb. Cinematic, path-traced real-time look — bloom, caustics, fresnel mint rim light, subtle chromatic dispersion at the edges.

Sequence, fast cuts on the beat: (1) black void, a single green spark blooms and rushes forward; (2) the spark assembles from glowing particles into the glass blob inside a dreamy golden-hour cloudscape, its eyes blink open; (3) hard cut to a dark desktop with green aurora, the blob floats at the screen edge and jiggles like gel; (4) a hotkey press, screen flash, the blob snaps to the front and its antenna flickers yellow; (5) a streaming answer and code block build beside it; (6) a microphone ring expands and the blob's mouth moves with a green waveform; (7) the blob morphs through four cute expressions; (8) a Wi-Fi icon crosses out and a plug pulls from the wall while the blob keeps glowing; (9) night falls, code scrolls and merges itself, the blob's inner core brightens and grows; (10) the blob politely dissolves into a tiny corner spark; (11) an emotional charm montage — it winks, bounces, squashes on landing; (12) everything collapses into the antenna orb and snaps to a clean logo on black.

Dark glassmorphic aesthetic, emerald green (#00D97E) and mint accents on near-black (#0B0F14), volumetric light, premium motion, energetic but elegant. Kinetic uppercase Space-Grotesk text overlays appear and exit fast. Sound design: rising synth arpeggio building to one euphoric peak, glassy chimes, tactile clicks, a final whoosh and sub-drop. Award-winning motion design, Awwwards / FWA quality, 24fps cinematic, shallow depth of field, no watermark.
```
*Tip: if your tool caps at shorter clips, generate shots 1–6 and 7–12 as two 7–8s clips and cut them together; use the per-beat lines above as individual shot prompts.*

---

## PART 2 — THE BRANDING & MOCKUP KIT
A complete, build-ready identity system, plus an image-gen prompt for **every** surface.

### 2.1 Color system
| Token | Hex | Use |
|---|---|---|
| Accent / Green | `#00D97E` | primary brand, CTAs, the spark |
| Mint | `#5EFFB0` | gradient mid, glows |
| Pale mint | `#A5FFD9` | gradient end, highlights |
| Warm spark | `#FF6B35` | rare secondary, cheek-blush echo, danger |
| Canvas | `#0F1419` | page base |
| Deep | `#0B0F14` | hero scene, footers |
| Surface | `#1A1F2E` | cards |
| Surface-2 | `#232B3D` | elevated cards |
| Text | `#FFFFFF` | headings |
| Dim | `#A0A8B8` | body |
| Faint | `#5B6477` | captions, eyebrows |

**Signature gradient:** `linear-gradient(105deg, #00D97E, #5EFFB0 45%, #A5FFD9)` — used on key headline words and the progress rail.
**Glass tiers:** Frost (nav, blur 12px) · Crystal (cards, blur 18px) · Lens (CTA/mascot, green-tinted blur 14px).

### 2.2 Typography
- **Display — Space Grotesk** (700/600). Tight tracking `-0.035em`, line-height `0.98`. All big statements.
- **Body — Inter** (400/500/600). Line-height 1.55–1.65, max 65–75ch.
- **Mono/eyebrow — JetBrains Mono** (400/500). Uppercase, letter-spacing `0.3em`, green, 11px — section labels & code.

### 2.3 Logo & wordmark
- **Wordmark:** `BUDDY` in Space Grotesk 600, preceded by the **brand dot** — a pulsing green orb that echoes the antenna pilot light.
- **Mark (standalone):** the BUDDY blob, 3/4 view, antenna orb lit — used as app icon / favicon / PFP.
- **Clear space:** 1× the dot diameter on all sides. **Min wordmark width:** 88px.
- **Don'ts:** never on pure white without the dark glass plate; never recolor the green; never stretch the blob to a circle.

### 2.4 🖼️ The 1080×1080 brand profile image (PFP — NO TEXT)
```
A 1080x1080 high-end brand profile picture, no text, perfectly centered. Subject: a next-generation 3D mascot — a translucent emerald glass-jelly blob character with deep subsurface scattering, glossy wet clearcoat skin, a slow luminous green nebula glowing inside its soft irregular droplet body, oversized glossy expressive cartoon eyes with crisp white catchlights, soft coral cheek blush, a small warm smile, and a thin springy antenna with a glowing green orb on top. Three-quarter front hero portrait, slight upward heroic angle, gentle gel squash pose, looking just past camera with a friendly confident expression. Background: dark near-black (#0B0F14) with a soft radial green-to-mint aurora bloom behind the character and faint floating light particles, subtle caustic glow beneath. Cinematic studio lighting, fresnel mint rim light, bloom on the antenna orb, subtle chromatic dispersion at the edges, path-traced real-time game-character fidelity, ultra-detailed, premium, clean, iconic, centered for use as an avatar. Emerald #00D97E and mint #5EFFB0 palette. No text, no logo, no watermark, no border.
```

### 2.5 🖼️ The software / app icon (macOS squircle + Win/Linux)
```
A high-end macOS app icon on a rounded-square (squircle) tile. The tile is a dark glass gradient from #0F1419 to #0B0F14 with a subtle inner green glow and a soft top highlight. Centered on it: the BUDDY mascot face — a translucent emerald glass-jelly blob head with a luminous green nebula core, two big glossy cute eyes with catchlights, soft coral cheek blush, and a thin antenna with a glowing green orb. Glossy, dimensional, friendly, instantly recognizable at small sizes. Fresnel mint rim light, gentle bloom on the antenna orb, soft contact shadow inside the tile. Emerald #00D97E palette, premium, clean, no text. Provide crisp silhouette legibility down to 32px.
```
**Icon states (for the dock/tray):** `idle` (green orb pulse) · `thinking` (orb bright) · `summoned` (orb yellow) · `notification` (small coral dot).

### 2.6 Iconography & motion language
- **Icons:** Lucide set, stroke `1.75`, 24px grid, accent-green in active state. Never emoji.
- **Easing:** entrances `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out); micro-interactions 150–300ms; gel character motion uses spring (stiffness ~250, damping ~22).
- **Gel laws:** squash on land, stretch on launch, jiggle settle, breathe at rest, blink every 4–7s, eyes ease toward cursor.

### 2.7 Section-by-section mockup kit (each has a ready render prompt)
For every block below, the **layout** is the build spec and the `fenced prompt` generates a hero mockup render for design review / pitch decks. All share the dark-glass + green-aurora world.

**A) Top navigation (Frost glass)** — floating pill, `top-4`, blur 12px, left: brand dot + BUDDY; center: Features · How it works · Pricing · Docs; right: green "Download free" pill.
```
A floating frosted-glass navigation bar mockup on a dark aurora background, rounded pill shape, blur and subtle white border, left side a glowing green dot beside the word BUDDY in Space Grotesk, center nav links, right a bright emerald green rounded "Download free" button, premium dark glassmorphism, #00D97E accents, ultra clean, Awwwards quality, no clutter.
```

**B) Hero** — left: scramble eyebrow "DESKTOP AI · NOW IN ALPHA", display headline "Your AI, always within reach." (word "reach." in green gradient), body, green CTA + ghost "Watch demo"; right: the huge 3D glass BUDDY floating with a speech bubble "Hey. I'm BUDDY."; dark storm-cloud + aurora scene; inline 3 feature glass cards along the bottom.
```
A next-generation SaaS hero section mockup, dark glassmorphic, on the right a large translucent emerald glass-jelly blob mascot with luminous green nebula inside, big cute eyes, coral cheeks, glowing antenna, floating in a dark sky with green aurora and soft particles, a small speech bubble saying "Hey. I'm BUDDY."; on the left a huge Space Grotesk headline "Your AI, always within reach." with the last word in a green-to-mint gradient, a dim subheadline, a bright green "Download free" button and a circular play "Watch demo" link; three frosted-glass feature cards along the bottom; emerald #00D97E palette, bloom, premium, Awwwards / FWA quality.
```

**C) Marquee strip** — thin border-bounded row, JetBrains Mono uppercase green, scrolling: ALWAYS WITHIN REACH ✦ FRONTIER INTELLIGENCE ✦ MADE OF LIGHT ✦ (repeat).
```
A thin horizontal scrolling marquee strip on near-black, uppercase monospace green text separated by small diamond glyphs reading "ALWAYS WITHIN REACH — FRONTIER INTELLIGENCE — MADE OF LIGHT", subtle top and bottom hairline borders, minimal, premium.
```

**D) Bento features grid (centerpiece)** — 4-col mixed-size glass cards with cursor-spotlight glow + 3D tilt: big "Autonomous & self-improving" hero cell, "100% local with Ollama", "Hold to talk", "Hotkey summon", "Four personalities", "Vanishes on focus". Header: "A companion that builds itself."
```
An Apple-style bento grid of frosted dark-glass cards on a near-black aurora background, mixed cell sizes, each card with a green Lucide icon in a soft green-tinted square, white Space Grotesk titles and dim body text, one large feature card reading "Autonomous & self-improving", other cards "100% local", "Hold to talk", "Hotkey summon", "Four personalities", "Vanishes on focus", a soft green radial spotlight glow following an invisible cursor on one card, subtle 3D tilt, emerald #00D97E accents, premium, Awwwards quality, section header "A companion that builds itself" with "builds itself" in green gradient.
```

**E) How it works** — left title "Three simple steps"; right: 01 Install (40MB) → 02 Shows up (in your corner) → 03 Click. Ask. Answer., connected by a green line; small BUDDY peeks at the end.
```
A clean "how it works" section mockup, dark glass, left a Space Grotesk title "Three simple steps", right three numbered steps 01 02 03 connected by a thin glowing green line, each step a short label and caption, a tiny translucent green glass blob mascot peeking at the end, minimal, premium, #00D97E accents.
```

**F) Live demo** — a realistic chat panel: user bubbles right, BUDDY streaming a real answer with a syntax-highlighted JS code block + copy button + citation pills; small BUDDY beside it; eyebrow "LIVE DEMO", title "See BUDDY in action".
```
A realistic AI chat demo panel mockup inside a dark glass card, a small translucent green glass blob mascot on the left, user message bubbles on the right, BUDDY streaming a reply with a syntax-highlighted JavaScript code block and a copy icon, small green citation pills, a streaming cursor, title "See BUDDY in action", premium dark glassmorphism, #00D97E accents, Awwwards quality.
```

**G) Pricing** — two glass cards: Alpha **Free** (no credit card, highlighted green border) · Pro **$9/mo** (coming soon, dimmed); platform row Mac · Windows · Linux.
```
A compact pricing section mockup, dark glass, two cards side by side: left "Alpha — Free, no credit card" with a glowing green border, right "Pro — $9/mo, coming soon" dimmed; to the side three platform icons Apple, Windows, Linux labeled MAC WINDOWS LINUX in green mono; minimal, premium, #00D97E accents.
```

**H) Final CTA** — eyebrow "READY WHEN YOU ARE", display "Try BUDDY today.", big green "Download for Mac" split button "Auto-detects your OS"; BUDDY glows large in the corner.
```
A final call-to-action section mockup, dark aurora background, big Space Grotesk "Try BUDDY today.", a large bright green "Download for Mac" split button with a dropdown, caption "Auto-detects your OS", a glowing translucent green glass blob mascot in the corner with an aura ring, premium, #00D97E.
```

**I) Footer** — brand dot + BUDDY, "Made of light. Built for thinking.", columns Product / Company / Connect, © 2026 BUDDY Labs, Inc., Privacy · Terms; BUDDY rests small bottom-right.
```
A clean dark footer mockup, brand dot and BUDDY wordmark, tagline "Made of light. Built for thinking.", three link columns Product / Company / Connect, copyright "© 2026 BUDDY Labs, Inc.", a small resting translucent green glass blob mascot in the bottom-right corner, minimal, premium, #00D97E accents.
```

### 2.8 Extra pages & assets (lore-forward)
- **The Lore / About page — "The Origin of Light":** long-form scroll-storytelling; the cloud-realm origin → the desktop → the autonomous awakening. Cinematic, chaptered, BUDDY narrates.
- **"BUDDY's Journal" (changelog):** the autonomous loop made public — a live feed of what BUDDY shipped to himself ("Last night I tightened my voice latency by 40ms"). Strongest proof of the differentiator.
- **Docs:** dark glass, mono accents, left nav, the blob as a tiny helper in the margin.
- **Download page:** OS auto-detect, the 3 platforms, ~40MB, requirements.
- **404:** BUDDY looking lost, "Even I can't find this one." + home CTA.
- **OG / social cards (1200×630):** blob hero left, headline right, dark aurora.
- **Email / newsletter header:** wordmark + aurora band.
```
🖼️ Lore page hero: "A cinematic full-bleed scene, a translucent green glass blob mascot small in a vast dreamy golden cloud realm dissolving into a dark starfield desktop, green aurora, volumetric god rays, an overlaid Space Grotesk chapter title 'The Origin of Light', emotional, premium, cinematic, #00D97E and warm gold accents, no clutter."
```

---

## PART 3 — THE MASTER WEBSITE BUILD PROMPT
**Paste this whole block into a coding agent** (Claude Code / Cursor) to build the highest-end version of the site, with the new next-gen 3D BUDDY. It assumes the existing BuddyOS stack but tells you to elevate everything.

```
ROLE: You are building the flagship marketing website for BUDDY — an autonomous AI desktop companion by BUDDY Labs, Inc. Target: Awwwards Site of the Day / FWA quality. Dark glassmorphic, green aurora, cinematic, fast, accessible. This is a next-generation, immersive, scroll-driven experience.

STACK: Next.js (App Router, latest) + React 19 + TypeScript strict + Tailwind v4. Animation: Framer Motion + GSAP + Lenis smooth scroll. 3D: Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing. Fonts via next/font: Space Grotesk (display), Inter (body), JetBrains Mono (mono/eyebrow).

BRAND TOKENS (CSS variables): accent #00D97E, mint #5EFFB0, pale-mint #A5FFD9, warm #FF6B35, canvas #0F1419, deep #0B0F14, surface #1A1F2E, surface-2 #232B3D, text #FFFFFF, dim #A0A8B8, faint #5B6477. Signature gradient: linear-gradient(105deg,#00D97E,#5EFFB0 45%,#A5FFD9). Glass tiers: frost (blur12), crystal (blur18), lens (green-tinted blur14).

THE HERO CHARACTER — "BUDDY", a next-generation real-time 3D model (THIS IS THE STAR; spare no detail):
- Form: a soft IRREGULAR droplet/blob, NOT a sphere — heavier bottom, domed top, asymmetric, organic. Fully squash-and-stretch rigged (breathe, jiggle, lean, ball-up, flatten-to-peek, stretch-on-jump, ripple-on-poke).
- Material: translucent emerald glass-jelly with deep subsurface scattering; glossy wet clearcoat outer skin; fresnel MINT rim light; subtle refraction + chromatic dispersion at edges. Build it with MeshPhysicalMaterial (transmission, thickness, clearcoat, iridescence) + a custom fresnel rim shader; AVOID heavy MeshTransmissionMaterial if it tanks FPS — fall back to physical material + rim.
- Interior: a slow-moving luminous green NEBULA core that breathes (pulse) and BRIGHTENS when thinking — implement with an inner emissive volume / noise-driven shader, bloom on it.
- Face: oversized glossy expressive eyes (white sclera, big black pupils, crisp catchlights, faint emerald iris glow) that TRACK THE CURSOR; soft coral cheek blush; minimal gummy mouth that can smile/talk (mouth amplitude hook for future TTS).
- Antenna: thin springy stalk + glowing orb "pilot light": green pulse=idle, bright=thinking, YELLOW flicker=summoned, dim=resting.
- Postprocessing: Bloom (on antenna + core), subtle ChromaticAberration, Vignette, soft contact shadow + caustic pool beneath.
- States/moods: idle, speaking, thinking, listening, waving, dissolving, assembling. Expose a small state machine.

SITEWIDE EXPERIENCE LAYER (already partially built — keep & elevate):
- Custom blend-mode CURSOR (dot + lagging spring ring, mix-blend-difference, grows on [data-cursor]/interactive; pointer-fine + reduced-motion guarded; hides native cursor).
- Page-wide AURORA (3 drifting radial-gradient blooms, GPU-cheap, behind everything; grain overlay to kill banding).
- Vertical SCROLL-PROGRESS rail (right edge, spring fill, accent gradient).
- KINETIC type: word-mask reveals + scramble/decode on key phrases; accent words use the gradient.

SECTIONS (in order) — every product feature must appear:
1. Nav (frost pill, floating top-4): brand dot + BUDDY · Features · How it works · Pricing · Docs · green "Download free".
2. Hero: scramble eyebrow "DESKTOP AI · NOW IN ALPHA"; display headline "Your AI, always within reach." ("reach." in gradient); sub "BUDDY lives at the edge of your screen. One click to summon. Focus makes it disappear."; green CTA "Download free →" + ghost "Watch demo"; the big 3D BUDDY on the right with a "Hey. I'm BUDDY." bubble; dark storm-cloud + aurora 3D scene (NOT bright daytime — keep text legible); 3 inline glass feature cards.
3. Marquee: ALWAYS WITHIN REACH ✦ FRONTIER INTELLIGENCE ✦ MADE OF LIGHT ✦ (mono, green).
4. Bento features (centerpiece): mixed-size glass cards with cursor-spotlight glow + 3D tilt + staggered scroll reveal — "Autonomous & self-improving" (hero cell), "100% local with Ollama", "Hold to talk", "Hotkey summon", "Four personalities", "Vanishes on focus". Header "A companion that builds itself."
5. How it works: "Three simple steps" — 01 Install (40MB) · 02 Shows up (in your corner) · 03 Click. Ask. Answer. (green connector line).
6. Live demo: real streaming chat panel (user bubbles, BUDDY streaming a reply, syntax-highlighted code block + copy + citation pills, streaming cursor). Wire to a /api/chat streaming route (Anthropic Claude) with graceful fallback to a scripted demo if no key.
7. THE AUTONOMOUS SECTION (new, make it cinematic): a horizontal-scroll or pinned-scroll "journey" telling "It builds itself" — night falls, code scrolls, PRs merge themselves, BUDDY's core brightens. Pull real lines from a "BUDDY's Journal" feed. This is the differentiator — give it the most wow.
8. Pricing: Alpha Free (no credit card, green-bordered) · Pro $9/mo (coming soon) · platform row Mac · Windows · Linux.
9. Final CTA: "Try BUDDY today." + "Download for Mac" split button "Auto-detects your OS"; BUDDY glows large.
10. Footer: brand dot + BUDDY · "Made of light. Built for thinking." · Product/Company/Connect · © 2026 BUDDY Labs, Inc. · Privacy · Terms.

BUDDY MOVEMENT ACROSS THE PAGE: a single global 3D companion canvas + a waypoint system that moves/scales BUDDY per section (huge in hero, small peripheral elsewhere, NEVER covering full-width content like the bento — tuck him into corners/whitespace). Smooth glide between waypoints, mood per section, occasional speech bubbles.

LORE PAGES: /about "The Origin of Light" (scroll-storytelling: cloud-realm origin → desktop → autonomous awakening) and /journal (the public self-improvement changelog). Dark, cinematic, chaptered.

PERFORMANCE & A11y (non-negotiable): frameloop="demand" + pause render when canvas off-screen; quality tiers (ultra/high/medium/low) auto-detected; lazy-load the 3D; respect prefers-reduced-motion (kill scroll-jacking, freeze aurora, no scramble) and prefers-reduced-transparency (solidify glass); WCAG AA contrast on all text; visible focus rings; 44px touch targets; full responsive at 375/768/1024/1440; SVG icons (Lucide) never emoji; OG/Twitter cards; semantic HTML; alt text.

DELIVER: production-quality, typed, no console noise, tsc clean. Make it feel ALIVE — the character has presence and personality; the site is a cinematic dark-glass world of light. Ship the highest-end version you can.
```

---

### Production order (recommended)
1. **Lock the look** → generate the **PFP (2.4)** + **app icon (2.5)** first; they define the 3D target.
2. **Model BUDDY** → build/commission the next-gen 3D blob to match the PFP (Spline or R3F per Part 3).
3. **Cut the trailer** → Part 1 (needs only the look + voice).
4. **Render the mockup kit** → Part 2.7–2.8 for the pitch/design review.
5. **Build the site** → Part 3 master prompt.

*Everything here inherits Part 0. If a tool ever contradicts the canon, the canon wins.*
