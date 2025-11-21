
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Fix for missing R3F JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      sphereGeometry: any;
      coneGeometry: any;
      points: any;
      pointsMaterial: any;
      shapeGeometry: any;
    }
  }
}

interface StrawberryPlantProps {
  showPointCloud: boolean;
}

// A single leaflet shape
const Leaflet: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({ 
  position = [0,0,0], 
  rotation = [0,0,0], 
  scale = 1 
}) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Draw a serrated leaf shape
    shape.moveTo(0, 0);
    
    // Right side with serrations
    shape.bezierCurveTo(0.02, 0.02, 0.04, 0.05, 0.03, 0.1);
    shape.lineTo(0.04, 0.11); // serration
    shape.lineTo(0.03, 0.12);
    shape.lineTo(0.035, 0.14); // serration
    shape.lineTo(0.02, 0.16);
    shape.bezierCurveTo(0.01, 0.17, 0.005, 0.18, 0, 0.2); // Tip

    // Left side with serrations (mirrored)
    shape.bezierCurveTo(-0.005, 0.18, -0.01, 0.17, -0.02, 0.16);
    shape.lineTo(-0.035, 0.14); // serration
    shape.lineTo(-0.03, 0.12);
    shape.lineTo(-0.04, 0.11); // serration
    shape.lineTo(-0.03, 0.1);
    shape.bezierCurveTo(-0.04, 0.05, -0.02, 0.02, 0, 0);

    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} roughness={0.7} />
    </mesh>
  );
};

// A composite leaf consisting of a stem and 3 leaflets (trifoliate)
const Frond: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({ 
  position = [0,0,0], 
  rotation = [0,0,0], 
  scale = 1 
}) => {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Petiole (Main Stem) */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.004, 0.006, 0.25, 6]} />
        <meshStandardMaterial color="#4d7c0f" />
      </mesh>

      {/* Leaflets Group at tip */}
      <group position={[0, 0.24, 0]} rotation={[-Math.PI / 3, 0, 0]}>
         {/* Center Leaflet */}
         <Leaflet position={[0, 0, 0]} scale={1} />
         {/* Right Leaflet */}
         <Leaflet position={[0.005, 0, 0]} rotation={[0, 0, -Math.PI/4]} scale={0.9} />
         {/* Left Leaflet */}
         <Leaflet position={[-0.005, 0, 0]} rotation={[0, 0, Math.PI/4]} scale={0.9} />
      </group>
    </group>
  );
};

const StrawberryPlant: React.FC<StrawberryPlantProps> = ({ showPointCloud }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate points that roughly follow the new shape (wider spread)
  const pointsGeometry = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorGreen1 = new THREE.Color('#15803d');
    const colorGreen2 = new THREE.Color('#22c55e');
    const colorPot = new THREE.Color('#5D4037');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x, y, z, c;

      const r = Math.random();

      if (r < 0.2) {
          // Pot area
          const theta = Math.random() * Math.PI * 2;
          const rad = Math.sqrt(Math.random()) * 0.1;
          x = rad * Math.cos(theta);
          z = rad * Math.sin(theta);
          y = Math.random() * 0.15;
          c = colorPot;
      } else {
          // Leaf canopy area (wider hemisphere)
          // Leaves spread out ~0.3 radius, height ~0.2 to ~0.4
          const theta = Math.random() * Math.PI * 2;
          const rad = 0.05 + Math.sqrt(Math.random()) * 0.25; 
          
          // Curve the height based on radius to simulate drooping leaves
          // Higher in middle, lower at edges
          const heightBase = 0.15;
          const heightVar = Math.random() * 0.15;
          
          x = rad * Math.cos(theta);
          z = rad * Math.sin(theta);
          // Parabolic shape for canopy
          y = heightBase + heightVar + (0.2 * (1 - rad/0.3)); 

          c = Math.random() > 0.5 ? colorGreen1 : colorGreen2;
      }
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Add some noise
      positions[i3] += (Math.random() - 0.5) * 0.01;
      positions[i3+1] += (Math.random() - 0.5) * 0.01;
      positions[i3+2] += (Math.random() - 0.5) * 0.01;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle wind/breathing animation
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Solid Mesh Representation */}
      {!showPointCloud && (
        <group>
            {/* Pot */}
            <mesh position={[0, 0.075, 0]}>
                <cylinderGeometry args={[0.09, 0.07, 0.15, 16]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>
            {/* Soil */}
            <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.085, 0.085, 0.02, 16]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
            
            {/* Plant Crown (Base) */}
            <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#4d7c0f" />
            </mesh>

            {/* Fronds (Leaves) */}
            {/* Inner circle - more upright */}
            <Frond position={[0, 0.15, 0]} rotation={[0.2, 0, 0]} scale={1} />
            <Frond position={[0, 0.15, 0]} rotation={[0.2, 2.1, 0]} scale={1} />
            <Frond position={[0, 0.15, 0]} rotation={[0.2, 4.2, 0]} scale={0.9} />

            {/* Outer circle - more spread out */}
            <Frond position={[0, 0.15, 0]} rotation={[0.8, 1, 0]} scale={0.9} />
            <Frond position={[0, 0.15, 0]} rotation={[0.9, 2.5, 0]} scale={0.85} />
            <Frond position={[0, 0.15, 0]} rotation={[0.8, 4, 0]} scale={0.9} />
            <Frond position={[0, 0.15, 0]} rotation={[0.7, 5.5, 0]} scale={0.95} />
        </group>
      )}

      {/* Point Cloud Representation */}
      {showPointCloud && (
        <points geometry={pointsGeometry} position={[0, 0, 0]}>
          <pointsMaterial size={0.012} vertexColors sizeAttenuation transparent opacity={0.8} />
        </points>
      )}
    </group>
  );
};

export default StrawberryPlant;
