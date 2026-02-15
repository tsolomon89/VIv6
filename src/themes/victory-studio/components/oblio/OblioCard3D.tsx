
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject } from '../../types';

interface SceneProps {
  color: string;
  geometryType: string;
  hovered: boolean;
}

function CardScene({ color, geometryType, hovered }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);

  // Mouse Parallax & Jiggle
  useFrame((state) => {
      if (groupRef.current) {
          const x = state.pointer.x;
          const y = state.pointer.y;
          
          // Smooth look-at / Tilt towards cursor
          groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.4, 0.1);
          groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.4, 0.1);
      }
      
      if (meshRef.current) {
          if (hovered) {
               const time = state.clock.elapsedTime * 20; 
               meshRef.current.rotation.z = Math.sin(time) * 0.05;
               meshRef.current.scale.setScalar(1 + Math.sin(time) * 0.02);
          } else {
               meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
               meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1));
          }
      }
  });

  const type = geometryType.toLowerCase();

  return (
    <group ref={groupRef}>
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 5]} intensity={2} angle={0.5} penumbra={1} />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={meshRef}>
                {type === "box" && (
                    <RoundedBox args={[2, 2.5, 0.2]} radius={0.1} smoothness={4}>
                         <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} />
                    </RoundedBox>
                )}
                {type === "torus" && (
                    <mesh rotation={[0.5, 0, 0]}>
                        <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
                         <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
                    </mesh>
                )}
                {type === "sphere" && (
                    <mesh>
                         <dodecahedronGeometry args={[1.2, 0]} />
                         <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
                    </mesh>
                )}

                {/* Inner Glow / Detail for Box specific */}
                {type === "box" && (
                     <mesh position={[0, 0, 0.11]}>
                        <planeGeometry args={[1.8, 2.3]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                )}
            </group>
        </Float>
    </group>
  );
}

export const OblioCard3D = ({ obj }: { obj: SceneObject }) => {
    const [hovered, setHovered] = useState(false);
    
    // Extract Props from SceneObject
    const title = obj.title || "Title";
    const description = obj.subtitle || "Subtitle";
    const color = obj.color || "#ffffff";
    const shape = obj.shapeProp || obj.shapeVariant || "box"; // 'shape' is reserved for 'card3d'
    
    // Fallback if 'shape' prop was passed as mapped field
    const effectiveShape = (obj as any).shapeType || shape;

    return (
        <div 
            className="group relative w-full aspect-[4/5] bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
             {/* 3D View Layer - Local Canvas */}
             <div className="absolute inset-0 z-0">
                 <Canvas gl={{ alpha: true, antialias: true }}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <Environment preset="city" />
                    <CardScene color={color} geometryType={effectiveShape} hovered={hovered} />
                 </Canvas>
             </div>

             {/* Content Overlay */}
             <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent">
                 <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                     <h3 className="text-3xl font-black uppercase text-white mb-2">{title}</h3>
                     <p className="text-gray-300 font-medium tracking-wide">{description}</p>
                 </div>
             </div>
             
             {/* Hover Glow Border */}
             <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 pointer-events-none ${hovered ? 'border-white/50' : 'border-transparent'}`} />
        </div>
    );
};
