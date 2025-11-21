
export enum SimulationState {
  IDLE = 'IDLE', // Doors Open, waiting
  DOORS_CLOSING = 'DOORS_CLOSING', // Mechanical action
  STIMULATING = 'STIMULATING', // Blue lights on
  PREPARING_SCAN = 'PREPARING_SCAN', // Lights off, preparing camera
  SCANNING = 'SCANNING', // Capturing point cloud
  ANALYZING = 'ANALYZING', // Calculating metrics
  DOORS_OPENING = 'DOORS_OPENING', // Mechanical action
  COMPLETE = 'COMPLETE', // Show results, Doors Open
}

export interface Metrics {
  plantHeight: number; // cm
  leafArea: number; // cm2
  leafAngle: number; // degrees
  chlorophyllContent: number; // SPAD units
  stressCondition: string; // e.g. Healthy, Stressed
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}
