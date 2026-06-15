import { create } from 'zustand';
import type {
  Process,
  NCProgram,
  Tool,
  ToolCompensation,
  Machine,
  ScheduleTask,
  SetupRecord,
  FirstInspection,
  OnlineMeasurement,
  ToolWearRecord,
  ToolRepair,
  DeburrRecord,
  CycleTimeStat,
  DashboardStats,
  AlertItem,
} from '@/types';
import {
  mockProcesses,
  mockPrograms,
  mockTools,
  mockCompensations,
  mockMachines,
  mockTasks,
  mockSetupRecords,
  mockInspections,
  mockOnlineMeasurements,
  mockWearRecords,
  mockRepairs,
  mockDeburrRecords,
  mockCycleTimeStats,
  mockDashboardStats,
  mockAlerts,
} from '@/mock/data';

interface AppState {
  processes: Process[];
  programs: NCProgram[];
  tools: Tool[];
  compensations: ToolCompensation[];
  machines: Machine[];
  tasks: ScheduleTask[];
  setupRecords: SetupRecord[];
  inspections: FirstInspection[];
  onlineMeasurements: OnlineMeasurement[];
  wearRecords: ToolWearRecord[];
  repairs: ToolRepair[];
  deburrRecords: DeburrRecord[];
  cycleTimeStats: CycleTimeStat[];
  dashboardStats: DashboardStats;
  alerts: AlertItem[];
  sidebarCollapsed: boolean;
  selectedTaskId: string | null;
  selectedToolId: string | null;

  toggleSidebar: () => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedToolId: (id: string | null) => void;
  markAlertRead: (id: string) => void;
  addTask: (task: ScheduleTask) => void;
  updateTask: (task: ScheduleTask) => void;
  addTool: (tool: Tool) => void;
  updateTool: (tool: Tool) => void;
  addCompensation: (comp: ToolCompensation) => void;
  addWearRecord: (record: ToolWearRecord) => void;
  addRepair: (repair: ToolRepair) => void;
  addSetupRecord: (record: SetupRecord) => void;
  addInspection: (inspection: FirstInspection) => void;
  addDeburrRecord: (record: DeburrRecord) => void;
  updateRepair: (repair: ToolRepair) => void;
  updateWearRecord: (record: ToolWearRecord) => void;
}

export const useAppStore = create<AppState>((set) => ({
  processes: mockProcesses,
  programs: mockPrograms,
  tools: mockTools,
  compensations: mockCompensations,
  machines: mockMachines,
  tasks: mockTasks,
  setupRecords: mockSetupRecords,
  inspections: mockInspections,
  onlineMeasurements: mockOnlineMeasurements,
  wearRecords: mockWearRecords,
  repairs: mockRepairs,
  deburrRecords: mockDeburrRecords,
  cycleTimeStats: mockCycleTimeStats,
  dashboardStats: mockDashboardStats,
  alerts: mockAlerts,
  sidebarCollapsed: false,
  selectedTaskId: null,
  selectedToolId: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSelectedToolId: (id) => set({ selectedToolId: id }),

  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  addTool: (tool) => set((state) => ({ tools: [...state.tools, tool] })),
  updateTool: (tool) =>
    set((state) => ({
      tools: state.tools.map((t) => (t.id === tool.id ? tool : t)),
    })),

  addCompensation: (comp) =>
    set((state) => ({ compensations: [...state.compensations, comp] })),

  addWearRecord: (record) =>
    set((state) => ({ wearRecords: [...state.wearRecords, record] })),

  addRepair: (repair) =>
    set((state) => ({ repairs: [...state.repairs, repair] })),

  addSetupRecord: (record) =>
    set((state) => ({ setupRecords: [...state.setupRecords, record] })),

  addInspection: (inspection) =>
    set((state) => ({ inspections: [...state.inspections, inspection] })),

  addDeburrRecord: (record) =>
    set((state) => ({ deburrRecords: [...state.deburrRecords, record] })),

  updateRepair: (repair) =>
    set((state) => ({
      repairs: state.repairs.map((r) => (r.id === repair.id ? repair : r)),
    })),

  updateWearRecord: (record) =>
    set((state) => ({
      wearRecords: state.wearRecords.map((r) => (r.id === record.id ? record : r)),
    })),
}));
