import { useState } from 'react';
import { Search, Wrench, AlertTriangle, TrendingDown, Clock, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatNumber, getToolTypeText } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { Tool } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const ToolLifeOverview = () => {
  const { tools, wearRecords } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'available', label: '可用' },
    { value: 'in_use', label: '使用中' },
    { value: 'worn', label: '已磨损' },
    { value: 'broken', label: '已损坏' },
  ];

  const filteredTools = tools.filter((t) => {
    const matchSearch =
      t.toolName.includes(searchText) ||
      t.toolNo.includes(searchText) ||
      t.manufacturer.includes(searchText);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getToolWearRecords = (toolId: string) => {
    return wearRecords.filter((w) => w.toolId === toolId);
  };

  const getTotalWear = (toolId: string) => {
    return getToolWearRecords(toolId).reduce((sum, w) => sum + w.wearAmount, 0);
  };

  const lifePercentage = (tool: Tool) => {
    return Math.min(100, (tool.usedLife / tool.totalLife) * 100);
  };

  const columns: TableColumn<Tool>[] = [
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 140,
      render: (record) => (
        <span className="font-mono font-bold text-primary-600">{record.toolNo}</span>
      ),
    },
    {
      key: 'toolName',
      title: '刀具名称',
      width: 120,
    },
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
    {
      key: 'material',
      title: '材质',
      width: 100,
    },
    {
      key: 'life',
      title: '寿命进度',
      width: 200,
      render: (record) => {
        const pct = lifePercentage(record);
        const pctClass = pct > 90 ? 'bg-danger-500' : pct > 70 ? 'bg-warning-500' : 'bg-success-500';
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-industrial-400">已用/总寿命</span>
              <span className="font-mono font-medium">
                {record.usedLife}/{record.totalLife}h
              </span>
            </div>
            <div className="h-2 bg-industrial-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', pctClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'totalWear',
      title: '累计磨损',
      width: 120,
      align: 'center',
      render: (record) => {
        const totalWear = getTotalWear(record.id);
        return (
          <span
            className={cn(
              'font-mono',
              totalWear > 0.2 ? 'text-danger-600' : totalWear > 0.1 ? 'text-warning-600' : 'text-success-600'
            )}
          >
            {formatNumber(totalWear, 3)} mm
          </span>
        );
      },
    },
    {
      key: 'wearCount',
      title: '磨损记录',
      width: 100,
      align: 'center',
      render: (record) => (
        <span className="font-mono">{getToolWearRecords(record.id).length} 次</span>
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
          <Link to={`/tool-life/wear?toolId=${record.id}`}>
            <Button size="sm" variant="ghost">
              <Clock className="w-4 h-4" />
              磨损
            </Button>
          </Link>
          <Link to={`/tool-life/repair?toolId=${record.id}`}>
            <Button size="sm" variant="ghost">
              <FileText className="w-4 h-4" />
              报修
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const getAverageLife = () => {
    const total = tools.reduce((sum, t) => sum + lifePercentage(t), 0);
    return formatNumber(total / tools.length, 1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">刀具寿命总览</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具寿命状态监控与管理</p>
        </div>
        <div className="flex gap-2">
          <Link to="/tool-life/wear">
            <Button variant="secondary">
              <Clock className="w-4 h-4" />
              磨损记录
            </Button>
          </Link>
          <Link to="/tool-life/repair">
            <Button variant="secondary">
              <FileText className="w-4 h-4" />
              报修记录
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总刀具数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{tools.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 rounded-industrial text-warning-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">需更换</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {tools.filter((t) => lifePercentage(t) > 90).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-50 rounded-industrial text-danger-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">已损坏</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {tools.filter((t) => t.status === 'broken').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">平均寿命</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{getAverageLife()}%</p>
            </div>
          </div>
        </Card>
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

        <Table columns={columns} data={filteredTools} rowKey="id" />
      </Card>
    </div>
  );
};
