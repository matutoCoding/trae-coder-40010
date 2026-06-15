import { useState } from 'react';
import { Search, CheckCircle, XCircle, FileText, Ruler, Thermometer, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatNumber } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { FirstInspection } from '@/types';

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const InspectionList = () => {
  const { inspections, tasks } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [viewDetail, setViewDetail] = useState<FirstInspection | null>(null);

  const getTaskInfo = (id: string) => tasks.find((t) => t.id === id);

  const filteredInspections = inspections.filter((i) => {
    const task = getTaskInfo(i.taskId);
    return (
      i.partNo.includes(searchText) ||
      i.inspector.includes(searchText) ||
      task?.taskNo.includes(searchText)
    );
  });

  const columns: TableColumn<FirstInspection>[] = [
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
      title: '合格数',
      width: 100,
      align: 'center',
      render: (record) => (
        <span className="font-mono text-success-600">
          {record.inspectionItems.filter((i) => i.result === 'pass').length}
        </span>
      ),
    },
    {
      key: 'failCount',
      title: '不合格数',
      width: 100,
      align: 'center',
      render: (record) => {
        const failCount = record.inspectionItems.filter((i) => i.result === 'fail').length;
        return (
          <span className={cn('font-mono', failCount > 0 ? 'text-danger-600' : 'text-industrial-400')}>
            {failCount}
          </span>
        );
      },
    },
    {
      key: 'passRate',
      title: '合格率',
      width: 120,
      align: 'center',
      render: (record) => {
        const passCount = record.inspectionItems.filter((i) => i.result === 'pass').length;
        const rate = (passCount / record.inspectionItems.length) * 100;
        return (
          <span
            className={cn(
              'font-mono font-bold',
              rate >= 100 ? 'text-success-600' : rate >= 90 ? 'text-warning-600' : 'text-danger-600'
            )}
          >
            {formatNumber(rate, 1)}%
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
          <h1 className="text-xl font-bold text-industrial-600">首件检验</h1>
          <p className="text-sm text-industrial-400 mt-1">首件检验记录管理</p>
        </div>
        <div className="flex gap-2">
          <Link to="/inspection/first">
            <Button variant="secondary">
              <Ruler className="w-4 h-4" />
              尺寸首检
            </Button>
          </Link>
          <Link to="/inspection/online">
            <Button variant="secondary">
              <Thermometer className="w-4 h-4" />
              在线测量
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-industrial text-primary-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">总检验数</p>
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
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 rounded-industrial text-warning-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-industrial-400">平均合格率</p>
              <p className="text-2xl font-bold text-industrial-600 data-number">
                {formatNumber(
                  inspections.reduce(
                    (sum: number, i) =>
                      sum +
                      (i.inspectionItems.filter((it) => it.result === 'pass').length /
                        i.inspectionItems.length) *
                        100,
                    0
                  ) / inspections.length,
                  1
                )}
                %
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
        open={!!viewDetail}
        onClose={() => setViewDetail(null)}
        title="首件检验详情"
        width={800}
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
                <p className="text-xs text-industrial-400">零件图号</p>
                <p className="font-mono font-medium mt-1">{viewDetail.partNo}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">检验员</p>
                <p className="font-medium mt-1">{viewDetail.inspector}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">检验结果</p>
                <div className="mt-1">
                  <StatusBadge status={viewDetail.result} />
                </div>
              </div>
            </div>

            <div className="border border-industrial-200 rounded-industrial overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-industrial-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-industrial-500 font-medium">检测项目</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">公称值</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">上偏差</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">下偏差</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">实测值</th>
                    <th className="px-4 py-3 text-right text-industrial-500 font-medium">偏差</th>
                    <th className="px-4 py-3 text-center text-industrial-500 font-medium">结果</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDetail.inspectionItems.map((item, index) => {
                    const deviation = item.measuredValue - item.nominal;
                    const isPass = item.result === 'pass';
                    return (
                      <tr key={index} className="border-t border-industrial-100">
                        <td className="px-4 py-3 font-medium">{item.featureName}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatNumber(item.nominal, 3)}</td>
                        <td className="px-4 py-3 text-right font-mono text-success-600">
                          +{formatNumber(item.upperTolerance, 3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-danger-600">
                          {formatNumber(-item.lowerTolerance, 3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={cn(isPass ? 'text-success-600' : 'text-danger-600')}>
                            {formatNumber(item.measuredValue, 3)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span
                            className={cn(
                              Math.abs(deviation) > item.upperTolerance ||
                              Math.abs(deviation) > Math.abs(item.lowerTolerance)
                                ? 'text-danger-600'
                                : 'text-industrial-500'
                            )}
                          >
                            {deviation >= 0 ? '+' : ''}
                            {formatNumber(deviation, 3)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={item.result} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 bg-industrial-50 rounded-industrial">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-industrial-400" />
                <span className="text-sm text-industrial-500">检验时间</span>
              </div>
              <span className="font-mono font-medium">{viewDetail.createTime}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function Modal(props: any) {
  return <M {...props} />;
}

import { Modal as M } from '@/components/ui/Modal';
