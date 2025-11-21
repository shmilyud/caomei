import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Machine from './Machine';
import StrawberryPlant from './StrawberryPlant';
import { SimulationState } from '../types';

// Fix for missing R3F JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      ambientLight: any;
      directionalLight: any;
      group: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

interface SceneContainerProps {
  simulationState: SimulationState;
}

const SceneContainer: React.FC<SceneContainerProps> = ({ simulationState }) => {
  
  // Device becomes transparent as soon as doors close (Stimulating) so we can see the blue light,
  // and remains transparent through scanning and analysis.
  const isTransparent = [
    SimulationState.STIMULATING,
    SimulationState.PREPARING_SCAN,
    SimulationState.SCANNING,
    SimulationState.ANALYZING
  ].includes(simulationState);

  const blueLightOn = simulationState === SimulationState.STIMULATING;
  
  // Point cloud appears only during/after scanning
  const showPointCloud = 
    simulationState === SimulationState.SCANNING || 
    simulationState === SimulationState.ANALYZING || 
    simulationState === SimulationState.COMPLETE || 
    simulationState === SimulationState.DOORS_OPENING;

  const isScanning = simulationState === SimulationState.SCANNING;

  // Doors are open in IDLE, OPENING, or COMPLETE states
  const targetDoorOpen = simulationState === SimulationState.IDLE || 
                         simulationState === SimulationState.COMPLETE || 
                         simulationState === SimulationState.DOORS_OPENING;

  return (
    <div className="w-full h-full bg-black">
      <Canvas shadows camera={{ position: [2.8, 2.8, 2.8], fov: 35 }}>
        {/* Deep, rich dark gray background, almost black, for studio feel */}
        <color attach="background" args={['#121212']} />
        
        {/* Soft Studio Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-bias={-0.0001} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#eef" />
        
        {/* Environment Reflection - Studio lighting preset */}
        <Environment preset="studio" />

        <group position={[0, -0.5, 0]}>
            <Machine 
                isTransparent={isTransparent} 
                blueLightOn={blueLightOn}
                isScanning={isScanning}
                targetDoorOpen={targetDoorOpen}
            />
            <StrawberryPlant showPointCloud={showPointCloud} />
            
            <ContactShadows opacity={0.5} scale={10} blur={2.5} far={4} color="#000000" />
            
            {/* Floor is subtle reflection or dark matte */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.755, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.2} />
            </mesh>
        </group>

        {/* Controls - Smooth damping */}
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enablePan={false} dampingFactor={0.05} />
      </Canvas>
    </div>
  );
};

export default SceneContainer;