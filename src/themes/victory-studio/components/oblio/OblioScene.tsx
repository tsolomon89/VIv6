
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject } from '../../types';

// Reusable Token Component
function OblioToken({ position, scale = 1, color }: { position: [number, number, number]; scale?: number, color: string }) {
  return (
    <group position={position} scale={scale} rotation={[Math.PI / 2, 0, 0] as any}>
       {/* Token Body */}
      <mesh>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Detail Ring */}
      <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.7, 0.05, 16, 32]} />
          <meshStandardMaterial color="white" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function OblioCard({ colors }: { colors: any }) {
  return (
    <group rotation={[0.1, -0.2, 0]}>
        {/* Card Body - Matte Navy */}
        <mesh>
            <boxGeometry args={[3.2, 2, 0.1]} />
            <meshStandardMaterial 
                color={colors.navy} 
                roughness={0.4} 
                metalness={0.2} 
            />
        </mesh>
        
        {/* Stripe - Coral */}
        <mesh position={[0.8, 0, 0.06]}>
             <boxGeometry args={[0.1, 2, 0.01]} />
             <meshStandardMaterial color={colors.coral} roughness={0.1} metalness={0.1} />
        </mesh>

         {/* Chip - Gold */}
         <mesh position={[-1.2, 0.2, 0.06]}>
            <boxGeometry args={[0.4, 0.3, 0.01]} />
            <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
         </mesh>
         
         {/* Logo Placeholder - White Circle */}
         <mesh position={[0, 1.2, 0.06]}>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="white" transparent opacity={0.1} />
         </mesh>
    </group>
  );
}

interface TokenScatterSceneProps {
    progress: number;
}

const TokenScatterScene = ({ progress }: TokenScatterSceneProps) => {
    const cardRef = useRef<THREE.Group>(null);
    const coinsGroupRef = useRef<THREE.Group>(null);
    
    // Animation Constants (From Brand Config)
    const flipRotation = { x: Math.PI * 2, z: Math.PI / 4 };
    const tokensScatter = { y: -8, z: 2 };

    useFrame(() => {
        // Map progress (0 to 1) to animation state
        if (cardRef.current) {
            // Flip & Fall:
            // x: Lerp 0 -> flipRotation.x
            cardRef.current.rotation.x = THREE.MathUtils.lerp(0, flipRotation.x, progress);
            cardRef.current.rotation.z = THREE.MathUtils.lerp(0, flipRotation.z, progress);
            
            // Pos: Lerp 0 -> (-1, -4)
            // Ease it a bit? 
            // Simple Linear for now, or Math.pow(progress, 2)
            cardRef.current.position.y = THREE.MathUtils.lerp(0, -4, progress);
            cardRef.current.position.x = THREE.MathUtils.lerp(0, -1, progress);
        }

        if (coinsGroupRef.current) {
            // Scatter
            coinsGroupRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI, progress);
            coinsGroupRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI/2, progress);
            
            coinsGroupRef.current.position.y = THREE.MathUtils.lerp(0, tokensScatter.y, progress);
            coinsGroupRef.current.position.z = THREE.MathUtils.lerp(0, tokensScatter.z, progress);
        }
    });

    // Theme Colors
    const colors = {
        navy: "#1E1C24",
        coral: "#ff2a13",
        gold: "#FBB03B"
    };

    return (
        <group>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} />
            <pointLight position={[-10, -5, -10]} intensity={1} color={colors.coral} />

            {/* Main Oblio Card */}
            <group ref={cardRef}>
                <OblioCard colors={colors} />
            </group>

            {/* Floating Tokens */}
            <group ref={coinsGroupRef}>
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <OblioToken position={[3, 2, -2]} scale={0.6} color={colors.gold} />
                    <OblioToken position={[-3, -1, -5]} scale={0.5} color={colors.coral} />
                    <OblioToken position={[2.5, -2.5, 1]} scale={0.4} color="#ffffff" />
                    <OblioToken position={[-2, 2.5, -1]} scale={0.3} color={colors.gold} />
                    <OblioToken position={[0, -3.5, -2]} scale={0.5} color={colors.coral} />
                </Float>
            </group>
        </group>
    );
};

export const OblioScene = ({ obj: _obj, scrollProgress }: { obj: SceneObject, scrollProgress: number }) => {
    return (
        <div className="w-full h-full relative">
            <Canvas gl={{ alpha: true, antialias: true }}>
                <TokenScatterScene progress={scrollProgress} />
            </Canvas>
        </div>
    );
};
