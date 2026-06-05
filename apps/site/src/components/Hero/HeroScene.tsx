"use client";

import { Canvas } from "@react-three/fiber";
import { Cloud, Clouds, Stars } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function DustParticles({ count = 180 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = (() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions, speeds };
  })();

  useFrame(() => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -6;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#FFFFFF"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function DriftingClouds() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });
  return (
    <group ref={ref}>
      <Clouds material={THREE.MeshLambertMaterial} limit={400} range={100}>
        <Cloud
          seed={1}
          segments={32}
          bounds={[8, 2, 2]}
          volume={6}
          color="#16202B"
          position={[0, 2, -3]}
        />
        <Cloud
          seed={2}
          segments={32}
          bounds={[6, 2, 2]}
          volume={5}
          color="#0F2A22"
          position={[-4, 1, -2]}
        />
        <Cloud
          seed={3}
          segments={32}
          bounds={[7, 2, 2]}
          volume={6}
          color="#121A24"
          position={[5, 0.5, -4]}
        />
        <Cloud
          seed={4}
          segments={32}
          bounds={[5, 1.5, 2]}
          volume={4}
          color="#1B2733"
          position={[-2, 3, -5]}
        />
        <Cloud
          seed={5}
          segments={32}
          bounds={[6, 1.5, 2]}
          volume={5}
          color="#0E241D"
          position={[3, 2.5, -6]}
        />
      </Clouds>
    </group>
  );
}

export function HeroScene() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      camera={{ fov: 50, position: [0, 1.5, 8], near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        // Dark, deep atmosphere — let the canvas color own the scene so the
        // glassmorphic text stays legible and BUDDY's green glow pops.
        scene.background = new THREE.Color("#0B0F14");
        scene.fog = new THREE.Fog("#0B0F14", 7, 24);
        // Signal the loading gate that the WebGL canvas is alive.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("buddy-canvas-ready"));
        }
      }}
    >
      {/* Dim, cool ambient so the clouds read as dark storm forms. */}
      <hemisphereLight args={["#1A2A3A", "#05080C", 0.5]} />
      <directionalLight
        color="#5EFFB0"
        intensity={0.5}
        position={[5, 10, 5]}
      />
      {/* Brand-green key light rims BUDDY + the cloud undersides. */}
      <pointLight color="#00D97E" intensity={1.1} position={[-3, 2, 3]} />
      <pointLight color="#00D97E" intensity={0.5} position={[4, -1, 2]} />

      <Stars radius={40} depth={30} count={1800} factor={3.4} saturation={0} fade speed={0.4} />

      <Suspense fallback={null}>
        <DriftingClouds />
      </Suspense>

      {!reduced && <DustParticles count={160} />}

      <EffectComposer>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0005, 0.0005)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
