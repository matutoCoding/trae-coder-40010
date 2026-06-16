export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export type ProcessStatus = 'draft' | 'approved' | 'obsolete';
export type ProgramStatus = 'draft' | 'verified' | 'released';
export type ToolStatus = 'available' | 'in_use' | 'worn' | 'broken';
export type ToolType = 'endmill' | 'drill' | 'turning' | 'boring' | 'other';
export type MachineStatus = 'idle' | 'running' | 'maintenance' | 'error';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'paused';
export type ResultStatus = 'pass' | 'fail';
export type RepairStatus = 'pending' | 'repairing' | 'repaired' | 'scrapped';

export interface ProcessParameter {
  name: string;
  value: string;
  unit: string;
}

export interface ProcessOperation {
  id: string;
  operationNo: number;
  operationName: string;
  machineType: string;
  toolList: string[];
  parameters: ProcessParameter[];
  setupTime: number;
  cycleTime: number;
}

export interface Process {
  id: string;
  partNo: string;
  partName: string;
  drawingNo: string;
  material: string;
  quantity: number;
  operations: ProcessOperation[];
  version: string;
  status: ProcessStatus;
  createTime: string;
  updateTime: string;
}

export interface NCProgram {
  id: string;
  programNo: string;
  programName: string;
  processId: string;
  machineType: string;
  content: string;
  version: string;
  status: ProgramStatus;
  createTime: string;
  updateTime: string;
}

export interface Tool {
  id: string;
  toolNo: string;
  toolName: string;
  toolType: ToolType;
  diameter: number;
  length: number;
  material: string;
  manufacturer: string;
  totalLife: number;
  usedLife: number;
  status: ToolStatus;
  stock: number;
  minStock: number;
}

export interface ToolCompensation {
  id: string;
  toolId: string;
  offsetNo: string;
  lengthOffset: number;
  radiusOffset: number;
  wearOffset: number;
  effectiveDate: string;
  operator: string;
}

export interface Machine {
  id: string;
  machineNo: string;
  machineName: string;
  machineType: string;
  status: MachineStatus;
  currentTaskId?: string;
  loadRate: number;
}

export interface ScheduleTask {
  id: string;
  taskNo: string;
  processId: string;
  process?: Process;
  machineId: string;
  machine?: Machine;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  quantity: number;
  completedQty: number;
  status: TaskStatus;
}

export interface AlignmentPoint {
  pointName: string;
  x: number;
  y: number;
  z: number;
  deviation: number;
}

export interface SetupRecord {
  id: string;
  taskId: string;
  task?: ScheduleTask;
  machineId: string;
  machine?: Machine;
  fixtureNo: string;
  alignmentData: AlignmentPoint[];
  operator: string;
  setupTime: number;
  result: ResultStatus;
  createTime: string;
}

export interface InspectionItem {
  id: string;
  featureName: string;
  nominal: number;
  upperTolerance: number;
  lowerTolerance: number;
  measuredValue: number;
  result: ResultStatus;
}

export interface FirstInspection {
  id: string;
  taskId: string;
  task?: ScheduleTask;
  partNo: string;
  inspector: string;
  inspectionItems: InspectionItem[];
  result: ResultStatus;
  createTime: string;
}

export interface OnlineMeasurement {
  id: string;
  taskId: string;
  task?: ScheduleTask;
  timestamp: string;
  feature: string;
  measuredValue: number;
  deviation: number;
  temperature?: number;
}

export interface ToolWearRecord {
  id: string;
  toolId: string;
  tool?: Tool;
  recordTime: string;
  wearAmount: number;
  machiningTime: number;
  workpieceCount: number;
}

export interface ToolRepair {
  id: string;
  toolId: string;
  tool?: Tool;
  taskId?: string;
  task?: ScheduleTask;
  reportTime: string;
  reporter: string;
  reason: string;
  repairStatus: RepairStatus;
  repairCost?: number;
  repairTime?: string;
}

export interface DeburrRecord {
  id: string;
  taskId: string;
  task?: ScheduleTask;
  operator: string;
  startTime: string;
  endTime: string;
  quantity: number;
  qualityCheck: ResultStatus;
  remark?: string;
}

export interface CycleTimeStat {
  id: string;
  taskId: string;
  task?: ScheduleTask;
  operationNo: number;
  partNo: string;
  avgCycleTime: number;
  minCycleTime: number;
  maxCycleTime: number;
  sampleCount: number;
  date: string;
}

export interface DashboardStats {
  totalMachines: number;
  runningMachines: number;
  pendingTasks: number;
  inProgressTasks: number;
  todayCompletedQty: number;
  toolAlerts: number;
  oee: number;
  passRate: number;
}

export interface AlertItem {
  id: string;
  type: 'tool' | 'machine' | 'quality' | 'schedule';
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ToolReceiveRecord {
  id: string;
  toolId: string;
  tool?: Tool;
  machineId: string;
  machine?: Machine;
  operator: string;
  quantity: number;
  receiveTime: string;
}
