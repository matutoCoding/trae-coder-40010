import { useState } from 'react';
import { Search, Plus, Scissors, CheckCircle, Clock, Edit, Trash2, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getStatusText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { DeburrRecord } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const DeburrRecords = () => {
  const { deburrRecords, tasks, processes, addDeburrRecord } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<DeburrRecord | null>(null);
  const [formData, setFormData] = useState({
    taskId: '',
    operator: '',
    startTime: '',
    endTime: '',
    quantity: '',
    qualityCheck: 'pass' as 'pass' | 'fail',
    remark: '',
  });

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);
  const getProcessInfo = (id: string) => processes.find((p) => p.id === id);
  const getPartNameByTask = (taskId: string) => {
    const task = getTaskInfo(taskId);
    if (!task) return '-';
    const process = getProcessInfo(task.processId);
    return process ? process.partName : '-';
  };
  const getPartNoByTask = (taskId: string) => {
    const task = getTaskInfo(taskId);
    if (!task) return '-';
    const process = getProcessInfo(task.processId);
    return process ? process.partNo : '-';
  };

  const filteredRecords = deburrRecords.filter((r) => {
    const task = getTaskInfo(r.taskId);
    return (
      r.operator.includes(searchText) ||
      task?.taskNo.includes(searchText) ||
      r.remark?.includes(searchText)
    );
  });

  const handleSave = () => {
    if (!formData.taskId || !formData.startTime || !formData.endTime) return;

    const newRecord: DeburrRecord = {
      id: `deburr${Date.now()}`,
      taskId: formData.taskId,
      operator: formData.operator || '系统',
      startTime: formData.startTime.replace('T', ' ') + ':00',
      endTime: formData.endTime.replace('T', ' ') + ':00',
      quantity: parseInt(formData.quantity) || 0,
      qualityCheck: formData.qualityCheck,
      remark: formData.remark,
    };

    addDeburrRecord(newRecord);
    setShowModal(false);
  };

  const getDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.round((e - s) / 60000);
  };

  const columns: TableColumn<DeburrRecord>[] = [
    {
      key: 'taskNo',
      title: '任务编号',
      width: 150,
      render: (record) => {
        const task = getTaskInfo(record.taskId);
        return <span className="font-mono font-bold text-primary-600">{task?.taskNo || '-'}</span>;
      },
    },
    {
      key: 'partName',
      title: '零件名称',
      width: 160,
      render: (record) => {
        const partName = getPartNameByTask(record.taskId);
        const partNo = getPartNoByTask(record.taskId);
        return (
          <div>
            <p className="font-medium text-industrial-600">{partName}</p>
            <p className="text-xs text-industrial-400 font-mono">{partNo}</p>
          </div>
        );
      },
    },
    {
      key: 'operator',
      title: '操作人员',
      width: 100,
    },
    {
      key: 'quantity',
      title: '去毛刺数量',
      width: 120,
      align: 'center',
      render: (record) => <span className="font-mono">{record.quantity} 件</span>,
    },
    {
      key: 'duration',
      title: '用时',
      width: 100,
      align: 'center',
      render: (record) => {
        const mins = getDuration(record.startTime, record.endTime);
        return (
          <span className="font-mono">
            {mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60}m` : `${mins}m`}
          </span>
        );
      },
    },
    {
      key: 'efficiency',
      title: '效率',
      width: 120,
      align: 'center',
      render: (record) => {
        const mins = getDuration(record.startTime, record.endTime);
        const perHour = (record.quantity / (mins / 60)).toFixed(1);
        return <span className="font-mono">{perHour} 件/小时</span>;
      },
    },
    {
      key: 'qualityCheck',
      title: '质量检查',
      width: 100,
      render: (record) => <StatusBadge status={record.qualityCheck} />,
    },
    {
      key: 'time',
      title: '时间段',
      width: 200,
      render: (record) => (
        <div className="text-xs">
          <div className="text-industrial-500">{record.startTime}</div>
          <div className="text-industrial-400">至 {record.endTime}</div>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setViewDetail(record)}>
            <FileText className="w-4 h-4" />
            详情
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">工件去毛刺记录</h1>
          <p className="text-sm text-industrial-400 mt-1">工件去毛刺作业记录管理</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新增记录
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总记录数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{deburrRecords.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">合格数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {deburrRecords.filter((r) => r.qualityCheck === 'pass').length}
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
              <p className="text-sm text-industrial-400">总工时</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {Math.round(
                  deburrRecords.reduce((sum, r) => sum + getDuration(r.startTime, r.endTime), 0) / 60
                )}{' '}
                小时
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-industrial-50 rounded-industrial text-industrial-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总数量</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {deburrRecords.reduce((sum, r) => sum + r.quantity, 0)} 件
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
              placeholder="搜索任务编号、操作人员..."
              className="pl-9"
              value={searchText}
              onChange={(v) => setSearchText(v)}
            />
          </div>
        </div>

        <Table columns={columns} data={filteredRecords} rowKey="id" />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="新增去毛刺记录"
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
          <Select
            label="选择任务"
            value={formData.taskId}
            onChange={(v) => setFormData({ ...formData, taskId: v })}
            options={[
              { value: '', label: '请选择...' },
              ...tasks
                .filter((t) => t.status === 'completed' || t.status === 'in_progress')
                .map((t) => ({
                  value: t.id,
                  label: `${t.taskNo} - ${getStatusText(t.status)}`,
                })),
            ]}
          />
          {formData.taskId && (
            <div className="p-3 bg-primary-50 rounded-industrial">
              <p className="text-xs text-industrial-400">对应零件</p>
              <p className="font-medium text-primary-700 mt-1">
                {getPartNameByTask(formData.taskId)}
                <span className="ml-2 text-xs text-industrial-500 font-mono">
                  ({getPartNoByTask(formData.taskId)})
                </span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="操作人员"
              value={formData.operator}
              onChange={(v) => setFormData({ ...formData, operator: v })}
            />
            <Input
              label="去毛刺数量"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(v) => setFormData({ ...formData, quantity: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="开始时间"
              type="datetime-local"
              value={formData.startTime}
              onChange={(v) => setFormData({ ...formData, startTime: v })}
            />
            <Input
              label="结束时间"
              type="datetime-local"
              value={formData.endTime}
              onChange={(v) => setFormData({ ...formData, endTime: v })}
            />
          </div>
          <Select
            label="质量检查结果"
            value={formData.qualityCheck}
            onChange={(v) => setFormData({ ...formData, qualityCheck: v as 'pass' | 'fail' })}
            options={[
              { value: '', label: '请选择...' },
              { value: 'pass', label: '合格' },
              { value: 'fail', label: '不合格' },
            ]}
          />
          <Input
            label="备注"
            value={formData.remark}
            onChange={(v) => setFormData({ ...formData, remark: v })}
            multiline
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        open={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title="去毛刺记录详情"
        width={600}
        footer={
          <Button variant="secondary" onClick={() => setViewDetail(null)}>
            关闭
          </Button>
        }
      >
        {viewDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">任务编号</p>
                <p className="font-mono font-medium mt-1">
                  {getTaskInfo(viewDetail.taskId)?.taskNo || '-'}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-industrial">
                <p className="text-xs text-industrial-400">零件名称</p>
                <p className="font-medium mt-1 text-primary-700">
                  {getPartNameByTask(viewDetail.taskId)}
                </p>
                <p className="text-xs font-mono text-industrial-400">
                  {getPartNoByTask(viewDetail.taskId)}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">操作人员</p>
                <p className="font-medium mt-1">{viewDetail.operator}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">数量</p>
                <p className="font-mono font-medium mt-1">{viewDetail.quantity} 件</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">开始时间</p>
                <p className="text-sm mt-1">{viewDetail.startTime}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">结束时间</p>
                <p className="text-sm mt-1">{viewDetail.endTime}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">用时</p>
                <p className="font-mono font-medium mt-1">
                  {getDuration(viewDetail.startTime, viewDetail.endTime)} 分钟
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">质量检查</p>
                <div className="mt-1">
                  <StatusBadge status={viewDetail.qualityCheck} />
                </div>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">效率</p>
                <p className="font-mono font-medium mt-1">
                  {(
                    viewDetail.quantity /
                    (getDuration(viewDetail.startTime, viewDetail.endTime) / 60)
                  ).toFixed(1)}{' '}
                  件/小时
                </p>
              </div>
            </div>
            {viewDetail.remark && (
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">备注</p>
                <p className="text-sm mt-1">{viewDetail.remark}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
