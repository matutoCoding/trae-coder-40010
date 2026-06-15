import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/dashboard';
import { ProcessList } from '@/pages/process';
import { ProgramList } from '@/pages/program';
import { ProgramEditor } from '@/pages/program/editor';
import { ToolList } from '@/pages/tool';
import { ToolCompensationPage } from '@/pages/tool/compensation';
import { Schedule } from '@/pages/schedule';
import { OperationList } from '@/pages/operation';
import { SetupRecords } from '@/pages/operation/setup';
import { DeburrRecords } from '@/pages/operation/deburr';
import { InspectionList } from '@/pages/inspection';
import { FirstInspection } from '@/pages/inspection/first';
import { OnlineMeasurement } from '@/pages/inspection/online';
import { ToolLifeOverview } from '@/pages/tool-life';
import { WearRecords } from '@/pages/tool-life/wear';
import { RepairRecords } from '@/pages/tool-life/repair';
import { Statistics } from '@/pages/statistics';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'process', element: <ProcessList /> },
      { path: 'program', element: <ProgramList /> },
      { path: 'program/:id', element: <ProgramEditor /> },
      { path: 'tool', element: <ToolList /> },
      { path: 'tool/compensation', element: <ToolCompensationPage /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'operation', element: <OperationList /> },
      { path: 'operation/setup', element: <SetupRecords /> },
      { path: 'operation/deburr', element: <DeburrRecords /> },
      { path: 'inspection', element: <InspectionList /> },
      { path: 'inspection/first', element: <FirstInspection /> },
      { path: 'inspection/online', element: <OnlineMeasurement /> },
      { path: 'tool-life', element: <ToolLifeOverview /> },
      { path: 'tool-life/wear', element: <WearRecords /> },
      { path: 'tool-life/repair', element: <RepairRecords /> },
      { path: 'statistics', element: <Statistics /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
