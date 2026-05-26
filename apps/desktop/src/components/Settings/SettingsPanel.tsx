"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import {
  defaultHotkeyLabel,
  hasApiKey,
  registerHotkey,
  setApiKey,
  quitApp,
} from "../../lib/ipc";
import { useApp } from "../../lib/store";
import { HotkeyCapture } from "../Onboarding/HotkeyCapture";

/**
 * Inline settings panel — slides over the summon view inside the same window.
 * No separate window is opened.
 */
export function SettingsPanel() {
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);
  const setStoreHotkey = useApp((s) => s.setHotkey);
  const setDemoMode = useApp((s) => s.setDemoMode);
  const storeHotkey = useApp((s) => s.hotkey);
  const demoMode = useApp((s) => s.demoMode);

  const [defaultCombo, setDefaultCombo] = useState("");
  const [combo, setCombo] = useState("");
  const [comboError, setComboError] = useState<string | null>(null);
  const [keyPresent, setKeyPresent] = useState(false);
  const [apiKey, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    defaultHotkeyLabel().then((label) => {
      setDefaultCombo(label);
      setCombo(storeHotkey || label);
    });
    hasApiKey("anthropic").then(setKeyPresent);
  }, [storeHotkey]);

  const applyHotkey = async (next: string) => {
    setCombo(next);
    setComboError(null);
    try {
      await registerHotkey(next);
      setStoreHotkey(next);
    } catch (e) {
      setComboError(String(e));
    }
  };

  const saveKey = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      await setApiKey("anthropic", apiKey.trim());
      setApiKeyInput("");
      setSavedMsg("Saved");
      setDemoMode(false);
      setKeyPresent(true);
    } catch (e) {
      setSavedMsg(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-crystal absolute inset-3 z-30 flex flex-col overflow-hidden rounded-2xl bg-[var(--canvas)]/95">
      <div className="drag-region flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <button
          onClick={() => setSettingsOpen(false)}
          className="focus-ring no-drag inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] text-[var(--text-dim)] hover:text-white"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="mono text-[10px] tracking-[0.3em] text-[var(--text-faint)]">
          SETTINGS
        </span>
        <span className="w-10" />
      </div>

      <div className="no-drag flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section>
          <p className="eyebrow">HOTKEY</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            Click and press your new combo to rebind.
          </p>
          <div className="mt-3 flex flex-col items-start gap-2">
            <HotkeyCapture
              value={combo || defaultCombo}
              onChange={applyHotkey}
            />
            {comboError && (
              <p className="text-[12px] text-[var(--accent-warm)]">
                {comboError}
              </p>
            )}
          </div>
        </section>

        <section>
          <p className="eyebrow">ACCOUNT</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            {keyPresent
              ? demoMode
                ? "Demo mode is active. Save a key to switch to live."
                : "Anthropic key connected (OS keychain)."
              : "No key set. BUDDY is in demo mode."}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              placeholder="sk-ant-…"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="glass-frost focus-ring h-9 flex-1 rounded-full bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-[var(--text-faint)]"
            />
            <button
              disabled={saving || !apiKey.trim()}
              onClick={saveKey}
              className="focus-ring rounded-full bg-[var(--accent)] px-3 text-[12px] font-semibold text-[var(--canvas)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : keyPresent ? "Replace" : "Save"}
            </button>
          </div>
          {savedMsg && (
            <p className="mt-2 text-[12px] text-[var(--accent)]">
              {savedMsg}
            </p>
          )}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="focus-ring mt-3 text-[12px] text-[var(--text-dim)] underline-offset-2 hover:text-white hover:underline"
          >
            {demoMode ? "Disable demo mode" : "Force demo mode"}
          </button>
        </section>

        <section>
          <p className="eyebrow">ABOUT</p>
          <p className="mt-1 text-[12.5px] leading-[1.6] text-[var(--text-dim)]">
            BUDDY v0.1 — desktop AI companion.
            <br />
            Made of light. Built for thinking.
          </p>
        </section>

        <section className="pt-2">
          <button
            onClick={quitApp}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-[var(--accent-warm)] hover:bg-white/5"
          >
            <LogOut size={12} />
            Quit BUDDY
          </button>
        </section>
      </div>
    </div>
  );
}
