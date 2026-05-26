# apps/site — buddy.ai

The marketing website. Hero with the live 3D BUDDY mascot, features grid, how-it-works, live chat demo (streams real Claude responses), pricing, footer.

Part of the [BUDDY monorepo](../../README.md).

## Run

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
# → http://localhost:3000
```

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript strict
- **Tailwind v4** (CSS-based config)
- **three.js + @react-three/fiber + @react-three/drei** for the hero scene
- **motion** for transitions
- **@anthropic-ai/sdk** streaming for `/api/chat`

## Layout

```
src/
  app/
    layout.tsx        Fonts, metadata, global providers, LoadingGate
    page.tsx          Section composition
    globals.css       Design tokens + glass utility classes
    api/chat/route.ts Anthropic streaming proxy (server-side)
  components/
    Hero/             Hero scene, BUDDY model, intro CTAs
    Sections/         Features, HowItWorks, ChatDemo, Pricing, FinalCta
    Companion/        Global CompanionStage (BUDDY follows scroll)
    Chat/             Floating chat dock + panel
    Layout/           Nav, Footer, SmoothScroll, Marquee, LoadingGate
    UI/               MagneticButton, helpers
  lib/
    companionStore.ts Zustand store
    waypoints.ts      Scroll-progress → BUDDY position
    viewport.ts       Quality tier detection
    chatClient.ts     Client-side streaming consumption
```

## Deploy

Made for Vercel. Push to `main` of [TryBuddyAI/BuddyOS](https://github.com/TryBuddyAI/BuddyOS), connect the repo in Vercel with `apps/site` as the project root, set `ANTHROPIC_API_KEY` in env vars, ship.

## Anti-patterns to avoid

See the [full project brief](../../docs/DESKTOP_APP_BRIEF.md). Same brand rules apply here: no purple/pink generic gradients, no stock 3D models, no "amazing"/"powerful" filler. Restraint is the brand.
