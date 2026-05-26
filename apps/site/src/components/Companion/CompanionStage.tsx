"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
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
        <hemisphereLight args={["#B8D4FF", "#FFC18C", 0.7]} />
        <directionalLight
          color="#FFE8C4"
          intensity={1.0}
          position={[3, 4, 5]}
        />
        <pointLight color="#00D97E" intensity={0.45} position={[-2, 1, 3]} />
        <Suspense fallback={null}>
          <Environment preset="sunset" background={false} />
        </Suspense>
        <CompanionBuddy />
      </Canvas>
    </div>
  );
}
