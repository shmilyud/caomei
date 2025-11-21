
import React, { useState, useCallback, useEffect } from 'react';
import SceneContainer from './components/SceneContainer';
import Dashboard from './components/Dashboard';
import { SimulationState, Metrics, LogEntry } from './types';

function App() {
  const [state, setState] = useState<SimulationState>(SimulationState.IDLE);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeString,
      message,
      type
    }, ...prev]);
  }, []);

  const startSimulation = useCallback(() => {
    setMetrics(null);
    setLogs([]); // Clear logs on new run
    addLog("Signal received from Upper Computer.", 'info');
    addLog("Initiating Phenotype Acquisition Sequence.", 'info');
    setState(SimulationState.DOORS_CLOSING);
  }, [addLog]);

  const resetSimulation = useCallback(() => {
    setState(SimulationState.IDLE);
    addLog("System reset. Doors opening for access.", 'info');
  }, [addLog]);

  // State Machine Logic
  useEffect(() => {
    let timer: number;

    switch (state) {
      case SimulationState.DOORS_CLOSING:
        addLog("Closing roller shutter doors...", 'info');
        timer = window.setTimeout(() => {
            addLog("Doors secured. Engaging transparency mode for observation.", 'success');
            addLog("Starting blue light stimulation sequence...", 'warning');
            setState(SimulationState.STIMULATING);
        }, 2500);
        break;

      case SimulationState.STIMULATING:
        // Blue light is on for chlorophyll excitation
        timer = window.setTimeout(() => {
          addLog("Stimulation complete.", 'success');
          addLog("Turning off lights for point cloud acquisition...", 'info');
          setState(SimulationState.PREPARING_SCAN);
        }, 3000);
        break;

      case SimulationState.PREPARING_SCAN:
        // Brief pause to switch visual modes
        timer = window.setTimeout(() => {
          addLog("Gemini 2 Camera activated.", 'info');
          setState(SimulationState.SCANNING);
        }, 1000);
        break;

      case SimulationState.SCANNING:
        // Scanning simulation
        timer = window.setTimeout(() => {
          addLog("Point cloud captured (.ply). RGB data integrated.", 'success');
          setState(SimulationState.ANALYZING);
        }, 3000);
        break;

      case SimulationState.ANALYZING:
        addLog("Calculating morphological parameters (Height, Area, Angle)...", 'info');
        addLog("Analyzing spectral response for Chlorophyll & Stress...", 'info');
        // Calculation simulation
        timer = window.setTimeout(() => {
          setMetrics({
            plantHeight: 18.5,
            leafArea: 142.3,
            leafAngle: 42.1,
            chlorophyllContent: 45.8,
            stressCondition: "Healthy"
          });
          addLog("Analysis complete.", 'success');
          setState(SimulationState.DOORS_OPENING);
        }, 2000);
        break;
      
      case SimulationState.DOORS_OPENING:
        addLog("Opening roller shutter doors...", 'info');
        timer = window.setTimeout(() => {
            addLog("Cycle finished. Ready for next plant.", 'success');
            setState(SimulationState.COMPLETE);
        }, 2500);
        break;

      case SimulationState.COMPLETE:
        // Done
        break;

      default:
        break;
    }

    return () => clearTimeout(timer);
  }, [state, addLog]);

  // Initial Log
  useEffect(() => {
    addLog("System initialized. Plant detected inside.", 'info');
    addLog("Waiting for start command.", 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <SceneContainer simulationState={state} />
      <Dashboard 
        state={state} 
        metrics={metrics} 
        logs={logs}
        onStart={startSimulation}
        onReset={resetSimulation}
      />
    </div>
  );
}

export default App;
