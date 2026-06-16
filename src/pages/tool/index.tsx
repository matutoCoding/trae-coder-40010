import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Wrench,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  HandMetal,
  PlayCircle,
  List,
  ClipboardList,
  History,
  PackagePlus,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getStatusText, getToolTypeText } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { TableColumn } from '@/components/ui/Table';
import type { Tool, ToolReceiveRecord, ToolTransaction, ToolStatus, ToolTransactionType, ScheduleTask } from '@/types';

export const ToolList = () => {
  const {
    tools,
    machines,
    tasks,
    receiveRecords,
    transactions,
    updateTool,
    addReceiveRecord,
    addTransaction,
  } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'receive' | 'transactions'>('tools');
  const [toolFilter, setToolFilter] = useState('all');
  const [receiveToolFilter, setReceiveToolFilter] = useState('all');
  const [receiveMachineFilter, setReceiveMachineFilter] = useState('all');
  const [receiveOperatorFilter, setReceiveOperatorFilter] = useState('');
  const [transToolFilter, setTransToolFilter] = useState('all');
  const [lowStockExpanded, setLowStockExpanded] = useState(false);

  const [showReceive, setShowReceive] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showScrap, setShowScrap] = useState(false);
  const [showToolHistory, setShowToolHistory] = useState(false);

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const [receiveQty, setReceiveQty] = useState('');
  const [receiveOperator, setReceiveOperator] = useState('');
  const [receiveMachineId, setReceiveMachineId] = useState('');
  const [receiveTaskId, setReceiveTaskId] = useState('');
  const [receiveError, setReceiveError] = useState('');

  const [editForm, setEditForm] = useState({
    stock: '',
    minStock: '',
    usedLife: '',
    totalLife: '',
    status: 'available' as ToolStatus,
  });
  const [editError, setEditError] = useState('');

  const [stockInQty, setStockInQty] = useState('');
  const [stockInOperator, setStockInOperator] = useState('');
  const [stockInRemark, setStockInRemark] = useState('');
  const [stockInError, setStockInError] = useState('');

  const [scrapQty, setScrapQty] = useState('');
  const [scrapOperator, setScrapOperator] = useState('');
  const [scrapRemark, setScrapRemark] = useState('');
  const [scrapTaskId, setScrapTaskId] = useState('');
  const [scrapError, setScrapError] = useState('');

  const getToolInfo = (id: string) => tools.find((t) => t.id === id);
  const getMachineInfo = (id: string) => machines.find((m) => m.id === id);
  const getTaskInfo = (id?: string) => tasks.find((t) => t.id === id);

  const getToolDisplay = (toolId: string, toolObj?: Tool) => {
    const tool = toolObj || getToolInfo(toolId);
    return tool ? { toolNo: tool.toolNo, toolName: tool.toolName } : { toolNo: '-', toolName: '-' };
  };

  const getMachineDisplay = (machineId?: string, machineObj?: any) => {
    const machine = machineObj || (machineId ? getMachineInfo(machineId) : undefined);
    return machine ? `${machine.machineNo} ${machine.machineName}` : '-';
  };

  const getTaskDisplay = (taskId?: string, taskObj?: ScheduleTask) => {
    const task = taskObj || (taskId ? getTaskInfo(taskId) : undefined);
    return task ? task.taskNo : '-';
  };

  const buildStockHistory = (toolId: string) => {
    const toolTransactions = transactions
      .filter((t) => t.toolId === toolId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const history: { time: string; stock: number; type: string; operator: string; quantity: number }[] = [];
    let currentStock = 0;

    if (toolTransactions.length > 0) {
      const tool = getToolInfo(toolId);
      if (tool) {
        let totalIn = 0;
        let totalOut = 0;
        toolTransactions.forEach((t) => {
          if (t.type === 'in') totalIn += t.quantity;
          else totalOut += t.quantity;
        });
        currentStock = tool.stock - (totalIn - totalOut);
        if (currentStock < 0) currentStock = 0;
      }
    }

    toolTransactions.forEach((t) => {
      if (t.type === 'in') {
        currentStock += t.quantity;
      } else {
        currentStock -= t.quantity;
      }
      history.push({
        time: t.timestamp,
        stock: currentStock,
        type: t.type,
        operator: t.operator,
        quantity: t.quantity,
      });
    });

    return history;
  };

  const getToolTransactions = (toolId: string) =>
    transactions.filter((t) => t.toolId === toolId).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const parsePositiveInt = (str: string): number | null => {
    if (!/^\d+$/.test(str)) return null;
    const num = parseInt(str, 10);
    return num > 0 ? num : null;
  };

  const getTransactionTypeText = (type: ToolTransactionType): string => {
    const map: Record<ToolTransactionType, string> = {
      in: '入库',
      out: '出库',
      scrap: '报废',
    };
    return map[type];
  };

  const getTransactionTypeColor = (type: ToolTransactionType): string => {
    const map: Record<ToolTransactionType, string> = {
      in: 'success',
      out: 'primary',
      scrap: 'danger',
    };
    return map[type];
  };

  const formatTime = (str: string): string => {
    try {
      const d = new Date(str);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return str;
    }
  };

  const formatShortTime = (str: string): string => {
    try {
      const d = new Date(str);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return str;
    }
  };

  const openReceive = (tool: Tool) => {
    setSelectedTool(tool);
    setReceiveQty('');
    setReceiveOperator('');
    setReceiveMachineId('');
    setReceiveTaskId('');
    setReceiveError('');
    setShowReceive(true);
  };

  const openEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setEditForm({
      stock: String(tool.stock),
      minStock: String(tool.minStock),
      usedLife: String(tool.usedLife),
      totalLife: String(tool.totalLife),
      status: tool.status,
    });
    setEditError('');
    setShowEdit(true);
  };

  const openStockIn = (tool: Tool) => {
    setSelectedTool(tool);
    setStockInQty('');
    setStockInOperator('');
    setStockInRemark('');
    setStockInError('');
    setShowStockIn(true);
  };

  const openScrap = (tool: Tool) => {
    setSelectedTool(tool);
    setScrapQty('');
    setScrapOperator('');
    setScrapRemark('');
    setScrapTaskId('');
    setScrapError('');
    setShowScrap(true);
  };

  const openHistory = (tool: Tool) => {
    setSelectedTool(tool);
    setShowToolHistory(true);
  };

  const handleReceive = () => {
    if (!selectedTool) return;
    const qty = parsePositiveInt(receiveQty);
    if (qty === null) {
      setReceiveError('领用数量必须是正整数');
      return;
    }
    if (qty > selectedTool.stock) {
      setReceiveError('库存不足');
      return;
    }
    if (!receiveOperator.trim()) {
      setReceiveError('请输入领用人');
      return;
    }
    if (!receiveMachineId) {
      setReceiveError('请选择使用机床');
      return;
    }

    const recordId = `recv_${Date.now()}`;
    const now = new Date().toISOString();
    const taskInfo = receiveTaskId ? getTaskInfo(receiveTaskId) : undefined;
    const machineInfo = getMachineInfo(receiveMachineId);

    addReceiveRecord({
      id: recordId,
      toolId: selectedTool.id,
      tool: selectedTool,
      machineId: receiveMachineId,
      machine: machineInfo,
      taskId: receiveTaskId || undefined,
      task: taskInfo,
      operator: receiveOperator.trim(),
      quantity: qty,
      receiveTime: now,
    });

    addTransaction({
      id: `trans_${Date.now()}`,
      toolId: selectedTool.id,
      tool: selectedTool,
      type: 'out',
      quantity: qty,
      operator: receiveOperator.trim(),
      timestamp: now,
      relatedRecordId: recordId,
      machineId: receiveMachineId,
      machine: machineInfo,
      taskId: receiveTaskId || undefined,
      task: taskInfo,
    });

    updateTool({
      ...selectedTool,
      stock: selectedTool.stock - qty,
    });

    setReceiveError('');
    setShowReceive(false);
    setSelectedTool(null);
  };

  const handleEditSave = () => {
    if (!selectedTool) return;
    const stock = parseInt(editForm.stock, 10);
    const minStock = parseInt(editForm.minStock, 10);
    const usedLife = parseFloat(editForm.usedLife);
    const totalLife = parseFloat(editForm.totalLife);

    if (isNaN(stock) || stock < 0) {
      setEditError('库存必须是非负整数');
      return;
    }
    if (isNaN(minStock) || minStock < 0) {
      setEditError('最小库存必须是非负整数');
      return;
    }
    if (isNaN(usedLife) || usedLife < 0) {
      setEditError('已用寿命必须是非负数');
      return;
    }
    if (isNaN(totalLife) || totalLife <= 0) {
      setEditError('总寿命必须是正数');
      return;
    }
    if (usedLife > totalLife) {
      setEditError('已用寿命不能超过总寿命');
      return;
    }

    updateTool({
      ...selectedTool,
      stock,
      minStock,
      usedLife,
      totalLife,
      status: editForm.status,
    });

    setEditError('');
    setShowEdit(false);
    setSelectedTool(null);
  };

  const handleStockIn = () => {
    if (!selectedTool) return;
    const qty = parsePositiveInt(stockInQty);
    if (qty === null) {
      setStockInError('入库数量必须是正整数');
      return;
    }
    if (!stockInOperator.trim()) {
      setStockInError('请输入操作人');
      return;
    }

    const now = new Date().toISOString();
    addTransaction({
      id: `trans_${Date.now()}`,
      toolId: selectedTool.id,
      tool: selectedTool,
      type: 'in',
      quantity: qty,
      operator: stockInOperator.trim(),
      timestamp: now,
      remark: stockInRemark.trim() || undefined,
    });

    updateTool({
      ...selectedTool,
      stock: selectedTool.stock + qty,
    });

    setStockInError('');
    setShowStockIn(false);
    setSelectedTool(null);
  };

  const handleScrap = () => {
    if (!selectedTool) return;
    const qty = parsePositiveInt(scrapQty);
    if (qty === null) {
      setScrapError('报废数量必须是正整数');
      return;
    }
    if (qty > selectedTool.stock) {
      setScrapError('报废数量不能超过当前库存');
      return;
    }
    if (!scrapOperator.trim()) {
      setScrapError('请输入操作人');
      return;
    }

    const now = new Date().toISOString();
    const taskInfo = scrapTaskId ? getTaskInfo(scrapTaskId) : undefined;

    addTransaction({
      id: `trans_${Date.now()}`,
      toolId: selectedTool.id,
      tool: selectedTool,
      type: 'scrap',
      quantity: qty,
      operator: scrapOperator.trim(),
      timestamp: now,
      remark: scrapRemark.trim() || undefined,
      taskId: scrapTaskId || undefined,
      task: taskInfo,
    });

    updateTool({
      ...selectedTool,
      stock: selectedTool.stock - qty,
    });

    setScrapError('');
    setShowScrap(false);
    setSelectedTool(null);
  };

  const lifePercentage = (tool: Tool) => {
    if (tool.totalLife <= 0) return 0;
    return Math.min(100, (tool.usedLife / tool.totalLife) * 100);
  };

  const lowStockTools = useMemo(
    () => tools.filter((t) => t.stock <= t.minStock),
    [tools]
  );

  const filteredTools = tools.filter((t) => {
    const matchSearch =
      t.toolNo.includes(searchText) ||
      t.toolName.includes(searchText) ||
      t.manufacturer.includes(searchText);
    const matchStatus = toolFilter === 'all' || t.status === toolFilter;
    return matchSearch && matchStatus;
  });

  const filteredReceiveRecords = receiveRecords
    .slice()
    .sort((a, b) => new Date(b.receiveTime).getTime() - new Date(a.receiveTime).getTime())
    .filter((r) => {
      const matchTool = receiveToolFilter === 'all' || r.toolId === receiveToolFilter;
      const matchMachine = receiveMachineFilter === 'all' || r.machineId === receiveMachineFilter;
      const matchOperator = !receiveOperatorFilter || r.operator.includes(receiveOperatorFilter);
      return matchTool && matchMachine && matchOperator;
    });

  const filteredTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((t) => transToolFilter === 'all' || t.toolId === transToolFilter);

  const toolOptions = [
    { value: 'all', label: '全部刀具' },
    ...tools.map((t) => ({ value: t.id, label: `${t.toolNo} ${t.toolName}` })),
  ];
  const machineOptions = [
    { value: 'all', label: '全部机床' },
    ...machines.map((m) => ({ value: m.id, label: `${m.machineNo} ${m.machineName}` })),
  ];
  const machineSelectOptions = machines.map((m) => ({
    value: m.id,
    label: `${m.machineNo} ${m.machineName}`,
  }));
  const taskOptions = tasks
    .filter((t) => t.status === 'in_progress' || t.status === 'pending')
    .map((t) => ({
      value: t.id,
      label: `${t.taskNo} - ${getStatusText(t.status)}`,
    }));

  const toolColumns: TableColumn<Tool>[] = [
    { key: 'toolNo', title: '刀具编号', width: 120 },
    { key: 'toolName', title: '刀具名称', width: 100 },
    {
      key: 'toolType',
      title: '类型',
      width: 70,
      render: (r) => getToolTypeText(r.toolType),
    },
    {
      key: 'spec',
      title: '规格(φd×L)',
      width: 110,
      render: (r) => (
        <span className="font-mono text-sm">
          φ{r.diameter}×{r.length}
        </span>
      ),
    },
    { key: 'material', title: '材质', width: 80 },
    { key: 'manufacturer', title: '品牌', width: 80 },
    {
      key: 'life',
      title: '寿命',
      width: 160,
      render: (r) => {
        const pct = lifePercentage(r);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-industrial-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  pct > 90
                    ? 'bg-danger-500'
                    : pct > 70
                      ? 'bg-warning-500'
                      : 'bg-success-500'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="data-number text-xs w-14 text-right">
              {r.usedLife}/{r.totalLife}h
            </span>
          </div>
        );
      },
    },
    {
      key: 'stock',
      title: '库存',
      width: 110,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-industrial-400" />
          <span
            className={cn(
              'font-mono font-medium',
              r.stock <= r.minStock && 'text-danger-500'
            )}
          >
            {r.stock}
          </span>
          {r.stock <= r.minStock && (
            <AlertTriangle className="w-4 h-4 text-warning-500" />
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: 90,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'action',
      title: '操作',
      width: 300,
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => openReceive(r)}>
            <HandMetal className="w-4 h-4" />
            领用
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            <Edit className="w-4 h-4" />
            编辑
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openHistory(r)}>
            <History className="w-4 h-4" />
            流水
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger-500 hover:text-danger-600"
            onClick={() => openScrap(r)}
          >
            <Trash2 className="w-4 h-4" />
            报废
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openStockIn(r)}>
            <PackagePlus className="w-4 h-4" />
            入库
          </Button>
        </div>
      ),
    },
  ];

  const receiveColumns: TableColumn<ToolReceiveRecord>[] = [
    {
      key: 'receiveTime',
      title: '记录时间',
      width: 170,
      render: (r) => formatTime(r.receiveTime),
    },
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 120,
      render: (r) => getToolDisplay(r.toolId, r.tool).toolNo,
    },
    {
      key: 'toolName',
      title: '刀具名称',
      width: 100,
      render: (r) => getToolDisplay(r.toolId, r.tool).toolName,
    },
    { key: 'operator', title: '领用人', width: 90 },
    {
      key: 'machineName',
      title: '使用机床',
      width: 170,
      render: (r) => getMachineDisplay(r.machineId, r.machine),
    },
    {
      key: 'taskNo',
      title: '关联任务',
      width: 130,
      render: (r) => (
        <span className={cn(
          'font-mono text-xs',
          r.taskId ? 'text-primary-600' : 'text-industrial-400'
        )}>
          {getTaskDisplay(r.taskId, r.task)}
        </span>
      ),
    },
    {
      key: 'quantity',
      title: '领用数量',
      width: 90,
      align: 'center',
      render: (r) => <span className="font-mono">{r.quantity}</span>,
    },
  ];

  const transactionColumns: TableColumn<ToolTransaction>[] = [
    {
      key: 'timestamp',
      title: '时间',
      width: 170,
      render: (r) => formatTime(r.timestamp),
    },
    {
      key: 'toolNo',
      title: '刀具编号',
      width: 120,
      render: (r) => getToolDisplay(r.toolId, r.tool).toolNo,
    },
    {
      key: 'toolName',
      title: '刀具名称',
      width: 100,
      render: (r) => getToolDisplay(r.toolId, r.tool).toolName,
    },
    {
      key: 'type',
      title: '类型',
      width: 80,
      align: 'center',
      render: (r) => {
        const baseClass =
          'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium';
        const colorClass =
          r.type === 'in'
            ? 'bg-success-50 text-success-600'
            : r.type === 'out'
              ? 'bg-primary-50 text-primary-600'
              : 'bg-danger-50 text-danger-600';
        return <span className={cn(baseClass, colorClass)}>{getTransactionTypeText(r.type)}</span>;
      },
    },
    {
      key: 'quantity',
      title: '数量',
      width: 90,
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono font-medium',
            r.type === 'in' && 'text-success-600',
            r.type !== 'in' && 'text-danger-600'
          )}
        >
          {r.type === 'in' ? '+' : '-'}
          {r.quantity}
        </span>
      ),
    },
    {
      key: 'machine',
      title: '关联机床',
      width: 150,
      render: (r) => getMachineDisplay(r.machineId, r.machine),
    },
    {
      key: 'task',
      title: '关联任务',
      width: 130,
      render: (r) => (
        <span className={cn(
          'font-mono text-xs',
          r.taskId ? 'text-primary-600' : 'text-industrial-400'
        )}>
          {getTaskDisplay(r.taskId, r.task)}
        </span>
      ),
    },
    { key: 'operator', title: '操作人', width: 90 },
    {
      key: 'remark',
      title: '备注',
      width: 160,
      render: (r) => r.remark || '-',
    },
  ];

  const historyTransactionColumns: TableColumn<ToolTransaction>[] = [
    {
      key: 'timestamp',
      title: '时间',
      width: 170,
      render: (r) => formatTime(r.timestamp),
    },
    {
      key: 'type',
      title: '类型',
      width: 80,
      align: 'center',
      render: (r) => {
        const baseClass =
          'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium';
        const colorClass =
          r.type === 'in'
            ? 'bg-success-50 text-success-600'
            : r.type === 'out'
              ? 'bg-primary-50 text-primary-600'
              : 'bg-danger-50 text-danger-600';
        return <span className={cn(baseClass, colorClass)}>{getTransactionTypeText(r.type)}</span>;
      },
    },
    {
      key: 'quantity',
      title: '数量',
      width: 80,
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono font-medium',
            r.type === 'in' && 'text-success-600',
            r.type !== 'in' && 'text-danger-600'
          )}
        >
          {r.type === 'in' ? '+' : '-'}
          {r.quantity}
        </span>
      ),
    },
    {
      key: 'machine',
      title: '机床',
      width: 130,
      render: (r) => getMachineDisplay(r.machineId, r.machine),
    },
    {
      key: 'task',
      title: '任务',
      width: 120,
      render: (r) => (
        <span className={cn(
          'font-mono text-xs',
          r.taskId ? 'text-primary-600' : 'text-industrial-400'
        )}>
          {getTaskDisplay(r.taskId, r.task)}
        </span>
      ),
    },
    { key: 'operator', title: '操作人', width: 80 },
    {
      key: 'remark',
      title: '备注',
      width: 140,
      render: (r) => r.remark || '-',
    },
  ];

  const statusFilters = [
    { key: 'all', label: '全部' },
    { key: 'available', label: '可用' },
    { key: 'in_use', label: '使用中' },
    { key: 'worn', label: '磨损' },
    { key: 'broken', label: '损坏' },
  ];

  const renderToolInfo = () => {
    if (!selectedTool) return null;
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
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
            φ{selectedTool.diameter}×{selectedTool.length}
          </p>
        </div>
        <div className="p-3 bg-industrial-50 rounded-industrial">
          <p className="text-xs text-industrial-400">当前库存</p>
          <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
            {selectedTool.stock} 件
          </p>
        </div>
      </div>
    );
  };

  const stockHistoryData = useMemo(() => {
    if (!selectedTool) return [];
    return buildStockHistory(selectedTool.id);
  }, [selectedTool, transactions]);

  const renderStockChart = () => {
    if (!selectedTool || stockHistoryData.length === 0) {
      return (
        <div className="h-52 flex items-center justify-center bg-industrial-50 rounded-industrial">
          <p className="text-sm text-industrial-400">暂无库存变动数据</p>
        </div>
      );
    }

    const chartData = stockHistoryData.map((item) => ({
      ...item,
      timeLabel: formatShortTime(item.time),
    }));

    return (
      <div className="mb-4 p-3 bg-industrial-50 rounded-industrial">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-industrial-600">库存趋势</h4>
          <span className="text-xs text-industrial-400">
            当前库存: <span className="font-mono font-medium text-industrial-600">{selectedTool.stock}</span> 件
          </span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} 件`, '库存']}
                labelFormatter={(label) => `时间: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="stock"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#stockGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderLowStockAlert = () => {
    if (lowStockTools.length === 0) return null;

    return (
      <div
        className={cn(
          'mb-4 rounded-industrial border overflow-hidden transition-all duration-200',
          'bg-warning-50 border-warning-200'
        )}
      >
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-warning-100/50 transition-colors"
          onClick={() => setLowStockExpanded(!lowStockExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-800">
                有 <span className="font-bold">{lowStockTools.length}</span> 把刀具库存低于安全线
              </p>
              <p className="text-xs text-warning-600 mt-0.5">
                点击展开查看详情，及时补充库存
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-warning-600">
            {lowStockExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        {lowStockExpanded && (
          <div className="border-t border-warning-200 bg-white/50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
              {lowStockTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-2 bg-white rounded-industrial border border-warning-100 hover:border-warning-300 cursor-pointer transition-colors"
                  onClick={() => openHistory(tool)}
                >
                  <div>
                    <p className="text-sm font-mono font-medium text-industrial-700">
                      {tool.toolNo}
                    </p>
                    <p className="text-xs text-industrial-400">{tool.toolName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-danger-600">
                      {tool.stock}/{tool.minStock}
                    </p>
                    <p className="text-xs text-industrial-400">当前/最低</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">刀具管理</h1>
          <p className="text-sm text-industrial-400 mt-1">刀具清单、领用及出入库管理</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4" />
            新增刀具
          </Button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-industrial-50 rounded-lg w-fit">
        <Button
          variant={activeTab === 'tools' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tools')}
          className={activeTab === 'tools' ? 'bg-white shadow-sm' : ''}
        >
          <List className="w-4 h-4 mr-1" />
          刀具列表
        </Button>
        <Button
          variant={activeTab === 'receive' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('receive')}
          className={activeTab === 'receive' ? 'bg-white shadow-sm' : ''}
        >
          <ClipboardList className="w-4 h-4 mr-1" />
          领用记录
        </Button>
        <Button
          variant={activeTab === 'transactions' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('transactions')}
          className={activeTab === 'transactions' ? 'bg-white shadow-sm' : ''}
        >
          <ArrowUpDown className="w-4 h-4 mr-1" />
          出入库流水
        </Button>
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
          icon={<PlayCircle className="w-5 h-5" />}
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

      {activeTab === 'tools' && (
        <Card>
          {renderLowStockAlert()}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
              <Input
                placeholder="搜索刀具编号、名称、品牌..."
                className="pl-9"
                value={searchText}
                onChange={(v) => setSearchText(v)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <Button
                  key={f.key}
                  variant={toolFilter === f.key ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setToolFilter(f.key)}
                  className={toolFilter === f.key ? 'shadow-sm' : ''}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <Table columns={toolColumns} data={filteredTools} rowKey="id" />
        </Card>
      )}

      {activeTab === 'receive' && (
        <Card>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="w-52">
              <Select
                label="刀具"
                value={receiveToolFilter}
                onChange={(v) => setReceiveToolFilter(v)}
                options={toolOptions}
              />
            </div>
            <div className="w-52">
              <Select
                label="机床"
                value={receiveMachineFilter}
                onChange={(v) => setReceiveMachineFilter(v)}
                options={machineOptions}
              />
            </div>
            <div className="w-52">
              <Input
                label="领用人"
                placeholder="模糊搜索..."
                value={receiveOperatorFilter}
                onChange={(v) => setReceiveOperatorFilter(v)}
              />
            </div>
          </div>
          <Table columns={receiveColumns} data={filteredReceiveRecords} rowKey="id" />
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-52">
              <Select
                label="刀具"
                value={transToolFilter}
                onChange={(v) => setTransToolFilter(v)}
                options={toolOptions}
              />
            </div>
          </div>
          <Table columns={transactionColumns} data={filteredTransactions} rowKey="id" />
        </Card>
      )}

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
            {renderToolInfo()}
            <div className="space-y-3">
              <Input
                label="领用数量"
                type="number"
                min="1"
                step="1"
                placeholder="请输入领用数量"
                value={receiveQty}
                onChange={(v) => setReceiveQty(v)}
                error={receiveError}
              />
              <Input
                label="领用人"
                placeholder="请输入领用人姓名"
                value={receiveOperator}
                onChange={(v) => setReceiveOperator(v)}
              />
              <Select
                label="使用机床"
                value={receiveMachineId}
                onChange={(v) => setReceiveMachineId(v)}
                options={[{ value: '', label: '请选择机床' }, ...machineSelectOptions]}
              />
              <Select
                label="关联任务"
                value={receiveTaskId}
                onChange={(v) => setReceiveTaskId(v)}
                options={[
                  { value: '', label: '不关联任务' },
                  ...taskOptions,
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title={selectedTool ? `编辑刀具 - ${selectedTool.toolNo}` : '编辑刀具'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              取消
            </Button>
            <Button onClick={handleEditSave}>保存</Button>
          </>
        }
      >
        {selectedTool && (
          <div className="space-y-3">
            <Input
              label="库存"
              type="number"
              min="0"
              value={editForm.stock}
              onChange={(v) => setEditForm({ ...editForm, stock: v })}
            />
            <Input
              label="最小库存"
              type="number"
              min="0"
              value={editForm.minStock}
              onChange={(v) => setEditForm({ ...editForm, minStock: v })}
            />
            <Input
              label="已用寿命(小时)"
              type="number"
              min="0"
              step="0.1"
              value={editForm.usedLife}
              onChange={(v) => setEditForm({ ...editForm, usedLife: v })}
            />
            <Input
              label="总寿命(小时)"
              type="number"
              min="0"
              step="0.1"
              value={editForm.totalLife}
              onChange={(v) => setEditForm({ ...editForm, totalLife: v })}
            />
            <Select
              label="状态"
              value={editForm.status}
              onChange={(v) => setEditForm({ ...editForm, status: v as ToolStatus })}
              options={[
                { value: 'available', label: getStatusText('available') },
                { value: 'in_use', label: getStatusText('in_use') },
                { value: 'worn', label: getStatusText('worn') },
                { value: 'broken', label: getStatusText('broken') },
              ]}
            />
            {editError && (
              <span className="text-xs text-danger-500 block">{editError}</span>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={showStockIn}
        onClose={() => setShowStockIn(false)}
        title="刀具入库"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStockIn(false)}>
              取消
            </Button>
            <Button onClick={handleStockIn}>确认入库</Button>
          </>
        }
      >
        {selectedTool && (
          <div className="space-y-4">
            {renderToolInfo()}
            <div className="space-y-3">
              <Input
                label="入库数量"
                type="number"
                min="1"
                step="1"
                placeholder="请输入入库数量"
                value={stockInQty}
                onChange={(v) => setStockInQty(v)}
                error={stockInError}
              />
              <Input
                label="操作人"
                placeholder="请输入操作人姓名"
                value={stockInOperator}
                onChange={(v) => setStockInOperator(v)}
              />
              <Input
                label="备注"
                multiline
                rows={3}
                placeholder="选填"
                value={stockInRemark}
                onChange={(v) => setStockInRemark(v)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showScrap}
        onClose={() => setShowScrap(false)}
        title="刀具报废"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowScrap(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleScrap}>
              确认报废
            </Button>
          </>
        }
      >
        {selectedTool && (
          <div className="space-y-4">
            {renderToolInfo()}
            <div className="space-y-3">
              <Input
                label="报废数量"
                type="number"
                min="1"
                step="1"
                placeholder={`最多报废 ${selectedTool.stock} 件`}
                value={scrapQty}
                onChange={(v) => setScrapQty(v)}
                error={scrapError}
              />
              <Input
                label="操作人"
                placeholder="请输入操作人姓名"
                value={scrapOperator}
                onChange={(v) => setScrapOperator(v)}
              />
              <Select
                label="关联任务（可选）"
                value={scrapTaskId}
                onChange={(v) => setScrapTaskId(v)}
                options={[
                  { value: '', label: '不关联任务' },
                  ...taskOptions,
                ]}
              />
              <Input
                label="备注"
                multiline
                rows={3}
                placeholder="选填"
                value={scrapRemark}
                onChange={(v) => setScrapRemark(v)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showToolHistory}
        onClose={() => setShowToolHistory(false)}
        title={selectedTool ? `${selectedTool.toolNo} - 库存追踪` : '库存追踪'}
        width={1000}
      >
        {selectedTool && (
          <div className="space-y-4">
            {renderStockChart()}
            <div>
              <h4 className="text-sm font-medium text-industrial-600 mb-2">出入库流水</h4>
              <Table
                columns={historyTransactionColumns}
                data={getToolTransactions(selectedTool.id)}
                rowKey="id"
                emptyText="暂无出入库记录"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

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
