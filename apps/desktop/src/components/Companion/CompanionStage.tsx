"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { BuddyModel } from "./BuddyModel";

type Props = {
  /** Base scale of BUDDY relative to the canvas. */
  scale?: number;
};

export function CompanionStage({ scale = 1.7 }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
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
