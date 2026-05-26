"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Trash2,
  KeyRound,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  defaultHotkeyLabel,
  hasApiKey,
  registerHotkey,
  setApiKey,
  quitApp,
  clearApiKey,
} from "../../lib/ipc";
import { useApp, type Personality } from "../../lib/store";
import { HotkeyCapture } from "../Onboarding/HotkeyCapture";

type Tier = "ultra" | "high" | "medium" | "low";

const PERSONALITIES: { value: Personality; label: string; hint: string }[] = [
  { value: "default", label: "Default", hint: "Confident, dry humor, 1–10 sentences" },
  { value: "brief", label: "Brief", hint: "Cap at 3 sentences. No padding." },
  { value: "tutor", label: "Tutor", hint: "Patient, explains the why. 4–7 sentences." },
  { value: "friend", label: "Friend", hint: "Casual, warmer, occasional riff" },
];
const TIERS: { value: Tier; label: string; hint: string }[] = [
  { value: "ultra", label: "Ultra", hint: "Max poly count + bloom + sparkles" },
  { value: "high", label: "High", hint: "Default — looks great on M-series" },
  { value: "medium", label: "Medium", hint: "Drop sparkles + halve segments" },
  { value: "low", label: "Low", hint: "Minimal — old laptops + battery saver" },
];

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
  const qualityTier = useApp((s) => s.qualityTier);
  const setQualityTier = useApp((s) => s.setQualityTier);
  const voiceEnabled = useApp((s) => s.voiceEnabled);
  const setVoiceEnabled = useApp((s) => s.setVoiceEnabled);
  const personality = useApp((s) => s.personality);
  const setPersonality = useApp((s) => s.setPersonality);
  const newSession = useApp((s) => s.newSession);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const messageCount = useApp((s) => s.messages.length);
  const historyCount = useApp((s) => s.history.length);

  const [defaultCombo, setDefaultCombo] = useState("");
  const [combo, setCombo] = useState("");
  const [comboError, setComboError] = useState<string | null>(null);
  const [keyPresent, setKeyPresent] = useState(false);
  const [apiKey, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState(false);
  const [confirmHistoryWipe, setConfirmHistoryWipe] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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

  const removeKey = async () => {
    setRemovingKey(true);
    setSavedMsg(null);
    try {
      await clearApiKey("anthropic");
      setKeyPresent(false);
      setSavedMsg("Key removed");
    } catch (e) {
      setSavedMsg(String(e));
    } finally {
      setRemovingKey(false);
    }
  };

  const wipeHistory = () => {
    // Two-step confirmation so a stray click can't delete everything.
    if (!confirmHistoryWipe) {
      setConfirmHistoryWipe(true);
      setTimeout(() => setConfirmHistoryWipe(false), 4000);
      return;
    }
    // Wipe current session AND archived ones by resetting the store fields.
    useApp.setState({ messages: [], history: [] });
    newSession();
    setConfirmHistoryWipe(false);
    setSavedMsg("History wiped");
  };

  const resetOnboarding = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setOnboarded(false);
    setSettingsOpen(false);
    // App.tsx renders OnboardingWindow when hasOnboarded becomes false.
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

      <div className="no-drag flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* HOTKEY */}
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

        {/* ACCOUNT */}
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
            <p className="mt-2 text-[12px] text-[var(--accent)]">{savedMsg}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="focus-ring text-[12px] text-[var(--text-dim)] underline-offset-2 hover:text-white hover:underline"
            >
              {demoMode ? "Disable demo mode" : "Force demo mode"}
            </button>
            {keyPresent && (
              <button
                onClick={removeKey}
                disabled={removingKey}
                className="focus-ring inline-flex items-center gap-1 text-[12px] text-[var(--accent-warm)] underline-offset-2 hover:underline disabled:opacity-50"
              >
                <KeyRound size={11} />
                {removingKey ? "Removing…" : "Remove API key"}
              </button>
            )}
          </div>
        </section>

        {/* PERSONALITY */}
        <section>
          <p className="eyebrow">PERSONALITY</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            How BUDDY phrases himself. The 1–10 sentence rule applies in all
            modes.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PERSONALITIES.map(({ value, label, hint }) => {
              const active = personality === value;
              return (
                <button
                  key={value}
                  onClick={() => setPersonality(value)}
                  className={
                    "focus-ring flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors " +
                    (active
                      ? "border-[var(--accent)] bg-[rgba(0,217,126,0.08)]"
                      : "border-white/[0.08] hover:border-white/20")
                  }
                >
                  <span className="text-[13px] font-semibold text-white">
                    {label}
                  </span>
                  <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
                    {hint}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* VOICE */}
        <section>
          <p className="eyebrow">VOICE</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            Have BUDDY read his answers aloud. Uses your OS's built-in voice;
            higher-quality ElevenLabs lands in a follow-up.
          </p>
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              // Stop mid-sentence if we just turned it off.
              if (voiceEnabled && typeof window !== "undefined") {
                window.speechSynthesis?.cancel();
              }
            }}
            className={
              "focus-ring mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors " +
              (voiceEnabled
                ? "bg-[rgba(0,217,126,0.12)] text-[var(--accent)]"
                : "border border-white/10 text-[var(--text-dim)] hover:bg-white/5")
            }
          >
            {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            {voiceEnabled ? "Speak responses (on)" : "Speak responses (off)"}
          </button>
        </section>

        {/* QUALITY */}
        <section>
          <p className="eyebrow">QUALITY</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            BUDDY's mascot is procedural — drop the tier on weaker hardware
            or to save battery.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TIERS.map(({ value, label, hint }) => {
              const active = qualityTier === value;
              return (
                <button
                  key={value}
                  onClick={() => setQualityTier(value)}
                  className={
                    "focus-ring flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors " +
                    (active
                      ? "border-[var(--accent)] bg-[rgba(0,217,126,0.08)]"
                      : "border-white/[0.08] hover:border-white/20")
                  }
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                    {active && <Sparkles size={11} className="text-[var(--accent)]" />}
                    {label}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
                    {hint}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* DATA */}
        <section>
          <p className="eyebrow">DATA</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-dim)]">
            {messageCount} message{messageCount === 1 ? "" : "s"} in this
            session, {historyCount} archived session
            {historyCount === 1 ? "" : "s"}. All stored locally.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={wipeHistory}
              className={
                "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] " +
                (confirmHistoryWipe
                  ? "bg-[var(--accent-warm)] text-white"
                  : "border border-white/10 text-[var(--text-dim)] hover:bg-white/5")
              }
            >
              <Trash2 size={11} />
              {confirmHistoryWipe ? "Click again to confirm" : "Wipe history"}
            </button>
            <button
              onClick={resetOnboarding}
              className={
                "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] " +
                (confirmReset
                  ? "bg-[var(--accent-warm)] text-white"
                  : "border border-white/10 text-[var(--text-dim)] hover:bg-white/5")
              }
            >
              <RefreshCw size={11} />
              {confirmReset ? "Click again to confirm" : "Reset onboarding"}
            </button>
          </div>
        </section>

        {/* ABOUT */}
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
