# Security policy

## Reporting a vulnerability

Please **do not** open public GitHub issues for security problems.

Email **security@buddy.ai** with:
- A description of the issue
- Steps to reproduce
- Your name + GitHub handle if you'd like attribution

We'll respond within 72 hours, work with you on a fix, and credit you (with your permission) when we ship a patched release.

## What's in scope

- Anything that lets an attacker read the user's Anthropic API key out of memory, disk, or the renderer process
- Anything that lets a webview exploit (e.g. XSS in chat markdown) leak conversation history or invoke OS-level commands
- Anything that lets a remote server impersonate BUDDY's update channel
- Hotkey hijacks that fire BUDDY's internal commands from outside the app

## What's out of scope

- Anyone with physical access to the user's machine
- Vulnerabilities in third-party libraries that we can't fix faster than upstream
- Reports that require disabling our security defaults (e.g. running with `--unsafe` flags) before working

## Hardening today

- API keys stored in OS keychain via the [`keyring`](https://crates.io/crates/keyring) crate, never in the renderer
- All Anthropic / ElevenLabs network calls happen from the Rust core, not the webview
- Markdown rendering uses [`react-markdown`](https://github.com/remarkjs/react-markdown) which doesn't allow inline HTML or `<script>` tags
- Tauri capabilities allow-list is conservative (see [`apps/desktop/src-tauri/capabilities/default.json`](apps/desktop/src-tauri/capabilities/default.json))

## Things on the roadmap

- Code-signing the macOS `.app` with a real Developer ID + notarization
- EV code-signing certificate for Windows installer
- Auto-update with signed manifests
- Optional Sentry crash reporting that scrubs PII at the SDK layer
