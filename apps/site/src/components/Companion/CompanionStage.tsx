"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useCompanion } from "@/lib/companionStore";
import { viewportToWorld, detectWebGL } from "@/lib/viewport";
import { BuddyModel } from "@/components/Hero/BuddyModel";

function CompanionBuddy() {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const targetAnchor = useCompanion((s) => s.targetAnchor);
  const targetScale = useCompanion((s) => s.targetScale);
  const movementMode = useCompanion((s) => s.movementMode);
  const visible = useCompanion((s) => s.visible);

  const lerpFactorRef = useRef(0.08);

  useEffect(() => {
    // Teleport is snappier than glide
    lerpFactorRef.current = movementMode === "teleport" ? 0.2 : 0.08;
  }, [movementMode]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = viewportToWorld(targetAnchor, size.width, size.height);
    const lerp = lerpFactorRef.current;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      target.x,
      lerp,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      target.y,
      lerp,
    );

    const cs = groupRef.current.scale.x;
    const ns = THREE.MathUtils.lerp(cs, targetScale, lerp);
    groupRef.current.scale.setScalar(ns);

    groupRef.current.visible = visible;

    // Project back to anchor for the speech bubble layer
    const fovRad = (35 * Math.PI) / 180;
    const distance = 8;
    const heightAtZ = 2 * Math.tan(fovRad / 2) * distance;
    const aspect = size.width / Math.max(size.height, 1);
    const widthAtZ = heightAtZ * aspect;
    const ax = (groupRef.current.position.x / (widthAtZ / 2) + 1) / 2;
    const ay = (-groupRef.current.position.y / (heightAtZ / 2) + 1) / 2;
    useCompanion.getState().setAnchor({ x: ax, y: ay });
    useCompanion.getState().setScale(ns);

    // Settle detection
    const dx = Math.abs(groupRef.current.position.x - target.x);
    const dy = Math.abs(groupRef.current.position.y - target.y);
    const ds = Math.abs(ns - targetScale);
    if (
      dx < 0.002 &&
      dy < 0.002 &&
      ds < 0.002 &&
      useCompanion.getState().isTransitioning
    ) {
      useCompanion.getState().setTransitioning(false);
    }
  });

  return (
    <group ref={groupRef}>
      <BuddyModel cursorTracking baseScale={1} />
    </group>
  );
}

export function CompanionStage() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time WebGL capability probe after mount (SSR-safe)
    setSupported(detectWebGL());
  }, []);

  if (supported === false) return null;
  if (supported === null) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
      style={{ contain: "strict" }}
    >
      <Canvas
        camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {/* Cool, brand-aligned key/fill so the glass reads emerald, not warm. */}
        <hemisphereLight args={["#2A3A4A", "#05080C", 0.6]} />
        <directionalLight
          color="#CFFFE9"
          intensity={0.9}
          position={[3, 4, 5]}
        />
        <pointLight color="#00D97E" intensity={0.7} position={[-2, 1, 3]} />
        <pointLight color="#5EFFB0" intensity={0.4} position={[3, -1, 2]} />
        {/* Procedural green "studio" environment — gives the glass clean,
            on-brand reflections with no CDN HDR dependency. Renders once. */}
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1}>
            <color attach="background" args={["#05080C"]} />
            <Lightformer
              intensity={2.2}
              color="#A5FFD9"
              position={[0, 2.5, 4]}
              scale={[7, 7, 1]}
            />
            <Lightformer
              intensity={1.4}
              color="#00D97E"
              position={[-4, 0, 2]}
              scale={[4, 9, 1]}
            />
            <Lightformer
              intensity={1.1}
              color="#FFFFFF"
              position={[3.5, 1.5, 3]}
              scale={[2.5, 2.5, 1]}
            />
            <Lightformer
              intensity={0.8}
              color="#00D97E"
              position={[0, -3, 2]}
              scale={[9, 3, 1]}
            />
          </Environment>
        </Suspense>
        <CompanionBuddy />
      </Canvas>
    </div>
  );
}
