import { useState } from 'react';
import { Search, Plus, Ruler, CheckCircle, XCircle, Save, FileText } from 'lucide-react';
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
import type { InspectionItem } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const FirstInspection = () => {
  const { inspections, tasks, processes, addInspection } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    taskId: '',
    partNo: '',
    inspector: '',
    inspectionItems: [
      { featureName: '', nominal: 0, upperTolerance: 0, lowerTolerance: 0, measuredValue: 0, result: 'pass' as 'pass' | 'fail', id: '1' },
    ] as (InspectionItem & { id: string })[],
  });

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);
  const getProcessInfo = (id: string) => processes.find((p) => p.id === id);

  const filteredInspections = inspections.filter((i) => {
    const task = getTaskInfo(i.taskId);
    return (
      i.partNo.includes(searchText) ||
      i.inspector.includes(searchText) ||
      task?.taskNo.includes(searchText)
    );
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      inspectionItems: [
        ...formData.inspectionItems,
        {
          id: String(Date.now()),
          featureName: '',
          nominal: 0,
          upperTolerance: 0,
          lowerTolerance: 0,
          measuredValue: 0,
          result: 'pass',
        },
      ],
    });
  };

  const handleRemoveItem = (id: string) => {
    if (formData.inspectionItems.length > 1) {
      setFormData({
        ...formData,
        inspectionItems: formData.inspectionItems.filter((item) => item.id !== id),
      });
    }
  };

  const handleUpdateItem = (id: string, field: string, value: number | string) => {
    const newItems = formData.inspectionItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'measuredValue' || field === 'nominal' || field === 'upperTolerance' || field === 'lowerTolerance') {
        const deviation = updated.measuredValue - updated.nominal;
        const isPass =
          deviation >= -updated.lowerTolerance && deviation <= updated.upperTolerance;
        updated.result = isPass ? 'pass' : 'fail';
      }
      return updated;
    });
    setFormData({ ...formData, inspectionItems: newItems });
  };

  const handleSave = () => {
    if (!formData.taskId || !formData.partNo) return;

    const allPass = formData.inspectionItems.every((item) => item.result === 'pass');

    addInspection({
      id: `ins${Date.now()}`,
      taskId: formData.taskId,
      partNo: formData.partNo,
      inspector: formData.inspector || '系统',
      result: allPass ? 'pass' : 'fail',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      inspectionItems: formData.inspectionItems,
    });

    setShowModal(false);
  };

  const columns: TableColumn<(typeof inspections)[0]>[] = [
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
      key: 'partNo',
      title: '零件图号',
      width: 140,
      render: (record) => <span className="font-mono">{record.partNo}</span>,
    },
    {
      key: 'itemCount',
      title: '检测项数',
      width: 100,
      align: 'center',
      render: (record) => <span className="font-mono">{record.inspectionItems.length}</span>,
    },
    {
      key: 'passCount',
      title: '合格/不合格',
      width: 140,
      align: 'center',
      render: (record) => {
        const pass = record.inspectionItems.filter((i) => i.result === 'pass').length;
        const fail = record.inspectionItems.filter((i) => i.result === 'fail').length;
        return (
          <span className="font-mono">
            <span className="text-success-600">{pass}</span>
            <span className="text-industrial-300 mx-1">/</span>
            <span className="text-danger-600">{fail}</span>
          </span>
        );
      },
    },
    {
      key: 'inspector',
      title: '检验员',
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
      title: '检验时间',
      width: 170,
      render: (record) => (
        <span className="text-sm text-industrial-400">{record.createTime}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">加工尺寸首检</h1>
          <p className="text-sm text-industrial-400 mt-1">首件加工尺寸检验记录</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新增首检
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总首检数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{inspections.length}</p>
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
                {inspections.filter((i) => i.result === 'pass').length}
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
                {inspections.filter((i) => i.result === 'fail').length}
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
              placeholder="搜索零件图号、检验员、任务编号..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <Table columns={columns} data={filteredInspections} rowKey="id" />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="新增加工尺寸首检"
        width={900}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="选择任务"
              value={formData.taskId}
              onChange={(v) => {
                const task = tasks.find((t) => t.id === v);
                const process = task ? getProcessInfo(task.processId) : null;
                setFormData({
                  ...formData,
                  taskId: v,
                  partNo: process?.partNo || '',
                });
              }}
              options={[
                { value: '', label: '请选择任务' },
                ...tasks
                  .filter((t) => t.status === 'in_progress')
                  .map((t) => ({
                    value: t.id,
                    label: `${t.taskNo} - ${getStatusText(t.status)}`,
                  })),
              ]}
            />
            <Input
              label="零件图号"
              value={formData.partNo}
              onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
            />
            <Input
              label="检验员"
              value={formData.inspector}
              onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-industrial-600">检测项目</label>
              <Button size="sm" variant="ghost" onClick={handleAddItem}>
                <Plus className="w-3 h-3" />
                添加项目
              </Button>
            </div>
            <div className="border border-industrial-200 rounded-industrial overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-industrial-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-industrial-500 font-medium">检测项目</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">公称值 (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">上偏差 (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">下偏差 (mm)</th>
                    <th className="px-3 py-2 text-right text-industrial-500 font-medium">实测值 (mm)</th>
                    <th className="px-3 py-2 text-center text-industrial-500 font-medium">结果</th>
                    <th className="px-3 py-2 text-center text-industrial-500 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.inspectionItems.map((item) => (
                    <tr key={item.id} className="border-t border-industrial-100">
                      <td className="px-3 py-2">
                        <Input
                          value={item.featureName}
                          onChange={(e) => handleUpdateItem(item.id, 'featureName', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="如：孔径、平面度"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={item.nominal}
                          onChange={(e) => handleUpdateItem(item.id, 'nominal', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={item.upperTolerance}
                          onChange={(e) => handleUpdateItem(item.id, 'upperTolerance', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={item.lowerTolerance}
                          onChange={(e) => handleUpdateItem(item.id, 'lowerTolerance', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm font-mono text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={item.measuredValue}
                          onChange={(e) => handleUpdateItem(item.id, 'measuredValue', parseFloat(e.target.value) || 0)}
                          className={cn(
                            'h-8 text-sm font-mono text-right',
                            item.result === 'fail' && 'border-danger-300 focus:border-danger-500'
                          )}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge status={item.result} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger-500"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={formData.inspectionItems.length <= 1}
                        >
                          <XCircle className="w-3 h-3" />
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
    </div>
  );
};
