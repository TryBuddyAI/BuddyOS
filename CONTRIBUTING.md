# Contributing to BUDDY

Thanks for thinking about contributing — small project, big ambitions, real welcome to outside help.

## Where to start

| Want to | Look here |
|---|---|
| Fix a bug | [open issues](https://github.com/TryBuddyAI/buddy/issues) labelled `bug` |
| Add a feature | Open a discussion first so we can align on scope |
| Improve the 3D mascot | [`apps/desktop/src/components/Companion/BuddyModel.tsx`](apps/desktop/src/components/Companion/BuddyModel.tsx) |
| Improve the website | [`apps/site/`](apps/site/) |
| Improve the Rust core | [`apps/desktop/src-tauri/src/`](apps/desktop/src-tauri/src/) |
| Polish docs | [`docs/`](docs/) or this file |

## Dev setup

```bash
git clone https://github.com/TryBuddyAI/buddy.git
cd buddy

# Marketing site
cd apps/site && npm install && npm run dev

# Desktop app
cd apps/desktop && npm install && npm run tauri dev
```

You'll need Node 18+ and Rust stable (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).

## Branching

- `main` is always shippable.
- Feature branches off `main`: `feat/voice-input`, `fix/hotkey-collision`, `docs/architecture-update`.
- Open a PR back to `main`. Squash-merge is the default.

## Commit messages

We use a relaxed Conventional Commits style. The type is required, the scope is optional, the description is plain English.

```
feat(desktop): add hotkey rebinding from settings
fix(site): hero canvas crashes on Firefox 140
docs: clarify the demo-mode replies in README
chore(deps): bump @react-three/drei to 10.8
refactor(rust): extract chat streaming into its own module
```

## Code style

- **TypeScript:** strict mode. No `any` unless you've thought hard.
- **Imports:** absolute via `@/*` inside `apps/site`; relative inside `apps/desktop`.
- **Components:** named exports; one component per file when it gets non-trivial.
- **Comments:** explain *why*, not *what*. The code says what.
- **Rust:** `cargo fmt` before commit. No `unwrap()` in production paths — use `?` or `expect()` with a real reason.

## Testing

We're light on tests right now. If you're adding non-trivial logic, add at least one Vitest/Cargo test. Don't block on it for visual-only changes.

## What we won't merge

- Generic AI/SaaS gradients, stock 3D models, or "enhanced productivity"-style copy. See the anti-patterns list in `docs/DESKTOP_APP_BRIEF.md` §26.
- New external services without a privacy story (no telemetry-by-default, no PII).
- Anything that breaks BUDDY's voice (the 1–10 sentence rule, no filler openers, no "I'm just an AI" disclaimers).

## Code of conduct

Be kind, be specific, assume good faith. Disagreements are about code, never people.

## Questions

[Open a discussion](https://github.com/TryBuddyAI/buddy/discussions) or ping us in any open PR.
