"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingTorus() {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.18;
    ref.current.rotation.y = t * 0.22;
  });

  return (
    <mesh ref={ref} scale={1.6} position={[0, 0, -6]}>
      <torusKnotGeometry args={[1.8, 0.18, 220, 20, 2, 3]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#7c3aed"
        emissiveIntensity={0.9}
        roughness={0.12}
        metalness={0.8}
      />
    </mesh>
  );
}

function ParticlesField() {
  const pointsRef = useRef<any>(null);

  const particles = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={pointsRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} sizeAttenuation color="#60a5fa" transparent opacity={0.9} />
    </points>
  );
}

export default function FuturisticScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#38bdf8" />
        <FloatingTorus />
        <ParticlesField />
        {/* Debug sphere: large, bright, rotating in front to confirm rendering */}
        <mesh position={[0, 0, -2]} scale={2.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={1.2} roughness={0.05} metalness={0.9} />
        </mesh>
        <fog attach="fog" args={["#0f172a", 6, 28]} />
      </Canvas>
      {/* Overlay removed to let the 3D canvas show through clearly */}
    </div>
  );
}
