'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function OrbitingBlobs() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.06;
    group.current.rotation.x = Math.sin(t * 0.15) * 0.08;
  });

  return (
    <group ref={group}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.9}>
        <mesh position={[-3.2, 0.8, -1.5]} scale={1.65}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#e0e7ff"
            attach="material"
            distort={0.38}
            speed={1.3}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
      </Float>
      <Float speed={2.2} rotationIntensity={0.35} floatIntensity={1.1}>
        <mesh position={[3.4, -0.6, -2.8]} scale={2}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#ede9fe"
            attach="material"
            distort={0.48}
            speed={1.6}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
      </Float>
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.65}>
        <mesh position={[0.2, 2.2, -4.5]} scale={1.35}>
          <sphereGeometry args={[1, 48, 48]} />
          <MeshDistortMaterial
            color="#dbeafe"
            attach="material"
            distort={0.32}
            speed={1.1}
            roughness={0.52}
            metalness={0.05}
          />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.5}>
        <mesh position={[1.5, -2, -3]} scale={1.1}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ddd6fe"
            emissive="#e9d5ff"
            emissiveIntensity={0.12}
            roughness={0.65}
            metalness={0.08}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HomeAnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden home-bg-root"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-slate-50"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 75% at 50% -10%, rgba(199, 210, 254, 0.65), transparent 58%),
            radial-gradient(ellipse 75% 55% at 105% 45%, rgba(233, 213, 255, 0.5), transparent 52%),
            radial-gradient(ellipse 60% 50% at -5% 90%, rgba(191, 219, 254, 0.55), transparent 48%)
          `,
        }}
      />
      <Canvas
        className="!absolute inset-0 !h-full !w-full"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.95} />
        <pointLight position={[8, 8, 6]} intensity={0.45} color="#ffffff" />
        <pointLight position={[-8, -4, 4]} intensity={0.35} color="#f5f3ff" />
        <directionalLight position={[0, 6, 4]} intensity={0.55} color="#ffffff" />
        <Stars
          radius={90}
          depth={45}
          count={900}
          factor={2.2}
          saturation={0}
          fade
          speed={0.35}
        />
        <OrbitingBlobs />
      </Canvas>
      <div className="home-bg-shimmer absolute inset-0 opacity-25 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/92 to-white/96 backdrop-blur-[2px]" />
    </div>
  );
}
