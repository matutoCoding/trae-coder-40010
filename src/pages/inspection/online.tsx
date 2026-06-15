import { useState, useEffect } from 'react';
import { Search, Thermometer, Activity, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { formatNumber } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { OnlineMeasurement as OnlineMeasurementType } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const OnlineMeasurement = () => {
  const { onlineMeasurements, tasks } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedTask, setSelectedTask] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);

  const features = Array.from(new Set(onlineMeasurements.map((m) => m.feature)));

  const filteredMeasurements = onlineMeasurements.filter((m) => {
    const task = getTaskInfo(m.taskId);
    const matchSearch =
      m.feature.includes(searchText) ||
      task?.taskNo.includes(searchText) ||
      formatNumber(m.measuredValue, 3).includes(searchText);
    const matchTask = selectedTask === 'all' || m.taskId === selectedTask;
    const matchFeature = selectedFeature === 'all' || m.feature === selectedFeature;
    return matchSearch && matchTask && matchFeature;
  });

  useEffect(() => {
    const featureData = filteredMeasurements
      .slice(-30)
      .map((m, index) => ({
        index: index + 1,
        time: m.timestamp.substring(11, 19),
        value: m.measuredValue,
        deviation: m.deviation,
        upperLimit: m.feature === '孔径' ? 40.025 : 25.03,
        lowerLimit: m.feature === '孔径' ? 40.0 : 24.97,
        nominal: m.feature === '孔径' ? 40.0125 : 25.0,
      }));
    setChartData(featureData);
  }, [filteredMeasurements]);

  const getTrendIcon = (deviation: number, prevDeviation?: number) => {
    if (!prevDeviation) return <Minus className="w-4 h-4 text-industrial-400" />;
    if (Math.abs(deviation) > Math.abs(prevDeviation)) {
      return <TrendingUp className="w-4 h-4 text-danger-500" />;
    } else if (Math.abs(deviation) < Math.abs(prevDeviation)) {
      return <TrendingDown className="w-4 h-4 text-success-500" />;
    }
    return <Minus className="w-4 h-4 text-industrial-400" />;
  };

  const columns: TableColumn<OnlineMeasurementType>[] = [
    {
      key: 'index',
      title: '序号',
      width: 60,
      align: 'center',
      render: (_, index) => <span className="font-mono">{index + 1}</span>,
    },
    {
      key: 'time',
      title: '测量时间',
      width: 160,
      render: (record) => (
        <span className="font-mono text-sm text-industrial-500">
          {record.timestamp.replace('T', ' ').substring(0, 19)}
        </span>
      ),
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
      key: 'feature',
      title: '测量特性',
      width: 120,
      render: (record) => (
        <span className="font-medium text-primary-600">{record.feature}</span>
      ),
    },
    {
      key: 'measuredValue',
      title: '测量值',
      width: 140,
      align: 'right',
      render: (record) => {
        const nominal = record.feature === '孔径' ? 40.0125 : 25.0;
        const upperTol = record.feature === '孔径' ? 0.0125 : 0.03;
        const lowerTol = record.feature === '孔径' ? 0.0125 : 0.03;
        const deviation = record.measuredValue - nominal;
        const isPass = Math.abs(deviation) <= upperTol;
        return (
          <div className="flex items-center justify-end gap-2">
            <span
              className={cn(
                'font-mono font-bold',
                isPass ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {formatNumber(record.measuredValue, 4)}
            </span>
            <span className="text-industrial-300">mm</span>
          </div>
        );
      },
    },
    {
      key: 'deviation',
      title: '偏差',
      width: 120,
      align: 'right',
      render: (record, index) => {
        const prev = filteredMeasurements[index - 1];
        return (
          <div className="flex items-center justify-end gap-2">
            {getTrendIcon(record.deviation, prev?.deviation)}
            <span
              className={cn(
                'font-mono font-medium',
                Math.abs(record.deviation) > 0.02
                  ? 'text-danger-600'
                  : Math.abs(record.deviation) > 0.01
                  ? 'text-warning-600'
                  : 'text-success-600'
              )}
            >
              {record.deviation >= 0 ? '+' : ''}
              {formatNumber(record.deviation, 4)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'temperature',
      title: '环境温度',
      width: 120,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Thermometer className="w-4 h-4 text-warning-500" />
          <span className="font-mono">{record.temperature?.toFixed(1)}°C</span>
        </div>
      ),
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-industrial-200 rounded-industrial p-3 shadow-lg">
          <p className="text-xs text-industrial-400 mb-2">序号: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-mono font-medium">{formatNumber(entry.value, 4)}</span> mm
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-industrial-600">在线测量数据</h1>
          <p className="text-sm text-industrial-400 mt-1">加工过程实时测量数据监控</p>
        </div>
        <Button variant="secondary">
          <RefreshCw className="w-4 h-4" />
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总测量点数</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">{onlineMeasurements.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-50 rounded-industrial text-success-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">合格点</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {onlineMeasurements.filter((m) => Math.abs(m.deviation) <= 0.02).length}
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
              <p className="text-sm text-industrial-400">预警点</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {onlineMeasurements.filter((m) => Math.abs(m.deviation) > 0.01 && Math.abs(m.deviation) <= 0.02).length}
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
              <p className="text-sm text-industrial-400">超差点</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {onlineMeasurements.filter((m) => Math.abs(m.deviation) > 0.02).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="测量趋势图">
        <div className="flex items-center gap-4 mb-4">
          <Select
            value={selectedTask}
            onChange={setSelectedTask}
            options={[
              { value: 'all', label: '全部任务' },
              ...tasks.map((t) => ({ value: t.id, label: t.taskNo })),
            ]}
            className="w-40"
          />
          <Select
            value={selectedFeature}
            onChange={setSelectedFeature}
            options={[
              { value: 'all', label: '全部特性' },
              ...features.map((f) => ({ value: f, label: f })),
            ]}
            className="w-32"
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 3)} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={chartData[0]?.nominal} stroke="#165DFF" strokeDasharray="5 5" label={{ value: '公称值', position: 'right', fontSize: 12, fill: '#165DFF' }} />
              <ReferenceLine y={chartData[0]?.upperLimit} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '上公差', position: 'right', fontSize: 12, fill: '#f59e0b' }} />
              <ReferenceLine y={chartData[0]?.lowerLimit} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '下公差', position: 'right', fontSize: 12, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="value" stroke="#165DFF" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="测量值" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索测量特性、任务编号、测量值..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <Table columns={columns} data={filteredMeasurements} rowKey="id" />
      </Card>
    </div>
  );
};

function CheckCircle(props: { className?: string }) {
  return <CC {...props} />;
}
function AlertTriangle(props: { className?: string }) {
  return <AT {...props} />;
}
function XCircle(props: { className?: string }) {
  return <XC {...props} />;
}

import { CheckCircle as CC, AlertTriangle as AT, XCircle as XC } from 'lucide-react';
