import { useState } from 'react';
import { Search, Plus, Clock, Wrench, TrendingDown, Save, Layers, Timer } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatNumber, getToolTypeText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { ToolWearRecord } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const WearRecords = () => {
  const { wearRecords, tools, addWearRecord, updateTool } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    toolId: '',
    wearAmount: '',
    machiningTime: '',
    workpieceCount: '',
  });

  const getToolInfo = (id: string) => tools.find((t) => t.id === id);

  const filteredRecords = wearRecords.filter((r) => {
    const tool = getToolInfo(r.toolId);
    const matchSearch =
      r.recordTime.includes(searchText) ||
      tool?.toolNo.includes(searchText) ||
      tool?.toolName.includes(searchText);
    const matchTool = toolFilter === 'all' || r.toolId === toolFilter;
    return matchSearch && matchTool;
  });

  const handleSave = () => {
    if (!formData.toolId || !formData.wearAmount) return;

    const newRecord: ToolWearRecord = {
      id: `wear${Date.now()}`,
      toolId: formData.toolId,
      recordTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      wearAmount: parseFloat(formData.wearAmount) || 0,
      machiningTime: parseInt(formData.machiningTime) || 0,
      workpieceCount: parseInt(formData.workpieceCount) || 0,
    };

    addWearRecord(newRecord);

    const tool = getToolInfo(formData.toolId);
    if (tool) {
      updateTool({
        ...tool,
        usedLife: tool.usedLife + (parseInt(formData.machiningTime) || 0) / 60,
      });
    }

    setShowModal(false);
  };

  const columns: TableColumn<ToolWearRecord>[] = [
    {
      key: 'recordTime',
      title: '记录时间',
      width: 170,
      render: (record) => (
        <span className="font-mono text-sm text-industrial-500">{record.recordTime}</span>
      ),
    },
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 140,
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        return <span className="font-mono font-bold text-primary-600">{tool?.toolNo || '-'}</span>;
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
      key: 'toolType',
      title: '类型',
      width: 80,
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        return tool ? getToolTypeText(tool.toolType) : '-';
      },
    },
    {
      key: 'wearAmount',
      title: '磨损量',
      width: 120,
      align: 'center',
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        const isWorn = tool?.status === 'worn';
        return (
          <span
            className={cn(
              'font-mono font-bold',
              record.wearAmount > 0.2
                ? 'text-danger-600'
                : record.wearAmount > 0.1
                ? 'text-warning-600'
                : 'text-success-600',
              isWorn && 'text-danger-600'
            )}
          >
            {formatNumber(record.wearAmount, 3)} mm
          </span>
        );
      },
    },
    {
      key: 'machiningTime',
      title: '加工时长',
      width: 120,
      align: 'center',
      render: (record) => <span className="font-mono">{record.machiningTime} min</span>,
    },
    {
      key: 'workpieceCount',
      title: '加工件数',
      width: 100,
      align: 'center',
      render: (record) => <span className="font-mono">{record.workpieceCount} 件</span>,
    },
    {
      key: 'wearRate',
      title: '磨损速率',
      width: 140,
      align: 'center',
      render: (record) => {
        const rate = record.workpieceCount > 0 ? record.wearAmount / record.workpieceCount : 0;
        return (
          <span className="font-mono text-xs">
            {formatNumber(rate * 1000, 2)} μm/件
          </span>
        );
      },
    },
  ];

  const totalWear = wearRecords.reduce((sum, r) => sum + r.wearAmount, 0);
  const totalMachiningTime = wearRecords.reduce((sum, r) => sum + r.machiningTime, 0);
  const totalWorkpieces = wearRecords.reduce((sum, r) => sum + r.workpieceCount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">刀具磨损记录</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具磨损数据记录与分析</p>
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
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总记录数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{wearRecords.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 rounded-industrial text-warning-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">累计磨损</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {formatNumber(totalWear, 3)} mm
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总加工时长</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {Math.round(totalMachiningTime / 60)} h
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-industrial-50 rounded-industrial text-industrial-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总加工件数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{totalWorkpieces} 件</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索记录时间、刀具编号、名称..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Select
            value={toolFilter}
            onChange={(v) => setToolFilter(v)}
            options={[
              { value: 'all', label: '全部刀具' },
              ...tools.map((t) => ({ value: t.id, label: `${t.toolNo} - ${t.toolName}` })),
            ]}
            className="w-48"
          />
        </div>

        <Table columns={columns} data={filteredRecords} rowKey="id" />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="新增刀具磨损记录"
        width={600}
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
          <Select
            label="选择刀具"
            value={formData.toolId}
            onChange={(v) => setFormData({ ...formData, toolId: v })}
            options={[
              { value: '', label: '' },
              ...tools
                .filter((t) => t.status !== 'broken')
                .map((t) => ({
                  value: t.id,
                  label: `${t.toolNo} - ${t.toolName} (${getToolTypeText(t.toolType)})`,
                })),
            ]}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="磨损量 (mm)"
              type="number"
              step="0.001"
              value={formData.wearAmount}
              onChange={(e) => setFormData({ ...formData, wearAmount: e.target.value })}
              placeholder="如：0.08"
            />
            <Input
              label="加工时长 (分钟)"
              type="number"
              value={formData.machiningTime}
              onChange={(e) => setFormData({ ...formData, machiningTime: e.target.value })}
              placeholder="如：120"
            />
            <Input
              label="加工件数"
              type="number"
              value={formData.workpieceCount}
              onChange={(e) => setFormData({ ...formData, workpieceCount: e.target.value })}
              placeholder="如：15"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
