import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Fix for missing R3F JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      cylinderGeometry: any;
      coneGeometry: any;
      meshBasicMaterial: any;
      capsuleGeometry: any;
      pointLight: any;
      meshPhysicalMaterial: any;
    }
  }
}

interface MachineProps {
  isTransparent: boolean;
  blueLightOn: boolean;
  isScanning: boolean;
  targetDoorOpen: boolean; // New prop for animation
}

const Machine: React.FC<MachineProps> = ({ isTransparent, blueLightOn, isScanning, targetDoorOpen }) => {
  // Dimensions
  const width = 1.2;
  const height = 1.5;
  const depth = 1.2;
  const thickness = 0.05;

  // Animation Refs
  const frontDoorRef = useRef<THREE.Group>(null);
  const backDoorRef = useRef<THREE.Group>(null);
  const currentDoorOpenRef = useRef(targetDoorOpen ? 1 : 0); // 0 = closed, 1 = open

  // Apple "Space Gray" Aluminum Material
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#53535e', 
    roughness: 0.25,
    metalness: 0.8,
  });

  // Glass / Acrylic Material
  const plateMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.5, // Glass-like transmission
    transparent: true,
    opacity: isTransparent ? 0.1 : 0.8, // More transparent when active
    side: THREE.DoubleSide,
    thickness: 0.1,
  });

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: '#8e8e93', // System Gray
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: isTransparent ? 0.1 : 1,
  });

  const lightMaterial = new THREE.MeshStandardMaterial({
      color: "#007AFF", // System Blue
      emissive: "#007AFF", 
      emissiveIntensity: blueLightOn ? 2 : 0 
  });

  useFrame((state, delta) => {
    // Smooth door animation
    const target = targetDoorOpen ? 1 : 0;
    // Lerp current value towards target
    const step = delta * 1.5; // Animation speed
    if (currentDoorOpenRef.current < target) {
        currentDoorOpenRef.current = Math.min(target, currentDoorOpenRef.current + step);
    } else if (currentDoorOpenRef.current > target) {
        currentDoorOpenRef.current = Math.max(target, currentDoorOpenRef.current - step);
    }

    const openFactor = currentDoorOpenRef.current;
    const doorHeight = height - 0.1;
    
    // Roller shutter effect: Scale Y down, Move Y up
    // When open (1): ScaleY -> 0.1, PositionY -> Top
    // When closed (0): ScaleY -> 1, PositionY -> Center
    
    if (frontDoorRef.current) {
        const scaleY = 1 - (openFactor * 0.9); // Shrink to 10%
        frontDoorRef.current.scale.y = scaleY;
        frontDoorRef.current.position.y = (height/2 - 0.05) - (doorHeight * scaleY)/2;
    }

    if (backDoorRef.current) {
        const scaleY = 1 - (openFactor * 0.9);
        backDoorRef.current.scale.y = scaleY;
        backDoorRef.current.position.y = (height/2 - 0.05) - (doorHeight * scaleY)/2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* --- Frame (Corner Pillars) --- */}
      <mesh position={[-width/2, 0, depth/2]} material={frameMaterial}>
        <boxGeometry args={[thickness, height, thickness]} />
      </mesh>
      <mesh position={[width/2, 0, depth/2]} material={frameMaterial}>
        <boxGeometry args={[thickness, height, thickness]} />
      </mesh>
      <mesh position={[-width/2, 0, -depth/2]} material={frameMaterial}>
        <boxGeometry args={[thickness, height, thickness]} />
      </mesh>
      <mesh position={[width/2, 0, -depth/2]} material={frameMaterial}>
        <boxGeometry args={[thickness, height, thickness]} />
      </mesh>

      {/* Top/Bottom Frame Rims */}
      <mesh position={[0, height/2, depth/2]} material={frameMaterial}>
        <boxGeometry args={[width, thickness, thickness]} />
      </mesh>
      <mesh position={[0, -height/2, depth/2]} material={frameMaterial}>
        <boxGeometry args={[width, thickness, thickness]} />
      </mesh>
      <mesh position={[0, height/2, -depth/2]} material={frameMaterial}>
        <boxGeometry args={[width, thickness, thickness]} />
      </mesh>
      <mesh position={[0, -height/2, -depth/2]} material={frameMaterial}>
        <boxGeometry args={[width, thickness, thickness]} />
      </mesh>
      {/* Side Rims */}
      <mesh position={[width/2, height/2, 0]} material={frameMaterial}>
        <boxGeometry args={[thickness, thickness, depth]} />
      </mesh>
      <mesh position={[-width/2, height/2, 0]} material={frameMaterial}>
        <boxGeometry args={[thickness, thickness, depth]} />
      </mesh>
      
      {/* --- Panels --- */}
      <mesh position={[0, height/2 + thickness/2, 0]} material={plateMaterial}>
        <boxGeometry args={[width, thickness/2, depth]} />
      </mesh>
      <mesh position={[0, -height/2 - thickness/2, 0]} material={plateMaterial}>
        <boxGeometry args={[width, thickness/2, depth]} />
      </mesh>
      <mesh position={[-width/2 - thickness/2, 0, 0]} material={plateMaterial}>
        <boxGeometry args={[thickness/2, height, depth]} />
      </mesh>
      <mesh position={[width/2 + thickness/2, 0, 0]} material={plateMaterial}>
        <boxGeometry args={[thickness/2, height, depth]} />
      </mesh>

      {/* --- Doors (Roller Shutters) --- */}
      {/* Front Door */}
      <group ref={frontDoorRef} position={[0, 0, depth/2 + thickness/2]}>
        <mesh material={doorMaterial}>
             {/* Ridge texture simulation via segments if we had a texture, but here just box */}
             <boxGeometry args={[width - 0.1, height - 0.1, thickness/4]} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, -(height-0.1)/2 + 0.1, thickness/2]} material={frameMaterial}>
            <boxGeometry args={[0.2, 0.02, 0.02]} />
        </mesh>
      </group>

      {/* Back Door */}
      <group ref={backDoorRef} position={[0, 0, -depth/2 - thickness/2]}>
        <mesh material={doorMaterial}>
             <boxGeometry args={[width - 0.1, height - 0.1, thickness/4]} />
        </mesh>
      </group>

      {/* --- Gemini 2 Camera --- */}
      <group position={[0, height/2 - 0.1, 0]}>
        <mesh>
            <boxGeometry args={[0.2, 0.04, 0.06]} />
            <meshStandardMaterial color="#1c1c1e" roughness={0.4} />
        </mesh>
        <mesh position={[-0.05, -0.03, 0]} rotation={[Math.PI/2, 0, 0]}>
             <cylinderGeometry args={[0.015, 0.015, 0.01]} />
             <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.05, -0.03, 0]} rotation={[Math.PI/2, 0, 0]}>
             <cylinderGeometry args={[0.015, 0.015, 0.01]} />
             <meshStandardMaterial color="#000" />
        </mesh>
        {/* Scanning Beam Visualizer */}
        {isScanning && (
           <mesh position={[0, -0.8, 0]}>
              <coneGeometry args={[0.5, 1.5, 32, 1, true]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
           </mesh>
        )}
      </group>

      {/* --- Blue Stimulation Lights (Moved Inside) --- */}
      {/* Left Light - Attached to inside left wall */}
      <group position={[-width/2 + 0.15, 0, 0]}>
         <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
            <meshStandardMaterial color="#333" /> {/* Fixture body */}
         </mesh>
         {/* The Light Bulb/Strip */}
         <mesh position={[0.02, 0, 0]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[0.015, 0.75, 4, 8]} />
            <meshStandardMaterial 
                color="#007AFF" 
                emissive="#007AFF" 
                emissiveIntensity={blueLightOn ? 4 : 0} 
                toneMapped={false}
            />
         </mesh>
         {blueLightOn && (
            <pointLight color="#007AFF" intensity={10} distance={2} decay={2} position={[0.1, 0, 0]} />
         )}
      </group>

      {/* Right Light - Attached to inside right wall */}
      <group position={[width/2 - 0.15, 0, 0]}>
         <mesh rotation={[0, 0, 0]}>
             <cylinderGeometry args={[0.02, 0.02, 0.8]} />
             <meshStandardMaterial color="#333" />
         </mesh>
         <mesh position={[-0.02, 0, 0]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[0.015, 0.75, 4, 8]} />
            <meshStandardMaterial 
                color="#007AFF" 
                emissive="#007AFF" 
                emissiveIntensity={blueLightOn ? 4 : 0}
                toneMapped={false}
            />
         </mesh>
         {blueLightOn && (
            <pointLight color="#007AFF" intensity={10} distance={2} decay={2} position={[-0.1, 0, 0]} />
         )}
      </group>

    </group>
  );
};

export default Machine;