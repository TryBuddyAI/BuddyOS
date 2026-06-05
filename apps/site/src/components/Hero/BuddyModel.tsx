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
  fresnel = pow(fresnel, 2.2);
  gl_FragColor = vec4(uColor, fresnel * uIntensity);
}
`;

/**
 * Build the irregular gel-blob body: a high-res icosahedron displaced by a
 * few octaves of smooth trig-noise into an organic droplet — heavier rounded
 * bottom, domed top, asymmetric lumps. The front (face) area is flattened so
 * the eyes/mouth sit cleanly. Computed once per detail level (no per-frame
 * cost); the "living" jiggle is done cheaply at the group/scale level.
 */
function makeBlobGeometry(radius: number, detail: number) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const p = v.clone().normalize();
    // Organic lumps (sum of sines on the direction vector).
    let d = 0;
    d += 0.06 * Math.sin(2.3 * p.x + 1.7 * p.y);
    d += 0.045 * Math.sin(3.1 * p.y + 2.2 * p.z + 0.5);
    d += 0.035 * Math.sin(2.7 * p.z + 1.9 * p.x + 1.1);
    d += 0.022 * Math.sin(5.0 * p.x * p.y + 3.0);
    // Flatten the front face zone so eyes/mouth sit on smooth glass.
    const faceMask =
      1 - THREE.MathUtils.smoothstep(p.z, 0.35, 0.95) * 0.72;
    d *= faceMask;
    // Droplet bias: pull the bottom down into a soft heavy base.
    const droplet = p.y < 0 ? -0.12 * Math.pow(-p.y, 1.6) : 0.02 * p.y;
    const r = radius * (1 + d);
    v.copy(p)
      .multiplyScalar(r)
      .add(new THREE.Vector3(0, droplet, 0));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function BuddyModel({
  cursorTracking = true,
  baseScale = 1,
}: BuddyModelProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
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
    const width = 0.17;
    const depth = 0.075;
    s.moveTo(-width, 0);
    s.quadraticCurveTo(0, -depth, width, 0);
    s.quadraticCurveTo(0, -depth + 0.012, -width, 0);
    return s;
  }, []);

  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#A5FFD9") },
      uIntensity: { value: 1.8 },
    }),
    [],
  );

  // Geometry resolution + effects scale with quality tier. The smooth inner
  // core (below) does the heavy lifting on perceived smoothness, so the shell
  // can stay light for fast first-frame boot — ultra gets the lush version.
  const detail = tier === "ultra" ? 6 : tier === "high" ? 5 : tier === "medium" ? 4 : 3;
  const sparkleCount = tier === "ultra" ? 60 : tier === "high" ? 36 : 20;
  const showSparkles = tier !== "low";
  // Real glass transmission is the expensive bit — reserve it for the strong
  // tiers; weaker hardware gets a cheaper translucent emerald that still reads
  // as glowing gel.
  const useTransmission = tier === "ultra" || tier === "high";

  const blobGeo = useMemo(() => makeBlobGeometry(0.62, detail), [detail]);

  // Dispose generated geometry on tier change / unmount.
  useEffect(() => {
    return () => {
      blobGeo.dispose();
    };
  }, [blobGeo]);

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

    // Gel wobble — squash/stretch the body on two axes out of phase so it
    // jiggles like jelly. Cheap (scale only, no geometry churn).
    if (body.current) {
      const wob = mood === "thinking" ? 0.05 : 0.03;
      body.current.scale.x = 1 + Math.sin(t * 2.1) * wob;
      body.current.scale.y = 1.12 + Math.sin(t * 2.1 + Math.PI) * wob;
      body.current.scale.z = 0.95 + Math.sin(t * 1.7 + 1.0) * wob * 0.6;
    }

    // Nebula core: breathe + brighten when thinking.
    if (core.current) {
      const mat = core.current.material as THREE.MeshBasicMaterial;
      const base = mood === "thinking" ? 0.85 : 0.6;
      const amp = mood === "thinking" ? 0.22 : 0.12;
      mat.opacity = base + Math.sin(t * (mood === "thinking" ? 2.6 : 1.4)) * amp;
      core.current.rotation.y = t * 0.25;
      core.current.rotation.x = Math.sin(t * 0.3) * 0.3;
    }

    if (cursorTracking && pupilL.current && pupilR.current) {
      const maxOffset = 0.03;
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
        // Springy idle sway.
        antennaGroup.current.rotation.z = Math.sin(t * 0.9) * 0.06;
      }
    }

    if (antennaTip.current) {
      const mat = antennaTip.current.material as THREE.MeshPhysicalMaterial;
      const base = mood === "thinking" ? 1.3 : 0.95;
      const amp = mood === "thinking" ? 0.4 : 0.18;
      mat.emissiveIntensity =
        base + Math.sin(t * (mood === "thinking" ? 3 : 1.6)) * amp;
    }
  });

  return (
    <group ref={group} scale={baseScale}>
      {/* Inner nebula core — soft smooth luminous emerald volumes that glow
          through the glass shell as a diffuse cloud (no hard facets), breathe,
          and slowly churn. The "made of light" soul. */}
      <mesh ref={core} position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.42, 40, 40]} />
        <meshBasicMaterial
          color="#00D97E"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.04, 0.02, 0.06]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshBasicMaterial
          color="#5EFFB0"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.05, 0.06, 0.08]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial
          color="#CFFFE9"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glass-jelly body — translucent emerald with subsurface-ish glow,
          clearcoat sheen, and (on strong tiers) real transmission. */}
      <mesh ref={body} geometry={blobGeo} scale={[1, 1.12, 0.95]}>
        <meshPhysicalMaterial
          color="#15C07E"
          transparent
          transmission={useTransmission ? 0.92 : 0}
          opacity={useTransmission ? 1 : 0.92}
          thickness={1.4}
          ior={1.36}
          roughness={0.16}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.28}
          iridescence={useTransmission ? 0.45 : 0}
          iridescenceIOR={1.3}
          sheen={1}
          sheenColor="#A5FFD9"
          sheenRoughness={0.5}
          attenuationColor="#00D97E"
          attenuationDistance={0.8}
          emissive="#007A47"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Fresnel rim glow — additive halo wrapping the silhouette in mint. */}
      <mesh geometry={blobGeo} scale={[1.05, 1.17, 1.0]}>
        <shaderMaterial
          vertexShader={RIM_VERT}
          fragmentShader={RIM_FRAG}
          uniforms={rimUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Suspended light motes inside the gel. */}
      {showSparkles && (
        <Sparkles
          count={sparkleCount}
          scale={[0.95, 1.05, 0.85]}
          size={2.2}
          speed={0.3}
          color={"#A5FFD9"}
          opacity={0.75}
          noise={0.4}
        />
      )}

      {/* Antenna — the pilot light. */}
      <group ref={antennaGroup} position={[0, 0.62, 0]}>
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.01, 0.016, 0.3, 8]} />
          <meshStandardMaterial
            color="#00D97E"
            emissive="#00D97E"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh ref={antennaTip} position={[0, 0.33, 0]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshPhysicalMaterial
            color="#CFFFE9"
            emissive="#00D97E"
            emissiveIntensity={1.1}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Iris glow behind each pupil — faint emerald inner light. */}
      <mesh position={[-0.2, 0.08, 0.6]}>
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial color="#00D97E" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.2, 0.08, 0.6]}>
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial color="#00D97E" transparent opacity={0.5} />
      </mesh>

      {/* Eye whites */}
      <mesh ref={eyeL} position={[-0.2, 0.08, 0.55]}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh ref={eyeR} position={[0.2, 0.08, 0.55]}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Pupils — glossy, slightly forward. */}
      <mesh ref={pupilL} position={[-0.2, 0.08, 0.67]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#06120C" roughness={0.15} metalness={0.1} />
      </mesh>
      <mesh ref={pupilR} position={[0.2, 0.08, 0.67]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#06120C" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Eye highlights (catchlights) */}
      <mesh position={[-0.17, 0.12, 0.71]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.23, 0.12, 0.71]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Smile */}
      <mesh ref={mouth} position={[0, -0.1, 0.52]}>
        <shapeGeometry args={[mouthShape]} />
        <meshBasicMaterial color="#06120C" side={THREE.DoubleSide} />
      </mesh>

      {/* Cheek blushes — sit just in front of the glass so the warm coral
          reads clearly against the cool green (like the reference). */}
      <mesh position={[-0.32, -0.07, 0.56]} rotation={[0, -0.35, 0]}>
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial color="#FF7A4D" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.32, -0.07, 0.56]} rotation={[0, 0.35, 0]}>
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial color="#FF7A4D" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
