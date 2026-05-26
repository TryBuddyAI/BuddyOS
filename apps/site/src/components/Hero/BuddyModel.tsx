"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMood, useQualityTier } from "@/lib/companionStore";

type BuddyModelProps = {
  /** When true, the model tracks the global cursor; off for the chat dock mini-buddy. */
  cursorTracking?: boolean;
  /** Multiplier on the procedural scale. */
  baseScale?: number;
};

/**
 * Custom rim Fresnel material — gives BUDDY a soft mint halo on his
 * silhouette without the cost of MeshTransmissionMaterial (which renders the
 * whole scene multiple times per frame and is the main source of lag).
 */
const RIM_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const RIM_FRAG = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
uniform vec3 uColor;
uniform float uIntensity;
void main() {
  float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
  fresnel = pow(fresnel, 2.5);
  gl_FragColor = vec4(uColor, fresnel * uIntensity);
}
`;

export function BuddyModel({
  cursorTracking = true,
  baseScale = 1,
}: BuddyModelProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const antennaGroup = useRef<THREE.Group>(null);
  const antennaTip = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const { viewport, mouse } = useThree();
  const tier = useQualityTier();
  const mood = useMood();

  // Blink scheduler
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = 3000 + Math.random() * 4000;
      timer = setTimeout(() => {
        if (cancelled) return;
        const twice = Math.random() < 0.2;
        blinkOnce();
        if (twice) {
          setTimeout(blinkOnce, 220);
        }
        schedule();
      }, delay);
    };

    const blinkOnce = () => {
      if (!eyeL.current || !eyeR.current) return;
      eyeL.current.scale.y = 0.05;
      eyeR.current.scale.y = 0.05;
      setTimeout(() => {
        if (eyeL.current) eyeL.current.scale.y = 1;
        if (eyeR.current) eyeR.current.scale.y = 1;
      }, 110);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const mouthShape = useMemo(() => {
    const s = new THREE.Shape();
    const width = 0.18;
    const depth = 0.08;
    s.moveTo(-width, 0);
    s.quadraticCurveTo(0, -depth, width, 0);
    s.quadraticCurveTo(0, -depth + 0.012, -width, 0);
    return s;
  }, []);

  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#A5FFD9") },
      uIntensity: { value: 1.6 },
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current && mood !== "dissolving" && mood !== "assembling") {
      const bob = Math.sin(t * 1.2) * 0.04;
      const breath = 1 + Math.sin(t * 0.8) * 0.018;
      group.current.position.y = bob;
      group.current.scale.setScalar(breath * baseScale);
    } else if (group.current) {
      group.current.scale.setScalar(baseScale);
    }

    if (cursorTracking && pupilL.current && pupilR.current) {
      const maxOffset = 0.028;
      const targetX = THREE.MathUtils.clamp(
        mouse.x * viewport.width * 0.04,
        -maxOffset,
        maxOffset,
      );
      const targetY = THREE.MathUtils.clamp(
        mouse.y * viewport.height * 0.04,
        -maxOffset * 0.8,
        maxOffset * 0.8,
      );
      const lerp = 0.12;
      pupilL.current.position.x = THREE.MathUtils.lerp(
        pupilL.current.position.x,
        -0.2 + targetX,
        lerp,
      );
      pupilL.current.position.y = THREE.MathUtils.lerp(
        pupilL.current.position.y,
        0.08 + targetY,
        lerp,
      );
      pupilR.current.position.x = THREE.MathUtils.lerp(
        pupilR.current.position.x,
        0.2 + targetX,
        lerp,
      );
      pupilR.current.position.y = THREE.MathUtils.lerp(
        pupilR.current.position.y,
        0.08 + targetY,
        lerp,
      );
    }

    if (antennaGroup.current) {
      if (mood === "waving") {
        antennaGroup.current.rotation.z = Math.sin(t * 5) * 0.4;
      } else {
        antennaGroup.current.rotation.z = Math.sin(t * 0.4) * 0.02;
      }
    }

    if (antennaTip.current) {
      const mat = antennaTip.current.material as THREE.MeshPhysicalMaterial;
      const base = mood === "thinking" ? 1.1 : 0.85;
      const amp = mood === "thinking" ? 0.35 : 0.15;
      mat.emissiveIntensity = base + Math.sin(t * (mood === "thinking" ? 3 : 1.6)) * amp;
    }
  });

  // Geometry resolution scales with quality tier (was 96 — overkill).
  const bodySegments = tier === "ultra" ? 80 : tier === "high" ? 64 : 48;
  const sparkleCount = tier === "ultra" ? 50 : tier === "high" ? 30 : 18;
  const showSparkles = tier !== "low";

  return (
    <group ref={group} scale={baseScale}>
      {/* Inner caustic glow — soft mint core for the "made of light" feel */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial color="#00D97E" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.04, 0.06, 0.04]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color="#A5FFD9" transparent opacity={0.85} />
      </mesh>

      {/* Body — stylized plush plastic, NOT a refractive mirror. Cheap. */}
      <mesh ref={body} scale={[1, 1.12, 0.95]}>
        <sphereGeometry args={[0.62, bodySegments, bodySegments]} />
        <meshPhysicalMaterial
          color="#1FB37C"
          roughness={0.42}
          metalness={0}
          clearcoat={0.45}
          clearcoatRoughness={0.4}
          sheen={1}
          sheenColor="#A5FFD9"
          sheenRoughness={0.6}
          emissive="#00D97E"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Fresnel rim glow — additive, slightly larger than the body so a
          soft mint halo wraps the silhouette. */}
      <mesh scale={[1.04, 1.16, 0.99]}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <shaderMaterial
          vertexShader={RIM_VERT}
          fragmentShader={RIM_FRAG}
          uniforms={rimUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Internal sparkles for life — cheap (point cloud, not refraction) */}
      {showSparkles && (
        <Sparkles
          count={sparkleCount}
          scale={[0.9, 1.0, 0.8]}
          size={2.0}
          speed={0.3}
          color={"#A5FFD9"}
          opacity={0.7}
          noise={0.4}
        />
      )}

      {/* Antenna */}
      <group ref={antennaGroup} position={[0, 0.6, 0]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.012, 0.018, 0.28, 8]} />
          <meshStandardMaterial color="#00D97E" transparent opacity={0.7} />
        </mesh>
        <mesh ref={antennaTip} position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshPhysicalMaterial
            color="#A5FFD9"
            emissive="#00D97E"
            emissiveIntensity={1.0}
            roughness={0.12}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Eye whites */}
      <mesh ref={eyeL} position={[-0.2, 0.08, 0.55]}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh ref={eyeR} position={[0.2, 0.08, 0.55]}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh ref={pupilL} position={[-0.2, 0.08, 0.67]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshBasicMaterial color="#0A0410" />
      </mesh>
      <mesh ref={pupilR} position={[0.2, 0.08, 0.67]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshBasicMaterial color="#0A0410" />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[-0.17, 0.12, 0.71]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.23, 0.12, 0.71]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Smile */}
      <mesh ref={mouth} position={[0, -0.1, 0.52]}>
        <shapeGeometry args={[mouthShape]} />
        <meshBasicMaterial color="#0A0410" side={THREE.DoubleSide} />
      </mesh>

      {/* Cheek blushes */}
      <mesh position={[-0.4, -0.08, 0.4]} rotation={[0, -0.4, 0]}>
        <circleGeometry args={[0.1, 24]} />
        <meshBasicMaterial color="#FF6B35" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.4, -0.08, 0.4]} rotation={[0, 0.4, 0]}>
        <circleGeometry args={[0.1, 24]} />
        <meshBasicMaterial color="#FF6B35" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
