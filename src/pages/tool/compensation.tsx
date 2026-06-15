import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Ruler, Calculator, Save, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatNumber, getToolTypeText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { ToolCompensation } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const ToolCompensationPage = () => {
  const { compensations, tools, addCompensation } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<ToolCompensation | null>(null);
  const [formData, setFormData] = useState({
    toolId: '',
    offsetNo: '',
    lengthOffset: '',
    radiusOffset: '',
    wearOffset: '',
    operator: '',
  });

  const getToolInfo = (toolId: string) => tools.find((t) => t.id === toolId);

  const filteredComps = compensations.filter((c) => {
    const tool = getToolInfo(c.toolId);
    return (
      c.offsetNo.includes(searchText) ||
      tool?.toolNo.includes(searchText) ||
      tool?.toolName.includes(searchText)
    );
  });

  const handleOpenModal = (comp?: ToolCompensation) => {
    if (comp) {
      setEditingComp(comp);
      setFormData({
        toolId: comp.toolId,
        offsetNo: comp.offsetNo,
        lengthOffset: comp.lengthOffset.toString(),
        radiusOffset: comp.radiusOffset.toString(),
        wearOffset: comp.wearOffset.toString(),
        operator: comp.operator,
      });
    } else {
      setEditingComp(null);
      setFormData({
        toolId: '',
        offsetNo: '',
        lengthOffset: '',
        radiusOffset: '',
        wearOffset: '',
        operator: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.toolId || !formData.offsetNo) return;

    const newComp: ToolCompensation = {
      id: editingComp?.id || `comp${Date.now()}`,
      toolId: formData.toolId,
      offsetNo: formData.offsetNo,
      lengthOffset: parseFloat(formData.lengthOffset) || 0,
      radiusOffset: parseFloat(formData.radiusOffset) || 0,
      wearOffset: parseFloat(formData.wearOffset) || 0,
      effectiveDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: formData.operator || '系统',
    };

    addCompensation(newComp);
    setShowModal(false);
  };

  const columns: TableColumn<ToolCompensation>[] = [
    {
      key: 'offsetNo',
      title: '补偿号',
      width: 100,
      render: (record) => (
        <span className="font-mono font-bold text-primary-600">{record.offsetNo}</span>
      ),
    },
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 140,
      render: (record) => {
        const tool = getToolInfo(record.toolId);
        return <span className="font-mono">{tool?.toolNo || '-'}</span>;
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
      key: 'lengthOffset',
      title: '长度补偿',
      width: 120,
      render: (record) => (
        <span className="font-mono text-sm">
          {formatNumber(record.lengthOffset)} mm
        </span>
      ),
    },
    {
      key: 'radiusOffset',
      title: '半径补偿',
      width: 120,
      render: (record) => (
        <span className="font-mono text-sm">
          {formatNumber(record.radiusOffset)} mm
        </span>
      ),
    },
    {
      key: 'wearOffset',
      title: '磨损补偿',
      width: 120,
      render: (record) => (
        <span
          className={cn(
            'font-mono text-sm',
            record.wearOffset > 0.1 ? 'text-warning-600' : 'text-industrial-600'
          )}
        >
          {formatNumber(record.wearOffset)} mm
        </span>
      ),
    },
    { key: 'operator', title: '设置人', width: 100 },
    {
      key: 'effectiveDate',
      title: '生效时间',
      width: 170,
      render: (record) => (
        <span className="text-sm text-industrial-400">{record.effectiveDate}</span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
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
          <h1 className="text-xl font-bold text-industrial-600">刀具补偿设置</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具长度、半径和磨损补偿参数管理</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          新增补偿
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">长度补偿总数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{compensations.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">平均磨损量</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {formatNumber(compensations.reduce((sum, c) => sum + c.wearOffset, 0) / compensations.length)} mm
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 rounded-industrial text-warning-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">需关注补偿</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {compensations.filter((c) => c.wearOffset > 0.1).length}
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
              placeholder="搜索补偿号、刀具编号、名称..."
              className="pl-9"
              value={searchText}
              onChange={(v) => setSearchText(v)}
            />
          </div>
        </div>

        <Table columns={columns} data={filteredComps} rowKey="id" />
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingComp ? '编辑刀具补偿' : '新增刀具补偿'}
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
              { value: '', label: '请选择...' },
              ...tools
                .filter((t) => t.status !== 'broken')
                .map((t) => ({
                  value: t.id,
                  label: `${t.toolNo} - ${t.toolName} (${getToolTypeText(t.toolType)})`,
                })),
            ]}
          />
          <Input
            label="补偿号"
            value={formData.offsetNo}
            onChange={(v) => setFormData({ ...formData, offsetNo: v })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="长度补偿 (mm)"
              type="number"
              step="0.001"
              value={formData.lengthOffset}
              onChange={(v) => setFormData({ ...formData, lengthOffset: v })}
            />
            <Input
              label="半径补偿 (mm)"
              type="number"
              step="0.001"
              value={formData.radiusOffset}
              onChange={(v) => setFormData({ ...formData, radiusOffset: v })}
            />
            <Input
              label="磨损补偿 (mm)"
              type="number"
              step="0.001"
              value={formData.wearOffset}
              onChange={(v) => setFormData({ ...formData, wearOffset: v })}
            />
          </div>
          <Input
            label="设置人"
            value={formData.operator}
            onChange={(v) => setFormData({ ...formData, operator: v })}
          />
        </div>
      </Modal>
    </div>
  );
};
