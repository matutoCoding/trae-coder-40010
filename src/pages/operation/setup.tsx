import { useState } from 'react';
import { Search, Plus, Settings, Crosshair, Clock, CheckCircle, XCircle, Edit, Trash2, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatNumber, getStatusText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { SetupRecord, AlignmentPoint } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const SetupRecords = () => {
  const { setupRecords, tasks, machines, addSetupRecord } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewDetail, setViewDetail] = useState<SetupRecord | null>(null);
  const [formData, setFormData] = useState({
    taskId: '',
    machineId: '',
    fixtureNo: '',
    operator: '',
    setupTime: '',
    result: 'pass' as 'pass' | 'fail',
    alignmentData: [
      { pointName: '原点A', x: 0, y: 0, z: 0, deviation: 0 },
    ] as AlignmentPoint[],
  });

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);
  const getMachineInfo = (id: string) => machines.find((m) => m.id === id);

  const filteredRecords = setupRecords.filter((r) => {
    const task = getTaskInfo(r.taskId);
    const machine = getMachineInfo(r.machineId);
    return (
      r.fixtureNo.includes(searchText) ||
      task?.taskNo.includes(searchText) ||
      machine?.machineName.includes(searchText)
    );
  });

  const handleAddPoint = () => {
    setFormData({
      ...formData,
      alignmentData: [
        ...formData.alignmentData,
        { pointName: `基准${String.fromCharCode(65 + formData.alignmentData.length)}`, x: 0, y: 0, z: 0, deviation: 0 },
      ],
    });
  };

  const handleRemovePoint = (index: number) => {
    if (formData.alignmentData.length > 1) {
      setFormData({
        ...formData,
        alignmentData: formData.alignmentData.filter((_, i) => i !== index),
      });
    }
  };

  const handleUpdatePoint = (index: number, field: keyof AlignmentPoint, value: number | string) => {
    const newData = [...formData.alignmentData];
    (newData[index] as any)[field] = value;
    if (field === 'x' || field === 'y' || field === 'z') {
      newData[index].deviation = Math.sqrt(
        Math.pow(newData[index].x, 2) +
        Math.pow(newData[index].y, 2) +
        Math.pow(newData[index].z, 2)
      );
    }
    setFormData({ ...formData, alignmentData: newData });
  };

  const handleSave = () => {
    if (!formData.taskId || !formData.machineId) return;

    const maxDeviation = Math.max(...formData.alignmentData.map((p) => p.deviation));
    const result = maxDeviation > 0.01 ? 'fail' : 'pass';

    const newRecord: SetupRecord = {
      id: `setup${Date.now()}`,
      taskId: formData.taskId,
      machineId: formData.machineId,
      fixtureNo: formData.fixtureNo,
      operator: formData.operator || '系统',
      setupTime: parseInt(formData.setupTime) || 0,
      result: result,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      alignmentData: formData.alignmentData,
    };

    addSetupRecord(newRecord);
    setShowModal(false);
  };

  const columns: TableColumn<SetupRecord>[] = [
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
      key: 'machine',
      title: '机床',
      width: 150,
      render: (record) => {
        const machine = getMachineInfo(record.machineId);
        return machine?.machineName || '-';
      },
    },
    {
      key: 'fixtureNo',
      title: '夹具编号',
      width: 120,
      render: (record) => <span className="font-mono">{record.fixtureNo}</span>,
    },
    {
      key: 'points',
      title: '找正点数',
      width: 100,
      align: 'center',
      render: (record) => <span className="font-mono">{record.alignmentData.length}</span>,
    },
    {
      key: 'maxDeviation',
      title: '最大偏差',
      width: 120,
      align: 'center',
      render: (record) => {
        const maxDev = Math.max(...record.alignmentData.map((p) => p.deviation));
        return (
          <span
            className={cn(
              'font-mono font-medium',
              maxDev > 0.01 ? 'text-danger-600' : 'text-success-600'
            )}
          >
            {formatNumber(maxDev, 4)} mm
          </span>
        );
      },
    },
    {
      key: 'setupTime',
      title: '装夹用时',
      width: 100,
      align: 'center',
      render: (record) => <span className="font-mono">{record.setupTime} 分钟</span>,
    },
    {
      key: 'operator',
      title: '操作人员',
      width: 100,
    },
    {
      key: 'result',
      title: '结果',
      width: 100,
      render: (record) => <StatusBadge status={record.result} />,
    },
    {
      key: 'createTime',
      title: '记录时间',
      width: 170,
      render: (record) => (
        <span className="text-sm text-industrial-400">{record.createTime}</span>
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
          <h1 className="text-xl font-bold text-industrial-600">装夹找正记录</h1>
          <p className="text-sm text-industrial-400 mt-1">工件装夹与找正数据记录</p>
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
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总记录数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{setupRecords.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">合格</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {setupRecords.filter((r) => r.result === 'pass').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-50 rounded-industrial text-danger-600">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">不合格</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {setupRecords.filter((r) => r.result === 'fail').length}
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
              <p className="text-sm text-industrial-400">平均装夹时间</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {Math.round(setupRecords.reduce((sum, r) => sum + r.setupTime, 0) / setupRecords.length)} 分钟
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
              placeholder="搜索任务编号、机床、夹具..."
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
        title="新增装夹找正记录"
        width={700}
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
            <Select
              label="选择任务"
              value={formData.taskId}
              onChange={(v) => setFormData({ ...formData, taskId: v })}
              options={[
                { value: '', label: '请选择...' },
                ...tasks
                  .filter((t) => t.status === 'pending' || t.status === 'in_progress')
                  .map((t) => ({
                    value: t.id,
                    label: `${t.taskNo} - ${getStatusText(t.status)}`,
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
                  .filter((m) => m.status !== 'error')
                  .map((m) => ({
                    value: m.id,
                    label: `${m.machineNo} - ${m.machineName}`,
                  })),
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="夹具编号"
              value={formData.fixtureNo}
              onChange={(v) => setFormData({ ...formData, fixtureNo: v })}
            />
            <Input
              label="操作人员"
              value={formData.operator}
              onChange={(v) => setFormData({ ...formData, operator: v })}
            />
            <Input
              label="装夹用时(分钟)"
              type="number"
              value={formData.setupTime}
              onChange={(v) => setFormData({ ...formData, setupTime: v })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-industrial-600">找正点数据</label>
              <Button size="sm" variant="ghost" onClick={handleAddPoint}>
                <Plus className="w-3 h-3" />
                添加点
              </Button>
            </div>
            <div className="border border-industrial-200 rounded-industrial overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-industrial-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-industrial-500 font-medium">点名称</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">X (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">Y (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">Z (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">偏差 (mm)</th>
                    <th className="px-3 py-2 text-center text-industrial-500 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.alignmentData.map((point, index) => (
                    <tr key={index} className="border-t border-industrial-100">
                      <td className="px-3 py-2">
                        <Input
                          value={point.pointName}
                          onChange={(v) => handleUpdatePoint(index, 'pointName', v)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={point.x}
                          onChange={(v) => handleUpdatePoint(index, 'x', parseFloat(v) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={point.y}
                          onChange={(v) => handleUpdatePoint(index, 'y', parseFloat(v) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={point.z}
                          onChange={(v) => handleUpdatePoint(index, 'z', parseFloat(v) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={cn(
                            'font-mono',
                            point.deviation > 0.01 ? 'text-danger-600' : 'text-success-600'
                          )}
                        >
                          {formatNumber(point.deviation, 4)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger-500"
                          onClick={() => handleRemovePoint(index)}
                          disabled={formData.alignmentData.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title="装夹找正详情"
        width={700}
        footer={
          <Button variant="secondary" onClick={() => setViewDetail(null)}>
            关闭
          </Button>
        }
      >
        {viewDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">任务编号</p>
                <p className="font-mono font-medium mt-1">
                  {getTaskInfo(viewDetail.taskId)?.taskNo || '-'}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">机床</p>
                <p className="font-medium mt-1">
                  {getMachineInfo(viewDetail.machineId)?.machineName || '-'}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">夹具编号</p>
                <p className="font-mono font-medium mt-1">{viewDetail.fixtureNo}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">装夹用时</p>
                <p className="font-mono font-medium mt-1">{viewDetail.setupTime} 分钟</p>
              </div>
            </div>

            <div className="border border-industrial-200 rounded-industrial overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-industrial-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-industrial-500 font-medium">点名称</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">X (mm)</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">Y (mm)</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">Z (mm)</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">偏差 (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDetail.alignmentData.map((point, index) => (
                    <tr key={index} className="border-t border-industrial-100">
                      <td className="px-4 py-3 font-medium">{point.pointName}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(point.x, 4)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(point.y, 4)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(point.z, 4)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            'font-mono font-medium',
                            point.deviation > 0.01 ? 'text-danger-600' : 'text-success-600'
                          )}
                        >
                          {formatNumber(point.deviation, 4)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 bg-industrial-50 rounded-industrial">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-industrial-400" />
                <span className="text-sm text-industrial-500">最大偏差</span>
              </div>
              <span
                className={cn(
                  'font-mono font-bold text-lg',
                  Math.max(...viewDetail.alignmentData.map((p) => p.deviation)) > 0.01
                    ? 'text-danger-600'
                    : 'text-success-600'
                )}
              >
                {formatNumber(Math.max(...viewDetail.alignmentData.map((p) => p.deviation)), 4)} mm
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
