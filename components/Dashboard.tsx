
import React from 'react';
import { SimulationState, Metrics, LogEntry } from '../types';
import { Play, RotateCcw, Activity, Cpu, CheckCircle2, ScanLine, Sprout, ArrowDownToLine, ChevronRight, Download } from 'lucide-react';

interface DashboardProps {
  state: SimulationState;
  metrics: Metrics | null;
  logs: LogEntry[];
  onStart: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, metrics, logs, onStart, onReset }) => {
  
  const handleDownloadReport = () => {
    if (!metrics) return;

    const report = {
        timestamp: new Date().toISOString(),
        device: "AgriScan Pro Series",
        metrics: metrics,
        logs: logs
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgriScan_Report_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col md:flex-row p-6 gap-6 justify-between">
      
      {/* Left Panel: Control Center */}
      <div className="pointer-events-auto w-full md:w-[360px] flex flex-col gap-6">
        
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl ring-1 ring-black/5">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center shadow-lg">
               <Sprout className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">AgriScan</h1>
                <p className="text-white/40 text-sm font-medium">Pro Series</p>
            </div>
          </div>

          {/* Status List (Like iOS Settings) */}
          <div className="bg-black/20 rounded-2xl overflow-hidden mb-8 backdrop-blur-sm border border-white/5">
             <StepItem 
                active={state === SimulationState.DOORS_CLOSING} 
                completed={state !== SimulationState.IDLE && state !== SimulationState.DOORS_CLOSING}
                label="Secure Chamber" 
                icon={<ArrowDownToLine size={18} />} 
             />
             <div className="h-[1px] bg-white/5 ml-12" />
             <StepItem 
                active={state === SimulationState.STIMULATING} 
                completed={state !== SimulationState.IDLE && state !== SimulationState.DOORS_CLOSING && state !== SimulationState.STIMULATING}
                label="Blue Light Stim" 
                icon={<Activity size={18} />} 
             />
             <div className="h-[1px] bg-white/5 ml-12" />
             <StepItem 
                active={state === SimulationState.SCANNING} 
                completed={state === SimulationState.ANALYZING || state === SimulationState.COMPLETE || state === SimulationState.DOORS_OPENING}
                label="LiDAR Scan" 
                icon={<ScanLine size={18} />} 
             />
             <div className="h-[1px] bg-white/5 ml-12" />
             <StepItem 
                active={state === SimulationState.ANALYZING} 
                completed={state === SimulationState.COMPLETE || state === SimulationState.DOORS_OPENING}
                label="Neural Analysis" 
                icon={<Cpu size={18} />} 
             />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onStart}
              disabled={state !== SimulationState