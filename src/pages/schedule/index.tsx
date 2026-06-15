import { useState } from 'react';
import { Search, Plus, Calendar, Clock, Play, Pause, CheckCircle, Edit, Trash2, Monitor } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatTime, getStatusText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { ScheduleTask } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const Schedule = () => {
  const { tasks, machines, processes, addTask, updateTask } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [formData, setFormData] = useState({
    taskNo: '',
    processId: '',
    machineId: '',
    plannedStartTime: '',
    plannedEndTime: '',
    quantity: '',
  });

  const getMachineInfo = (id: string) => machines.find((m) => m.id === id);
  const getProcessInfo = (id: string) => processes.find((p) => p.id === id);

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'paused', label: '已暂停' },
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

  const handleOpenModal = (task?: ScheduleTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        taskNo: task.taskNo,
        processId: task.processId,
        machineId: task.machineId,
        plannedStartTime: task.plannedStartTime.replace(' ', 'T').substring(0, 16),
        plannedEndTime: task.plannedEndTime.replace(' ', 'T').substring(0, 16),
        quantity: task.quantity.toString(),
      });
    } else {
      setEditingTask(null);
      setFormData({
        taskNo: `T-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(tasks.length + 1).padStart(3, '0')}`,
        processId: '',
        machineId: '',
        plannedStartTime: '',
        plannedEndTime: '',
        quantity: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.processId || !formData.machineId) return;

    const newTask: ScheduleTask = {
      id: editingTask?.id || `task${Date.now()}`,
      taskNo: formData.taskNo,
      processId: formData.processId,
      machineId: formData.machineId,
      plannedStartTime: formData.plannedStartTime.replace('T', ' ') + ':00',
      plannedEndTime: formData.plannedEndTime.replace('T', ' ') + ':00',
      quantity: parseInt(formData.quantity) || 0,
      completedQty: editingTask?.completedQty || 0,
      status: editingTask?.status || 'pending',
    };

    if (editingTask) {
      updateTask(newTask);
    } else {
      addTask(newTask);
    }
    setShowModal(false);
  };

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
      key: 'partNo',
      title: '零件图号',
      width: 140,
      render: (record) => {
        const process = getProcessInfo(record.processId);
        return <span className="font-mono">{process?.partNo || '-'}</span>;
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
      key: 'quantity',
      title: '计划数量',
      width: 100,
      align: 'right',
      render: (record) => <span className="font-mono">{record.quantity}</span>,
    },
    {
      key: 'completedQty',
      title: '已完成',
      width: 100,
      align: 'right',
      render: (record) => {
        const pct = (record.completedQty / record.quantity) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-industrial-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-sm w-10 text-right">{record.completedQty}</span>
          </div>
        );
      },
    },
    {
      key: 'time',
      title: '计划时间',
      width: 200,
      render: (record) => (
        <div className="text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-industrial-400" />
            <span className="text-industrial-500">
              {record.plannedStartTime.substring(0, 10)} ~ {record.plannedEndTime.substring(0, 10)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-industrial-400" />
            <span className="text-industrial-400">
              {record.plannedStartTime.substring(11, 16)} ~ {record.plannedEndTime.substring(11, 16)}
            </span>
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
    {
      key: 'action',
      title: '操作',
      width: 200,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          {record.status === 'pending' && (
            <Button size="sm" variant="ghost" onClick={() => handleStartTask(record)}>
              <Play className="w-4 h-4 text-success-600" />
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="sm" variant="ghost" onClick={() => handlePauseTask(record)}>
              <Pause className="w-4 h-4 text-warning-600" />
            </Button>
          )}
          {record.status === 'paused' && (
            <Button size="sm" variant="ghost" onClick={() => handleStartTask(record)}>
              <Play className="w-4 h-4 text-success-600" />
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="sm" variant="ghost" onClick={() => handleCompleteTask(record)}>
              <CheckCircle className="w-4 h-4 text-primary-600" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(record)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-danger-500 hover:text-danger-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">机床排产</h1>
          <p className="text-sm text-industrial-400 mt-1">机床任务排产管理</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          新增排产
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总任务数</p>
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
              <p className="text-sm text-industrial-400">待处理</p>
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
              onChange={(v) => setSearchText(v)}
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? '编辑排产任务' : '新增排产任务'}
        width={600}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="任务编号"
              value={formData.taskNo}
              onChange={(v) => setFormData({ ...formData, taskNo: v })}
            />
            <Input
              label="计划数量"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(v) => setFormData({ ...formData, quantity: v })}
            />
          </div>
          <Select
            label="选择工艺"
            value={formData.processId}
            onChange={(v) => setFormData({ ...formData, processId: v })}
            options={[
              { value: '', label: '请选择...' },
              ...processes.map((p) => ({
                value: p.id,
                label: `${p.partNo} - ${p.partName} (${getStatusText(p.status)})`,
              })),
            ]}
          />
          <Select
            label="选择机床"
            value={formData.machineId}
            onChange={(v) => setFormData({ ...formData, machineId: v })}
            options={[
              { value: '', label: '请选择...' },
              ...machines
                .filter((m) => m.status !== 'error' && m.status !== 'maintenance')
                .map((m) => ({
                  value: m.id,
                  label: `${m.machineNo} - ${m.machineName} (${getStatusText(m.status)})`,
                })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="计划开始时间"
              type="datetime-local"
              value={formData.plannedStartTime}
              onChange={(v) => setFormData({ ...formData, plannedStartTime: v })}
            />
            <Input
              label="计划结束时间"
              type="datetime-local"
              value={formData.plannedEndTime}
              onChange={(v) => setFormData({ ...formData, plannedEndTime: v })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
