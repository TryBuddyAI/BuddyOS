# BUDDY's self-maintenance loop

BuddyOS is partly maintained by an autonomous Claude agent. This doc
explains exactly what that means, what the agent can and can't do, and
how to disable it.

## TL;DR

Two scheduled GitHub Actions:

1. **`auto-audit`** — runs every Monday at 09:00 UTC. A Claude agent reads
   the codebase, finds up to 5 real bottlenecks, and opens GitHub issues
   labeled `auto-eligible`.
2. **`auto-improve`** — runs every 30 minutes. A second Claude agent
   picks the highest-priority open `auto-eligible` issue, implements the
   smallest possible fix, verifies it compiles, and opens a PR.

PRs labeled `tier-green` auto-merge if CI passes. `tier-yellow` waits for
a human reviewer. `tier-red` opens as a draft and never auto-merges.

## What the agent can change

| Label | Examples | Auto-merge? |
|---|---|---|
| `tier-green` | typo fixes, lint autofixes, dead code removal, comment clarifications, patch-level dep bumps, doc rewrites, test additions, type-annotation tightening | yes if CI green |
| `tier-yellow` | small refactors, new utility functions, error-handling improvements, minor UX polish | no — review required |
| `tier-red` | new features, dep additions, breaking changes, anything in `chat.rs` / `lib.rs` / `keychain.rs`, schema migrations, UX redesigns | no — draft only |

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

- Audit: ~$1–3 per weekly run.
- Improver: ~$0.05 per no-work run, ~$0.50–2 per substantive run.
- 30-minute cadence × 48 runs/day, with most idle, lands in
  **~$60–150/month** in token spend when the queue has work.

If costs spike, raise the cadence (cron `0 */1 * * *` = hourly) or pause
the loop entirely.

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
