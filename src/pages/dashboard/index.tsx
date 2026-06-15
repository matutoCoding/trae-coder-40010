import {
  Activity,
  Cpu,
  ClipboardList,
  Wrench,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Gauge,
  PlayCircle,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { formatNumber, formatPercent } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const oeeData = [
  { time: '08:00', oee: 78 },
  { time: '09:00', oee: 82 },
  { time: '10:00', oee: 75 },
  { time: '11:00', oee: 79 },
  { time: '12:00', oee: 45 },
  { time: '13:00', oee: 85 },
  { time: '14:00', oee: 88 },
  { time: '15:00', oee: 84 },
  { time: '16:00', oee: 76 },
  { time: '17:00', oee: 72 },
];

const outputData = [
  { date: '6/10', qty: 120 },
  { date: '6/11', qty: 135 },
  { date: '6/12', qty: 128 },
  { date: '6/13', qty: 142 },
  { date: '6/14', qty: 138 },
  { date: '6/15', qty: 145 },
];

const statusData = [
  { name: '运行中', value: 4, color: '#00B42A' },
  { name: '空闲', value: 2, color: '#86909C' },
  { name: '维护中', value: 1, color: '#FF7D00' },
  { name: '故障', value: 1, color: '#F53F3F' },
];

export const Dashboard = () => {
  const { dashboardStats, machines, tasks, alerts } = useAppStore();

  const machineColumns: TableColumn<typeof machines[0]>[] = [
    { key: 'machineNo', title: '设备编号', width: 120 },
    { key: 'machineName', title: '设备名称', width: 160 },
    { key: 'machineType', title: '类型', width: 120 },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'loadRate',
      title: '负载率',
      width: 120,
      render: (record) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-industrial-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                record.loadRate > 80 ? 'bg-danger-500' : record.loadRate > 60 ? 'bg-warning-500' : 'bg-success-500'
              )}
              style={{ width: `${record.loadRate}%` }}
            />
          </div>
          <span className="data-number text-sm w-12 text-right">{record.loadRate}%</span>
        </div>
      ),
    },
  ];

  const taskColumns: TableColumn<typeof tasks[0]>[] = [
    { key: 'taskNo', title: '任务编号', width: 140 },
    {
      key: 'processId',
      title: '零件',
      width: 180,
      render: (record) => {
        const process = useAppStore.getState().processes.find((p) => p.id === record.processId);
        return process ? `${process.partNo} - ${process.partName}` : record.processId;
      },
    },
    {
      key: 'machineId',
      title: '机床',
      width: 140,
      render: (record) => {
        const machine = machines.find((m) => m.id === record.machineId);
        return machine?.machineName || record.machineId;
      },
    },
    {
      key: 'quantity',
      title: '进度',
      width: 150,
      render: (record) => (
        <div className="flex items-center gap-2">
          <span className="data-number text-sm">
            {record.completedQty}/{record.quantity}
          </span>
          <div className="flex-1 h-2 bg-industrial-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${(record.completedQty / record.quantity) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.status} />,
    },
  ];

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">生产总览</h1>
          <p className="text-sm text-industrial-400 mt-1">实时监控车间生产状态</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Clock className="w-4 h-4" />
            刷新数据
          </Button>
          <Button size="sm">
            <BarChart3 className="w-4 h-4" />
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="设备OEE"
          value={`${dashboardStats.oee}%`}
          icon={<Gauge className="w-6 h-6" />}
          trend={2.3}
          trendLabel="较昨日"
          valueClassName="text-primary-600"
        />
        <StatCard
          title="今日产量"
          value={dashboardStats.todayCompletedQty}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend={5.2}
          trendLabel="较昨日"
          valueClassName="text-success-600"
        />
        <StatCard
          title="运行设备"
          value={`${dashboardStats.runningMachines}/${dashboardStats.totalMachines}`}
          icon={<Cpu className="w-6 h-6" />}
          valueClassName="text-primary-600"
        />
        <StatCard
          title="刀具告警"
          value={dashboardStats.toolAlerts}
          icon={<AlertTriangle className="w-6 h-6" />}
          valueClassName="text-danger-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="OEE趋势" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
                <XAxis dataKey="time" stroke="#86909C" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#86909C" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E6EB',
                    borderRadius: '2px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="oee"
                  stroke="#165DFF"
                  strokeWidth={2}
                  dot={{ fill: '#165DFF', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="设备状态分布">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-industrial-600">
                  {item.name}: {item.value}台
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="设备状态" className="lg:col-span-2" extra={<Button size="sm" variant="ghost">查看全部</Button>}>
          <div className="h-64">
            <Table columns={machineColumns} data={machines} rowKey="id" />
          </div>
        </Card>

        <Card title="告警信息" extra={<Button size="sm" variant="ghost">全部告警</Button>}>
          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-industrial border border-industrial-100 hover:border-primary-200 transition-colors cursor-pointer',
                  !alert.read && 'bg-primary-50/30 border-primary-100'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      alert.level === 'error' ? 'bg-danger-50 text-danger-500' : 'bg-warning-50 text-warning-500'
                    )}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-industrial-600">{alert.title}</span>
                      {!alert.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </div>
                    <p className="text-xs text-industrial-400 mt-0.5 line-clamp-2">{alert.message}</p>
                    <span className="text-xs text-industrial-300 mt-1 block">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="进行中的任务" className="lg:col-span-2" extra={<Button size="sm" variant="ghost">排产管理</Button>}>
          <div className="h-64">
            <Table columns={taskColumns} data={inProgressTasks} rowKey="id" />
          </div>
        </Card>

        <Card title="近6日产量">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
                <XAxis dataKey="date" stroke="#86909C" fontSize={12} />
                <YAxis stroke="#86909C" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E6EB',
                    borderRadius: '2px',
                  }}
                />
                <Bar dataKey="qty" fill="#165DFF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-industrial-400">合格率</span>
            <span className="font-mono font-medium text-success-600">{formatPercent(dashboardStats.passRate)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
