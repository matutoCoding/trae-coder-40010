import { useState } from 'react';
import { Plus, Search, Wrench, Package, AlertTriangle, Edit, Trash2, HandMetal } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatNumber, getToolTypeText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { Tool } from '@/types';

export const ToolList = () => {
  const { tools, updateTool, addCompensation } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showReceive, setShowReceive] = useState(false);
  const [receiveQty, setReceiveQty] = useState(1);
  const [receiveOperator, setReceiveOperator] = useState('');

  const filteredTools = tools.filter(
    (t) =>
      t.toolName.includes(searchText) ||
      t.toolNo.includes(searchText) ||
      t.manufacturer.includes(searchText)
  );

  const handleReceive = () => {
    if (selectedTool) {
      updateTool({
        ...selectedTool,
        stock: selectedTool.stock + receiveQty,
      });
      setShowReceive(false);
      setReceiveQty(1);
      setReceiveOperator('');
    }
  };

  const lifePercentage = (tool: Tool) => {
    return Math.min(100, (tool.usedLife / tool.totalLife) * 100);
  };

  const columns: TableColumn<Tool>[] = [
    { key: 'toolNo', title: '刀具编号', width: 140 },
    { key: 'toolName', title: '刀具名称', width: 120 },
    {
      key: 'toolType',
      title: '类型',
      width: 80,
      render: (record) => getToolTypeText(record.toolType),
    },
    {
      key: 'spec',
      title: '规格',
      width: 120,
      render: (record) => (
        <span className="font-mono text-sm">
          φ{record.diameter} × {record.length}
        </span>
      ),
    },
    { key: 'material', title: '材质', width: 100 },
    { key: 'manufacturer', title: '品牌', width: 100 },
    {
      key: 'life',
      title: '寿命',
      width: 150,
      render: (record) => {
        const pct = lifePercentage(record);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-industrial-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  pct > 90 ? 'bg-danger-500' : pct > 70 ? 'bg-warning-500' : 'bg-success-500'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="data-number text-xs w-14 text-right">
              {record.usedLife}/{record.totalLife}h
            </span>
          </div>
        );
      },
    },
    {
      key: 'stock',
      title: '库存',
      width: 120,
      render: (record) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-industrial-400" />
          <span
            className={cn(
              'font-mono font-medium',
              record.stock <= record.minStock && 'text-danger-500'
            )}
          >
            {record.stock}
          </span>
          {record.stock <= record.minStock && (
            <AlertTriangle className="w-4 h-4 text-warning-500" />
          )}
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
      width: 180,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedTool(record);
              setShowReceive(true);
            }}
          >
            <HandMetal className="w-4 h-4" />
            领用
          </Button>
          <Button size="sm" variant="ghost">
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
          <h1 className="text-xl font-bold text-industrial-600">刀具管理</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具清单领用</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Package className="w-4 h-4" />
            入库登记
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            新增刀具
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCardMini
          title="总刀具数"
          value={tools.length}
          icon={<Wrench className="w-5 h-5" />}
        />
        <StatCardMini
          title="使用中"
          value={tools.filter((t) => t.status === 'in_use').length}
          icon={<Play className="w-5 h-5" />}
          color="text-primary-600"
        />
        <StatCardMini
          title="待更换"
          value={tools.filter((t) => t.status === 'worn').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-warning-600"
        />
        <StatCardMini
          title="库存预警"
          value={tools.filter((t) => t.stock <= t.minStock).length}
          icon={<Package className="w-5 h-5" />}
          color="text-danger-600"
        />
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索刀具编号、名称、品牌..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">全部</Button>
            <Button variant="ghost" size="sm">可用</Button>
            <Button variant="ghost" size="sm">使用中</Button>
            <Button variant="ghost" size="sm">磨损</Button>
            <Button variant="ghost" size="sm">损坏</Button>
          </div>
        </div>

        <Table columns={columns} data={filteredTools} rowKey="id" />
      </Card>

      <Modal
        open={showReceive}
        onClose={() => setShowReceive(false)}
        title="刀具领用"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReceive(false)}>
              取消
            </Button>
            <Button onClick={handleReceive}>确认领用</Button>
          </>
        }
      >
        {selectedTool && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">刀具编号</p>
                <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
                  {selectedTool.toolNo}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">刀具名称</p>
                <p className="text-sm font-medium text-industrial-600 mt-1">
                  {selectedTool.toolName}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">规格</p>
                <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
                  φ{selectedTool.diameter} × {selectedTool.length}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">当前库存</p>
                <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
                  {selectedTool.stock} 件
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="领用数量"
                type="number"
                min="1"
                value={receiveQty}
                onChange={(e) => setReceiveQty(parseInt(e.target.value) || 1)}
              />
              <Input
                label="领用人"
                value={receiveOperator}
                onChange={(e) => setReceiveOperator(e.target.value)}
                placeholder="请输入领用人姓名"
              />
              <Select
                label="使用机床"
                value=""
                onChange={() => {}}
                options={[
                  { value: 'm001', label: 'VMC-001 立式加工中心1#' },
                  { value: 'm002', label: 'VMC-002 立式加工中心2#' },
                  { value: 'm004', label: 'CK-001 数控车床1#' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function Play(props: { className?: string }) {
  return <PlayCircle {...props} />;
}

import { PlayCircle } from 'lucide-react';

function StatCardMini({
  title,
  value,
  icon,
  color = 'text-industrial-600',
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-industrial-400">{title}</p>
          <p className={cn('text-2xl font-bold mt-1 data-number', color)}>{value}</p>
        </div>
        <div className="p-2 rounded-industrial bg-industrial-50 text-industrial-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
