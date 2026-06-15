import { useState } from 'react';
import { Search, Plus, AlertOctagon, Clock, Wrench, DollarSign, Save, FileText, CheckCircle, Trash2, XCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getToolTypeText, getStatusText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { ToolRepair } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const RepairRecords = () => {
  const { repairs, tools, tasks, addRepair, updateRepair } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<ToolRepair | null>(null);
  const [formData, setFormData] = useState({
    toolId: '',
    taskId: '',
    reporter: '',
    reason: '',
    repairCost: '',
    repairStatus: 'pending' as 'pending' | 'repairing' | 'repaired' | 'scrapped',
  });

  const getToolInfo = (id: string) => tools.find((t) => t.id === id);
  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'repairing', label: '维修中' },
    { value: 'repaired', label: '已修复' },
    { value: 'scrapped', label: '已报废' },
  ];

  const filteredRepairs = repairs.filter((r) => {
    const tool = getToolInfo(r.toolId);
    const task = getTaskInfo(r.taskId || '');
    const matchSearch =
      r.reason.includes(searchText) ||
      r.reporter.includes(searchText) ||
      tool?.toolNo.includes(searchText) ||
      task?.taskNo.includes(searchText);
    const matchStatus = statusFilter === 'all' || r.repairStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (!formData.toolId || !formData.reason) return;

    const newRepair: ToolRepair = {
      id: `repair${Date.now()}`,
      toolId: formData.toolId,
      taskId: formData.taskId || undefined,
      reportTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reporter: formData.reporter || '系统',
      reason: formData.reason,
      repairStatus: formData.repairStatus,
      repairCost: parseFloat(formData.repairCost) || undefined,
      repairTime:
        formData.repairStatus === 'repaired' || formData.repairStatus === 'scrapped'
          ? new Date().toISOString().replace('T', ' ').substring(0, 19)
          : undefined,
    };

    addRepair(newRepair);
    setShowModal(false);
  };

  const handleUpdateStatus = (repair: ToolRepair, status: 'repairing' | 'repaired' | 'scrapped') => {
    const updated: ToolRepair = {
      ...repair,
      repairStatus: status,
      repairTime:
        status === 'repaired' || status === 'scrapped'
          ? new Date().toISOString().replace('T', ' ').substring(0, 19)
          : repair.repairTime,
    };
    updateRepair(updated);
  };

  const columns: TableColumn<ToolRepair>[] = [
    {
      key: 'reportTime',
      title: '报修时间',
      width: 170,
      render: (record) => (
        <span className="font-mono text-sm text-industrial-500">{record.reportTime}</span>
      ),
    },
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 140,
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        return <span className="font-mono font-bold text-danger-600">{tool?.toolNo || '-'}</span>;
      },
    },
    {
      key: 'toolName',
      title: '刀具名称',
      width: 120,
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        return tool?.toolName || '-';
      },
    },
    {
      key: 'taskNo',
      title: '关联任务',
      width: 140,
      render: (record) => {
        const task = getTaskInfo(record.taskId || '');
        return task ? <span className="font-mono">{task.taskNo}</span> : '-';
      },
    },
    {
      key: 'reporter',
      title: '报修人',
      width: 100,
    },
    {
      key: 'reason',
      title: '故障原因',
      width: 200,
      render: (record) => (
        <span className="text-sm" title={record.reason}>
          {record.reason.length > 20 ? record.reason.substring(0, 20) + '...' : record.reason}
        </span>
      ),
    },
    {
      key: 'repairCost',
      title: '维修费用',
      width: 110,
      align: 'center',
      render: (record) => (
        <span className="font-mono">
          {record.repairCost !== undefined ? `¥${record.repairCost}` : '-'}
        </span>
      ),
    },
    {
      key: 'repairStatus',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.repairStatus} />,
    },
    {
      key: 'action',
      title: '操作',
      width: 200,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          {record.repairStatus === 'pending' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUpdateStatus(record, 'repairing')}
            >
              <Wrench className="w-4 h-4 text-primary-600" />
              维修
            </Button>
          )}
          {record.repairStatus === 'repairing' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUpdateStatus(record, 'repaired')}
            >
              <CheckCircle className="w-4 h-4 text-success-600" />
              完成
            </Button>
          )}
          {record.repairStatus !== 'scrapped' && (
            <Button
              size="sm"
              variant="ghost"
              className="text-danger-500"
              onClick={() => handleUpdateStatus(record, 'scrapped')}
            >
              <XCircle className="w-4 h-4" />
              报废
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setViewDetail(record)}>
            <FileText className="w-4 h-4" />
            详情
          </Button>
        </div>
      ),
    },
  ];

  const totalCost = repairs.reduce((sum, r) => sum + (r.repairCost || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">断刀报修登记</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具损坏报修与维修记录管理</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新增报修
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总报修数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{repairs.length}</p>
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
                {repairs.filter((r) => r.repairStatus === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-50 rounded-industrial text-danger-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">已报废</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {repairs.filter((r) => r.repairStatus === 'scrapped').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">累计维修费用</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">¥{totalCost}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索故障原因、报修人、刀具编号..."
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

        <Table columns={columns} data={filteredRepairs} rowKey="id" />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="新增断刀报修"
        width={600}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              提交
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="选择刀具"
              value={formData.toolId}
              onChange={(v) => setFormData({ ...formData, toolId: v })}
              options={[
                { value: '', label: '请选择...' },
                ...tools.map((t) => ({
                  value: t.id,
                  label: `${t.toolNo} - ${t.toolName} (${getToolTypeText(t.toolType)})`,
                })),
              ]}
            />
            <Select
              label="关联任务"
              value={formData.taskId}
              onChange={(v) => setFormData({ ...formData, taskId: v })}
              options={[
                { value: '', label: '请选择...' },
                ...tasks
                  .filter((t) => t.status === 'in_progress')
                  .map((t) => ({
                    value: t.id,
                    label: `${t.taskNo} - ${getStatusText(t.status)}`,
                  })),
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="报修人"
              value={formData.reporter}
              onChange={(v) => setFormData({ ...formData, reporter: v })}
            />
            <Input
              label="预估维修费用"
              type="number"
              value={formData.repairCost}
              onChange={(v) => setFormData({ ...formData, repairCost: v })}
            />
          </div>
          <Input
            label="故障原因描述"
            value={formData.reason}
            onChange={(v) => setFormData({ ...formData, reason: v })}
            multiline
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        open={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title="报修详情"
        width={600}
        footer={
          <Button variant="secondary" onClick={() => setViewDetail(null)}>
            关闭
          </Button>
        }
      >
        {viewDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">刀具编号</p>
                <p className="font-mono font-medium mt-1 text-danger-600">
                  {getToolInfo(viewDetail.toolId)?.toolNo || '-'}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">刀具名称</p>
                <p className="font-medium mt-1">{getToolInfo(viewDetail.toolId)?.toolName || '-'}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">报修人</p>
                <p className="font-medium mt-1">{viewDetail.reporter}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">报修时间</p>
                <p className="text-sm mt-1">{viewDetail.reportTime}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">维修状态</p>
                <div className="mt-1">
                  <StatusBadge status={viewDetail.repairStatus} />
                </div>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">维修费用</p>
                <p className="font-mono font-medium mt-1">
                  {viewDetail.repairCost !== undefined ? `¥${viewDetail.repairCost}` : '-'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-industrial-50 rounded-industrial">
              <p className="text-xs text-industrial-400">故障原因</p>
              <p className="text-sm mt-1">{viewDetail.reason}</p>
            </div>
            {viewDetail.repairTime && (
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">
                  {viewDetail.repairStatus === 'scrapped' ? '报废时间' : '修复时间'}
                </p>
                <p className="text-sm mt-1">{viewDetail.repairTime}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

function updateRepair(repair: ToolRepair) {
  const { repairs } = useAppStore.getState();
  useAppStore.setState({
    repairs: repairs.map((r) => (r.id === repair.id ? repair : r)),
  });
}
