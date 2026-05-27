# BUDDY Agent Policy

Shared rules for both the auditor and the improver. These constraints exist
so that a misbehaving run can't damage the codebase or burn through tokens.

## Tier system

Every auto-generated PR gets exactly one tier label.

| Label | What it covers | Auto-merge? |
|---|---|---|
| `tier-green` | typo fixes, comment clarifications, doc rewrites, dep version bumps (patch only), lint/format autofixes, dead code removal, type-annotation tightening, test additions, README polish | YES — instantly if CI passes |
| `tier-yellow` | small refactors, new utility functions, error-handling improvements, performance tweaks with measurable wins, new test scaffolding, minor UX polish, design tweaks at component scope | YES — after a **60-minute cooloff** with CI still green and no human change-requests |
| `tier-red` | new features, dependency additions, breaking changes, security-adjacent code, license/auth changes, UX redesigns, schema migrations, anything touching `src-tauri/src/lib.rs` or chat.rs core | NO — opens as DRAFT, never auto-merge |

When in doubt, escalate one tier.

## Hard limits (any violation aborts the run)

- **Diff size**: ≤ 250 lines changed across ≤ 8 files.
- **No new top-level dependencies** in tier-green. tier-yellow may add ONE
  dev-dep with strong justification.
- **No file deletions** except in `node_modules/`, `dist/`, or files
  explicitly listed in the open issue as dead code.
- **No edits** to `.github/agent/*`, `.github/workflows/auto-*`,
  `CODEOWNERS`, `LICENSE`, or `SECURITY.md`. The agent does not modify
  its own governance.
- **No secrets** read or written outside the GitHub Actions secret context.
- **Single PR per run.** Never open more than one PR.
- **Never force-push** to `main` or any branch starting with `release/`.

## What "verification" means

Before opening a PR, the agent MUST:

1. Run `cd apps/desktop && npx tsc --noEmit` — exit 0
2. Run `cd apps/desktop/src-tauri && cargo check` — exit 0 (warnings OK)
3. Run `cd apps/site && npx tsc --noEmit` — exit 0
4. If `package.json` was touched, run `npm install` and ensure no lockfile churn beyond the intended change.

If any check fails, the agent fixes it OR abandons the run with a clear
"could not verify" comment on the originating issue.

## Issue selection (improver)

Pick from open issues with label `auto-eligible` in this priority order:

1. `tier-green` + most recent (LIFO so fresh ideas land fast)
2. `tier-yellow` + most recent
3. Issues labeled `design` get the same tier treatment as everything else
   — there is no separate design queue. Pick whichever tier-green/yellow
   issue is freshest, design or otherwise.
4. Skip `tier-red` entirely — those require a human author.

If no eligible issue exists, exit cleanly with `echo "no work" && exit 0`.
A no-work run should consume < 5,000 tokens (read the issue list, decide,
exit).

The improver runs every 10 minutes; the auditor and design critic run
daily. Idle runs are expected and cheap.

## Commit + PR shape

- Branch: `buddy/auto/<short-issue-slug>-<run-number>`
- Commit message: imperative, 1-line subject ≤ 72 chars, optional body
- PR title: same as commit subject
- PR body MUST include:
  - `Closes #<issue>`
  - 3-line plain-English summary
  - "Verified with: tsc + cargo check"
  - Tier label call-out
- Apply the matching `tier:*` label via `gh pr edit --add-label`

## When to escalate to red

Always escalate if the change:
- Modifies the system prompt, model name, or API call shape in `chat.rs`
- Touches `keychain.rs` or anything that handles user credentials
- Changes `tauri.conf.json` `permissions`, `capabilities`, or `bundle.macOS`
- Adds or removes a Tauri plugin
- Changes the schema of `store.ts` (persisted shape)
- Touches the BUDDY mascot geometry / shaders in a non-trivial way

## Kill switch

If the file `.github/agent/PAUSED` exists, BOTH workflows exit immediately
without doing any work. Create it to disable the loop; delete it to
re-enable.
