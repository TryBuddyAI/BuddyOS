"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { BuddyModel } from "./BuddyModel";
import { useVisibility } from "../../lib/useVisibility";

type Props = {
  /** Base scale of BUDDY relative to the canvas. */
  scale?: number;
};

/**
 * Switches r3f's frameloop based on Tauri window visibility. When the window
 * is hidden we stop rendering entirely (frameloop="never") — drops idle GPU
 * usage to ~0 while BUDDY waits in the tray.
 */
function RenderLoopGate({ visible }: { visible: boolean }) {
  const set = useThree((s) => s.set);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    set({ frameloop: visible ? "always" : "never" });
    if (visible) invalidate();
    // Publish a global flag so BuddyModel's useFrame can short-circuit
    // expensive math the moment we go hidden (between the last visible
    // frame and the frameloop="never" actually applying).
    (window as unknown as { __BUDDY_VISIBLE__?: boolean }).__BUDDY_VISIBLE__ =
      visible;
  }, [visible, set, invalidate]);
  return null;
}

export function CompanionStage({ scale = 1.7 }: Props) {
  const visible = useVisibility();
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        // Start in `always` so the assembly animation plays on first paint.
        // RenderLoopGate flips this dynamically below.
        frameloop="always"
        camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <RenderLoopGate visible={visible} />
        <hemisphereLight args={["#B8D4FF", "#FFC18C", 0.7]} />
        <directionalLight color="#FFE8C4" intensity={1.0} position={[3, 4, 5]} />
        <pointLight color="#00D97E" intensity={0.45} position={[-2, 1, 3]} />
        <Suspense fallback={null}>
          <Environment preset="sunset" background={false} />
        </Suspense>
        <BuddyModel cursorTracking baseScale={scale} />
      </Canvas>
    </div>
  );
}
