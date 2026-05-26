import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { SummonWindow } from "./windows/Summon";
import { OnboardingWindow } from "./windows/Onboarding";
import { useApp } from "./lib/store";
import { completeOnboarding, hasApiKey } from "./lib/ipc";

/**
 * Single-window router. We use one Tauri window for the whole app:
 *  - Until the user finishes onboarding → render the onboarding flow with
 *    an opaque dark background.
 *  - After "Start BUDDY" → render the floating summon view with a fully
 *    transparent background, only BUDDY + input pill visible. The window
 *    has already shrunk + hidden itself by then.
 */
export default function App() {
  const hasOnboarded = useApp((s) => s.hasOnboarded);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate persisted state. If they already onboarded in a previous run,
  // skip straight to overlay mode (shrink + hide the window).
  useEffect(() => {
    (async () => {
      await useApp.persist?.rehydrate?.();
      try {
        const has = await hasApiKey("anthropic");
        if (has && !useApp.getState().hasOnboarded) {
          setOnboarded(true);
        }
      } catch {
        // ignore — Rust may not be ready yet
      }
      if (useApp.getState().hasOnboarded) {
        // Already onboarded — collapse the window to overlay size and hide.
        try {
          await completeOnboarding();
        } catch {
          // ignore
        }
      }
      setHydrated(true);
    })();
  }, [setOnboarded]);

  // Tray's "Settings" emits this event — open the inline panel.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("open-settings", () => {
      useApp.getState().setSettingsOpen(true);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, []);

  if (!hydrated) return null;
  return hasOnboarded ? <SummonWindow /> : <OnboardingWindow />;
}
