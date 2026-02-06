"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Camera that gently follows mouse position                         */
/* ------------------------------------------------------------------ */
function MouseCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3(0, 0, 10));

  const onPointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  // Attach listener once
  useState(() => {
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  });

  useFrame(() => {
    target.current.x = mouse.current.x * 1.2;
    target.current.y = -mouse.current.y * 0.8;
    target.current.z = 10;
    camera.position.lerp(target.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Glowing sphere particle with organic float                        */
/* ------------------------------------------------------------------ */
function Particle({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<any>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.6;
    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.4;
    ref.current.position.z = position[2] + Math.sin(t * 0.5) * 0.3;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.z = t * 0.2;
    // Subtle breathing scale
    const breathe = 1 + Math.sin(t * 2) * 0.15;
    ref.current.scale.setScalar(scale * breathe);
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.55}
        roughness={0.15}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Bacteria cluster with capsule shapes                              */
/* ------------------------------------------------------------------ */
function BacteriaCluster({
  position,
  count = 5,
  color,
}: {
  position: [number, number, number];
  count?: number;
  color: string;
}) {
  const groupRef = useRef<any>(null);

  const bacteria = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
      ] as [number, number, number],
      scale: 0.08 + Math.random() * 0.14,
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      key: i,
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {bacteria.map((b) => (
        <Float
          key={b.key}
          speed={1.5 + Math.random() * 2}
          rotationIntensity={0.6}
          floatIntensity={0.6}
        >
          <mesh position={b.pos} scale={b.scale} rotation={b.rotation}>
            <capsuleGeometry args={[0.5, 1.2, 8, 16]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.45}
              roughness={0.25}
              metalness={0.1}
              emissive={color}
              emissiveIntensity={0.25}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating particles field                                          */
/* ------------------------------------------------------------------ */
function FloatingParticles() {
  const particles = useMemo(() => {
    const colors = ["#2db88a", "#38bdf8", "#a7f3d0", "#67e8f9", "#6ee7b7"];
    return Array.from({ length: 100 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 14,
      ] as [number, number, number],
      scale: 0.02 + Math.random() * 0.07,
      color: colors[i % colors.length],
      speed: 0.2 + Math.random() * 0.8,
      key: i,
    }));
  }, []);

  return (
    <>
      {particles.map((p) => (
        <Particle
          key={p.key}
          position={p.position}
          scale={p.scale}
          color={p.color}
          speed={p.speed}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DNA-like double helix spiral                                      */
/* ------------------------------------------------------------------ */
function DNAHelix({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<any>(null);

  const { strand1, strand2, bridges } = useMemo(() => {
    const s1: { pos: [number, number, number]; key: string }[] = [];
    const s2: { pos: [number, number, number]; key: string }[] = [];
    const br: {
      pos: [number, number, number];
      scale: [number, number, number];
      rotation: [number, number, number];
      key: string;
    }[] = [];
    const steps = 40;
    const radius = 0.8;
    const height = 8;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 4;
      const y = t * height - height / 2;

      s1.push({
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        key: `s1-${i}`,
      });
      s2.push({
        pos: [
          Math.cos(angle + Math.PI) * radius,
          y,
          Math.sin(angle + Math.PI) * radius,
        ],
        key: `s2-${i}`,
      });

      if (i % 4 === 0) {
        const midX = (Math.cos(angle) * radius + Math.cos(angle + Math.PI) * radius) / 2;
        const midZ = (Math.sin(angle) * radius + Math.sin(angle + Math.PI) * radius) / 2;
        br.push({
          pos: [midX, y, midZ],
          scale: [radius * 2, 0.04, 0.04],
          rotation: [0, -angle, 0],
          key: `br-${i}`,
        });
      }
    }
    return { strand1: s1, strand2: s2, bridges: br };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {strand1.map((s) => (
        <mesh key={s.key} position={s.pos} scale={0.06}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color="#2db88a"
            emissive="#2db88a"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {strand2.map((s) => (
        <mesh key={s.key} position={s.pos} scale={0.06}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {bridges.map((b) => (
        <mesh key={b.key} position={b.pos} scale={b.scale} rotation={b.rotation}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#a7f3d0"
            emissive="#a7f3d0"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbiting ring of glowing dots (biofilm ring)                      */
/* ------------------------------------------------------------------ */
function BiofilmRing({
  radius = 3,
  count = 20,
  color = "#38bdf8",
  rotationSpeed = 0.08,
}: {
  radius?: number;
  count?: number;
  color?: string;
  rotationSpeed?: number;
}) {
  const groupRef = useRef<any>(null);

  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.35,
          Math.sin(angle) * radius * 0.5,
        ] as [number, number, number],
        scale: 0.03 + Math.random() * 0.06,
        key: i,
      };
    });
  }, [radius, count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed;
    groupRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {dots.map((d) => (
        <mesh key={d.key} position={d.position} scale={d.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.45}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Pulsating cell membrane sphere                                    */
/* ------------------------------------------------------------------ */
function CellMembrane({
  position,
  baseRadius = 1.2,
  color = "#6ee7b7",
}: {
  position: [number, number, number];
  baseRadius?: number;
  color?: string;
}) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pulse = baseRadius + Math.sin(t * 1.5) * 0.15;
    ref.current.scale.setScalar(pulse);
    ref.current.rotation.y = t * 0.1;
    ref.current.rotation.x = t * 0.07;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        wireframe
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Energy trail -- torus knot with animated rotation                 */
/* ------------------------------------------------------------------ */
function EnergyTrail({
  position,
  color = "#38bdf8",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.y = t * 0.15;
    ref.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={ref} position={position} scale={0.6}>
      <torusKnotGeometry args={[1.5, 0.04, 128, 8, 2, 3]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.2}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Full 3-D scene composition                                        */
/* ------------------------------------------------------------------ */
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 10, 10]} intensity={0.7} color="#2db88a" />
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[0, 8, -10]} intensity={0.3} color="#a7f3d0" />
      <pointLight position={[5, -8, 8]} intensity={0.25} color="#67e8f9" />
      <hemisphereLight args={["#a7f3d0", "#e0f2fe", 0.5]} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

      {/* Camera movement */}
      <MouseCamera />

      {/* Particles */}
      <FloatingParticles />

      {/* Bacteria clusters */}
      <BacteriaCluster position={[-5, 2.5, -3]} count={7} color="#2db88a" />
      <BacteriaCluster position={[6, -1, -4]} count={5} color="#38bdf8" />
      <BacteriaCluster position={[0, -3.5, -2]} count={6} color="#6ee7b7" />
      <BacteriaCluster position={[-3.5, -2, -5]} count={4} color="#67e8f9" />
      <BacteriaCluster position={[3, 4, -6]} count={3} color="#a7f3d0" />

      {/* DNA Helices */}
      <DNAHelix position={[-7, 0, -6]} />
      <DNAHelix position={[8, -1, -7]} />

      {/* Biofilm rings */}
      <BiofilmRing radius={4} count={30} color="#38bdf8" rotationSpeed={0.08} />
      <BiofilmRing radius={6.5} count={24} color="#2db88a" rotationSpeed={-0.05} />
      <BiofilmRing radius={3} count={18} color="#67e8f9" rotationSpeed={0.12} />

      {/* Cell membranes */}
      <CellMembrane position={[-4, 3, -4]} baseRadius={1.4} color="#6ee7b7" />
      <CellMembrane position={[5, -3, -5]} baseRadius={1.0} color="#38bdf8" />
      <CellMembrane position={[1, 5, -6]} baseRadius={0.8} color="#a7f3d0" />

      {/* Energy trails */}
      <EnergyTrail position={[3, 2, -4]} color="#2db88a" />
      <EnergyTrail position={[-5, -3, -5]} color="#38bdf8" />

      {/* Depth fog */}
      <fog attach="fog" args={["#f0fdf9", 8, 28]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported component (fixed behind page content)                    */
/* ------------------------------------------------------------------ */
export default function MicrobiomeScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      {/* Overlay removed to ensure the 3D canvas is fully visible */}
    </div>
  );
}
