import { useState, useMemo } from 'react';
import { Search, Clock, TrendingUp, TrendingDown, Minus, BarChart3, Timer, Target, Activity, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell } from 'recharts';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { StatCard } from '@/components/ui/StatCard';
import { formatNumber } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { CycleTimeStat } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const Statistics = () => {
  const { cycleTimeStats, tasks, processes } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedPart, setSelectedPart] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);
  const getProcessInfo = (id: string) => processes.find((p) => p.id === id);

  const partNos = Array.from(new Set(cycleTimeStats.map((s) => s.partNo)));
  const dates = Array.from(new Set(cycleTimeStats.map((s) => s.date))).sort();

  const filteredStats = cycleTimeStats.filter((s) => {
    const task = getTaskInfo(s.taskId);
    const process = task ? getProcessInfo(task.processId) : null;
    const matchSearch =
      s.partNo.includes(searchText) ||
      task?.taskNo.includes(searchText) ||
      process?.partName.includes(searchText) ||
      formatNumber(s.avgCycleTime, 1).includes(searchText);
    const matchPart = selectedPart === 'all' || s.partNo === selectedPart;
    const matchDate = selectedDate === 'all' || s.date === selectedDate;
    return matchSearch && matchPart && matchDate;
  });

  const summaryStats = useMemo(() => {
    if (filteredStats.length === 0) {
      return {
        totalSamples: 0,
        overallAvg: 0,
        overallMin: 0,
        overallMax: 0,
        totalQty: 0,
      };
    }
    const totalSamples = filteredStats.reduce((sum, s) => sum + s.sampleCount, 0);
    const totalQty = filteredStats.reduce((sum, s) => sum + s.sampleCount, 0);
    const weightedAvg =
      filteredStats.reduce((sum, s) => sum + s.avgCycleTime * s.sampleCount, 0) / totalSamples;
    const overallMin = Math.min(...filteredStats.map((s) => s.minCycleTime));
    const overallMax = Math.max(...filteredStats.map((s) => s.maxCycleTime));
    return { totalSamples, overallAvg: weightedAvg, overallMin, overallMax, totalQty };
  }, [filteredStats]);

  const chartData = useMemo(() => {
    return filteredStats.map((s) => {
      const task = getTaskInfo(s.taskId);
      const process = task ? getProcessInfo(task.processId) : null;
      return {
        name: `${s.partNo}-OP${s.operationNo}`,
        partName: process?.partName || '-',
        operationNo: s.operationNo,
        avg: s.avgCycleTime,
        min: s.minCycleTime,
        max: s.maxCycleTime,
        target: getTargetCycleTime(s.partNo, s.operationNo),
        sampleCount: s.sampleCount,
      };
    });
  }, [filteredStats]);

  const distributionData = useMemo(() => {
    const ranges = [
      { name: '<6min', min: 0, max: 6, count: 0, color: '#10b981' },
      { name: '6-10min', min: 6, max: 10, count: 0, color: '#165DFF' },
      { name: '10-15min', min: 10, max: 15, count: 0, color: '#f59e0b' },
      { name: '15-20min', min: 15, max: 20, count: 0, color: '#f97316' },
      { name: '>20min', min: 20, max: 999, count: 0, color: '#ef4444' },
    ];
    filteredStats.forEach((s) => {
      const avg = s.avgCycleTime;
      const range = ranges.find((r) => avg >= r.min && avg < r.max);
      if (range) range.count++;
    });
    return ranges.filter((r) => r.count > 0);
  }, [filteredStats]);

  const getTargetCycleTime = (partNo: string, operationNo: number): number => {
    const targets: Record<string, number> = {
      'PN-2024-001-10': 8.0,
      'PN-2024-001-20': 12.0,
      'PN-2024-001-30': 15.0,
      'PN-2024-002-10': 6.0,
      'PN-2024-002-20': 4.0,
    };
    return targets[`${partNo}-${operationNo}`] || 10;
  };

  const getTrendIcon = (avg: number, target: number) => {
    const diff = avg - target;
    const ratio = Math.abs(diff) / target;
    if (ratio > 0.1) return <TrendingUp className="w-4 h-4 text-danger-500" />;
    if (ratio > 0.05) return <Minus className="w-4 h-4 text-warning-500" />;
    return <TrendingDown className="w-4 h-4 text-success-500" />;
  };

  const getEfficiencyColor = (avg: number, target: number) => {
    const efficiency = (target / avg) * 100;
    if (efficiency >= 95) return 'text-success-600';
    if (efficiency >= 85) return 'text-warning-600';
    return 'text-danger-600';
  };

  const columns: TableColumn<CycleTimeStat>[] = [
    {
      key: 'index',
      title: '序号',
      width: 60,
      align: 'center',
      render: (_, index) => <span className="font-mono">{index + 1}</span>,
    },
    {
      key: 'date',
      title: '统计日期',
      width: 110,
      render: (record) => <span className="font-mono text-sm">{record.date}</span>,
    },
    {
      key: 'partNo',
      title: '零件编号',
      width: 140,
      render: (record) => {
        const task = getTaskInfo(record.taskId);
        const process = task ? getProcessInfo(task.processId) : null;
        return (
          <div>
            <p className="font-mono font-medium text-primary-600">{record.partNo}</p>
            <p className="text-xs text-industrial-400">{process?.partName || '-'}</p>
          </div>
        );
      },
    },
    {
      key: 'operationNo',
      title: '工序号',
      width: 80,
      align: 'center',
      render: (record) => <span className="font-mono font-bold">OP{record.operationNo}</span>,
    },
    {
      key: 'taskNo',
      title: '任务编号',
      width: 140,
      render: (record) => {
        const task = getTaskInfo(record.taskId);
        return <span className="font-mono">{task?.taskNo || '-'}</span>;
      },
    },
    {
      key: 'avgCycleTime',
      title: '平均节拍',
      width: 130,
      align: 'right',
      render: (record) => {
        const target = getTargetCycleTime(record.partNo, record.operationNo);
        return (
          <div className="flex items-center justify-end gap-2">
            {getTrendIcon(record.avgCycleTime, target)}
            <span className="font-mono font-bold text-industrial-600">
              {formatNumber(record.avgCycleTime, 2)}
            </span>
            <span className="text-industrial-300">分钟</span>
          </div>
        );
      },
    },
    {
      key: 'minCycleTime',
      title: '最短节拍',
      width: 110,
      align: 'right',
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <span className="font-mono text-success-600">{formatNumber(record.minCycleTime, 2)}</span>
          <span className="text-industrial-300 text-sm">分</span>
        </div>
      ),
    },
    {
      key: 'maxCycleTime',
      title: '最长节拍',
      width: 110,
      align: 'right',
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <span className="font-mono text-danger-600">{formatNumber(record.maxCycleTime, 2)}</span>
          <span className="text-industrial-300 text-sm">分</span>
        </div>
      ),
    },
    {
      key: 'target',
      title: '目标节拍',
      width: 110,
      align: 'right',
      render: (record) => {
        const target = getTargetCycleTime(record.partNo, record.operationNo);
        return (
          <div className="flex items-center justify-end gap-1">
            <span className="font-mono text-primary-600">{formatNumber(target, 2)}</span>
            <span className="text-industrial-300 text-sm">分</span>
          </div>
        );
      },
    },
    {
      key: 'efficiency',
      title: '效率',
      width: 100,
      align: 'right',
      render: (record) => {
        const target = getTargetCycleTime(record.partNo, record.operationNo);
        const efficiency = (target / record.avgCycleTime) * 100;
        return (
          <span className={cn('font-mono font-bold', getEfficiencyColor(record.avgCycleTime, target))}>
            {formatNumber(efficiency, 1)}%
          </span>
        );
      },
    },
    {
      key: 'sampleCount',
      title: '样本数',
      width: 90,
      align: 'center',
      render: (record) => <span className="font-mono font-medium">{record.sampleCount}</span>,
    },
  ];

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-industrial-200 rounded-industrial p-3 shadow-lg">
          <p className="text-sm font-medium text-industrial-600 mb-2">{data.name}</p>
          <p className="text-xs text-industrial-400 mb-1">{data.partName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: <span className="font-mono font-medium">{formatNumber(entry.value, 2)}</span> 分钟
            </p>
          ))}
          <p className="text-sm mt-1">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-primary-600" />
            样本数: <span className="font-mono font-medium">{data.sampleCount}</span> 件
          </p>
        </div>
      );
    }
    return null;
  };

  const DistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-industrial-200 rounded-industrial p-3 shadow-lg">
          <p className="text-sm">
            节拍范围: <span className="font-medium">{payload[0].payload.name}</span>
          </p>
          <p className="text-sm">
            工序数量: <span className="font-mono font-bold text-primary-600">{payload[0].value}</span>
          </p>
          <p className="text-sm text-industrial-400">
            占比: {formatNumber((payload[0].value / filteredStats.length) * 100, 1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">加工节拍统计</h1>
          <p className="text-sm text-industrial-400 mt-1">零件加工节拍数据分析与效率监控</p>
        </div>
        <Button variant="secondary">
          <RefreshCw className="w-4 h-4" />
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总样本数量"
          value={summaryStats.totalSamples.toLocaleString()}
          unit="件"
          icon={<Activity className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="综合平均节拍"
          value={formatNumber(summaryStats.overallAvg, 2)}
          unit="分钟/件"
          icon={<Timer className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="最短节拍"
          value={formatNumber(summaryStats.overallMin, 2)}
          unit="分钟"
          icon={<TrendingDown className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="最长节拍"
          value={formatNumber(summaryStats.overallMax, 2)}
          unit="分钟"
          icon={<TrendingUp className="w-6 h-6" />}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="节拍对比分析" className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <Select
              value={selectedPart}
              onChange={(v) => setSelectedPart(v)}
              options={[
                { value: 'all', label: '全部零件' },
                ...partNos.map((p) => ({ value: p, label: p })),
              ]}
              className="w-40"
            />
            <Select
              value={selectedDate}
              onChange={(v) => setSelectedDate(v)}
              options={[
                { value: 'all', label: '全部日期' },
                ...dates.map((d) => ({ value: d, label: d })),
              ]}
              className="w-36"
            />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => formatNumber(v, 1)}
                  label={{ value: '分钟', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip content={<BarTooltip />} />
                <Legend />
                <ReferenceLine
                  y={chartData[0]?.target}
                  stroke="#165DFF"
                  strokeDasharray="5 5"
                  label={{ value: '目标', position: 'right', fontSize: 12, fill: '#165DFF' }}
                />
                <Bar dataKey="min" name="最短节拍" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg" name="平均节拍" fill="#165DFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="最长节拍" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="节拍分布">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" name="工序数" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-industrial-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-industrial-400">平均效率</p>
                <p className="text-xl font-bold text-success-600">
                  {formatNumber(
                    filteredStats.reduce((sum, s) => {
                      const target = getTargetCycleTime(s.partNo, s.operationNo);
                      return sum + (target / s.avgCycleTime) * 100;
                    }, 0) / (filteredStats.length || 1),
                    1
                  )}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-industrial-400">节拍达标率</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatNumber(
                    (filteredStats.filter((s) => {
                      const target = getTargetCycleTime(s.partNo, s.operationNo);
                      return s.avgCycleTime <= target * 1.05;
                    }).length /
                      (filteredStats.length || 1)) *
                      100,
                    1
                  )}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="节拍趋势分析">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatNumber(v, 1)}
                label={{ value: '分钟', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip content={<BarTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg"
                name="实际平均"
                stroke="#165DFF"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="目标节拍"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索零件编号、任务编号、零件名称..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Select
            value={selectedPart}
            onChange={(v) => setSelectedPart(v)}
            options={[
              { value: 'all', label: '全部零件' },
              ...partNos.map((p) => ({ value: p, label: p })),
            ]}
            className="w-40"
          />
          <Select
            value={selectedDate}
            onChange={(v) => setSelectedDate(v)}
            options={[
              { value: 'all', label: '全部日期' },
              ...dates.map((d) => ({ value: d, label: d })),
            ]}
            className="w-36"
          />
        </div>

        <Table columns={columns} data={filteredStats} rowKey="id" />
      </Card>
    </div>
  );
};
