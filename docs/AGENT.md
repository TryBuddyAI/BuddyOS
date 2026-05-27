# BUDDY's self-maintenance loop

BuddyOS is partly maintained by an autonomous Claude agent. This doc
explains exactly what that means, what the agent can and can't do, and
how to disable it.

## TL;DR

Four scheduled GitHub Actions, fully autonomous:

1. **`auto-audit`** — daily at 09:00 UTC. Scans `apps/*` for real
   bottlenecks/bugs/perf issues, opens up to 5 issues labeled
   `auto-eligible`.
2. **`auto-design`** — daily at 08:00 UTC. Audits the visual + UX +
   branding + copywriting quality of both `apps/site` and
   `apps/desktop` against best-in-class references (Linear, Raycast,
   Arc, Stripe, Vercel) and opens up to 3 issues labeled
   `auto-eligible,design`.
3. **`auto-improve`** — runs **every 10 minutes**. Picks the freshest
   open `auto-eligible` issue (code or design), implements the
   smallest fix, verifies it compiles, opens a PR.
4. **`auto-merge-yellow`** — runs every 15 minutes. For tier-yellow
   PRs older than 60 minutes with CI still green and no human
   change-requests, enables auto-merge.

PR auto-merge policy:
- **`tier-green`** → instant auto-merge once CI passes
- **`tier-yellow`** → auto-merge after a 60-minute cooloff (gives a
  human time to walk in and block)
- **`tier-red`** → opens as a draft, never auto-merges

## What the agent can change

| Label | Examples | Auto-merge? |
|---|---|---|
| `tier-green` | typo fixes, lint autofixes, dead code removal, comment clarifications, patch-level dep bumps, doc rewrites, test additions, type-annotation tightening, single-component spacing fixes, contrast tweaks, missing focus rings | instant if CI green |
| `tier-yellow` | small refactors, new utility functions, error-handling improvements, minor UX polish, section-scope design polish (hero, pricing, settings panel), hover/loading states, type-scale normalization | yes — 60-min cooloff + CI green + no change-requests |
| `tier-red` | new features, dep additions, breaking changes, anything in `chat.rs` / `lib.rs` / `keychain.rs`, schema migrations, full layout redesigns, mascot/font swaps, nav restructures | no — draft only |

The complete policy lives in [`.github/agent/policy.md`](../.github/agent/policy.md).

## What the agent can NOT change

By policy, the agent must escalate to `tier-red` (and therefore cannot
auto-merge) for any change touching:

- The Claude system prompt or model name in `chat.rs`
- `keychain.rs` or anything handling user credentials
- `tauri.conf.json` permissions, capabilities, or bundle config
- Tauri plugin additions or removals
- The persisted-state shape in `store.ts`
- The mascot geometry or shaders in any non-trivial way

And by CODEOWNERS, the agent literally cannot merge changes to:

- `.github/agent/*` (its own prompts and policy)
- `.github/workflows/auto-*` (its own workflows)
- `.github/CODEOWNERS`
- `LICENSE` and `SECURITY.md`

## Hard limits per run

From `policy.md`:

- ≤ 250 lines changed across ≤ 8 files
- ≤ 1 PR per run
- Must pass `tsc --noEmit` for both `apps/desktop` and `apps/site`
- Must pass `cargo check` for `apps/desktop/src-tauri`
- No new top-level dependencies in `tier-green`
- No force-pushes, no deletions outside `dist/`/`node_modules/`/explicit dead-code lists

## Kill switch

To pause all agent activity instantly:

```bash
echo "Paused $(date -u)" > .github/agent/PAUSED
git add .github/agent/PAUSED
git commit -m "agent: pause auto-loop"
git push
```

Both workflows check for that file as their first step and exit
immediately if it exists. Delete the file to re-enable.

You can also disable a specific workflow from the Actions tab in GitHub.

## Cost

At the current 10-minute cadence:

- **Auditor** (daily): ~$2–3 per run → **~$60–90/month**
- **Design critic** (daily): ~$2–3 per run → **~$60–90/month**
- **Improver** (10-min): ~$0.05 per no-work run, ~$0.50–2 per
  substantive run. 144 runs/day × mostly idle = ~$7/day floor +
  ~$30/day when queue has work → **~$200–1000/month**
- **Yellow-merge sweeper** (15-min): no Claude tokens, just gh CLI
  → **~$0/month**

Realistic monthly range: **~$300/month idle, ~$1,000–1,200 at full
tilt** with a steady stream of issues.

If costs spike, you have three knobs:

```bash
# 1. Slow the improver to 15-min cadence — half the spend
sed -i '' 's|cron: "\*/10 \* \* \* \*"|cron: "*/15 * * * *"|' .github/workflows/auto-improve.yml

# 2. Slow it to 30-min — original cost (~$60-150/mo)
sed -i '' 's|cron: "\*/10 \* \* \* \*"|cron: "*/30 * * * *"|' .github/workflows/auto-improve.yml

# 3. Pause entirely (kill switch — see below)
```

## Observability

Every run leaves a trail:

- GitHub Actions logs (Settings → Actions → "BUDDY · auto-improve")
- Each PR has a `tier:*` label and links back to the originating issue
- Commit author is `buddy-bot[bot]` so it's easy to filter
- The agent comments on issues it couldn't resolve

## Failure modes the agent handles

- **No eligible issue** → exits 0 cheaply
- **Verification fails** → comments on the issue, exits 0
- **Issue premise wrong** → adds `needs-clarification` label, exits 0
- **Rate limit** → exits cleanly, retries next cycle

## Failure modes that need YOU

- The agent ships consistently low-quality refactors → tighten
  `policy.md` or drop the cadence
- Issues queue up faster than they get fixed → raise the cadence or
  bulk-close stale ones
- An agent PR slips through and breaks `main` → revert via `gh pr revert`
  and add a regression test; consider tightening the tier rules
- The agent loops on the same issue → close the issue manually with
  reason, add the issue title to a "do not touch" list in `policy.md`

## How to participate

This is a normal GitHub repo. Open issues. Open PRs. The agent reads
the same labels you do — if you tag your own issue `auto-eligible` and
`tier-green`, the agent will pick it up on its next cycle.

To explicitly opt an issue OUT of the agent loop: don't label it
`auto-eligible`, OR add the label `human-only`.

---

The whole point is that the loop is open and inspectable. Every prompt,
every policy line, every workflow is in this repo. You can audit the
agent the same way the agent audits BUDDY.
