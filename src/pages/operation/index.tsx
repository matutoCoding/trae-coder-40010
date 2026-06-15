import { useState } from 'react';
import { Search, Play, Pause, CheckCircle, Clock, ListTodo, Settings, Scissors, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTime, getStatusText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { ScheduleTask } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const OperationList = () => {
  const { tasks, machines, processes, updateTask } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('in_progress');

  const getMachineInfo = (id: string) => machines.find((m) => m.id === id);
  const getProcessInfo = (id: string) => processes.find((p) => p.id === id);

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const machine = getMachineInfo(t.machineId);
    const process = getProcessInfo(t.processId);
    const matchSearch =
      t.taskNo.includes(searchText) ||
      machine?.machineName.includes(searchText) ||
      process?.partName.includes(searchText);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStartTask = (task: ScheduleTask) => {
    updateTask({
      ...task,
      status: 'in_progress',
      actualStartTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  };

  const handlePauseTask = (task: ScheduleTask) => {
    updateTask({ ...task, status: 'paused' });
  };

  const handleCompleteTask = (task: ScheduleTask) => {
    updateTask({
      ...task,
      status: 'completed',
      completedQty: task.quantity,
      actualEndTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  };

  const columns: TableColumn<ScheduleTask>[] = [
    {
      key: 'taskNo',
      title: '任务编号',
      width: 150,
      render: (record) => (
        <span className="font-mono font-bold text-primary-600">{record.taskNo}</span>
      ),
    },
    {
      key: 'partName',
      title: '零件名称',
      width: 140,
      render: (record) => {
        const process = getProcessInfo(record.processId);
        return process?.partName || '-';
      },
    },
    {
      key: 'machine',
      title: '机床',
      width: 150,
      render: (record) => {
        const machine = getMachineInfo(record.machineId);
        return (
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-industrial-400" />
            <span>{machine?.machineName || '-'}</span>
          </div>
        );
      },
    },
    {
      key: 'progress',
      title: '加工进度',
      width: 180,
      render: (record) => {
        const pct = (record.completedQty / record.quantity) * 100;
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-industrial-400">进度</span>
              <span className="font-mono font-medium text-industrial-600">
                {record.completedQty}/{record.quantity}
              </span>
            </div>
            <div className="h-2 bg-industrial-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  pct >= 100 ? 'bg-success-500' : 'bg-primary-500'
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'operation',
      title: '工序数',
      width: 80,
      align: 'center',
      render: (record) => {
        const process = getProcessInfo(record.processId);
        return <span className="font-mono">{process?.operations.length || 0}</span>;
      },
    },
    {
      key: 'time',
      title: '实际用时',
      width: 120,
      render: (record) => {
        if (!record.actualStartTime) return '-';
        const start = new Date(record.actualStartTime).getTime();
        const end = record.actualEndTime
          ? new Date(record.actualEndTime).getTime()
          : Date.now();
        const mins = Math.floor((end - start) / 60000);
        return formatTime(mins);
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'action',
      title: '操作',
      width: 260,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          {record.status === 'pending' && (
            <Button size="sm" variant="ghost" onClick={() => handleStartTask(record)}>
              <Play className="w-4 h-4 text-success-600" />
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="sm" variant="ghost" onClick={() => handlePauseTask(record)}>
              <Pause className="w-4 h-4 text-warning-600" />
              暂停
            </Button>
          )}
          {record.status === 'paused' && (
            <Button size="sm" variant="ghost" onClick={() => handleStartTask(record)}>
              <Play className="w-4 h-4 text-success-600" />
              继续
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="sm" variant="ghost" onClick={() => handleCompleteTask(record)}>
              <CheckCircle className="w-4 h-4 text-primary-600" />
              完成
            </Button>
          )}
          <Link to={`/operation/setup?taskId=${record.id}`}>
            <Button size="sm" variant="ghost">
              <Settings className="w-4 h-4" />
              装夹
            </Button>
          </Link>
          <Link to={`/operation/deburr?taskId=${record.id}`}>
            <Button size="sm" variant="ghost">
              <Scissors className="w-4 h-4" />
              去毛刺
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">加工作业</h1>
          <p className="text-sm text-industrial-400 mt-1">加工作业任务管理</p>
        </div>
        <div className="flex gap-2">
          <Link to="/operation/setup">
            <Button variant="secondary">
              <Settings className="w-4 h-4" />
              装夹记录
            </Button>
          </Link>
          <Link to="/operation/deburr">
            <Button variant="secondary">
              <Scissors className="w-4 h-4" />
              去毛刺记录
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总作业数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{tasks.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">进行中</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {tasks.filter((t) => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 rounded-industrial text-warning-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">待开始</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {tasks.filter((t) => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">已完成</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {tasks.filter((t) => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索任务编号、机床、零件..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={statusFilter === opt.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filteredTasks} rowKey="id" />
      </Card>
    </div>
  );
};
