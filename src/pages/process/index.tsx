import { useState } from 'react';
import { Plus, Search, FileText, Eye, Edit, Trash2, Ruler, Clock, Wrench, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { formatTime } from '@/utils/format';
import type { TableColumn } from '@/components/ui/Table';
import type { Process } from '@/types';

export const ProcessList = () => {
  const { processes, tools } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredProcesses = processes.filter(
    (p) =>
      p.partName.includes(searchText) ||
      p.partNo.includes(searchText) ||
      p.drawingNo.includes(searchText)
  );

  const columns: TableColumn<Process>[] = [
    { key: 'partNo', title: '零件编号', width: 140 },
    { key: 'partName', title: '零件名称', width: 140 },
    { key: 'drawingNo', title: '图纸编号', width: 140 },
    { key: 'material', title: '材料', width: 100 },
    { key: 'quantity', title: '数量', width: 80, align: 'center' },
    {
      key: 'operations',
      title: '工序数',
      width: 80,
      align: 'center',
      render: (record) => record.operations.length,
    },
    { key: 'version', title: '版本', width: 80, align: 'center' },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'action',
      title: '操作',
      width: 160,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedProcess(record);
              setShowDetail(true);
            }}
          >
            <Eye className="w-4 h-4" />
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
          <h1 className="text-xl font-bold text-industrial-600">图纸工艺</h1>
          <p className="text-sm text-industrial-400 mt-1">零件加工工艺管理</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          新建工艺
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索零件编号、名称、图纸号..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">全部</Button>
            <Button variant="ghost" size="sm">已批准</Button>
            <Button variant="ghost" size="sm">草稿</Button>
          </div>
        </div>

        <Table columns={columns} data={filteredProcesses} rowKey="id" />
      </Card>

      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="工艺详情"
        width="w-[900px]"
      >
        {selectedProcess && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">零件编号</p>
                <p className="text-sm font-medium text-industrial-600 mt-1">{selectedProcess.partNo}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">零件名称</p>
                <p className="text-sm font-medium text-industrial-600 mt-1">{selectedProcess.partName}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">图纸编号</p>
                <p className="text-sm font-medium text-industrial-600 mt-1">{selectedProcess.drawingNo}</p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">材料</p>
                <p className="text-sm font-medium text-industrial-600 mt-1">{selectedProcess.material}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-industrial-600 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary-500" />
                工艺路线
              </h3>
              <div className="space-y-3">
                {selectedProcess.operations.map((op, index) => (
                  <div
                    key={op.id}
                    className="border border-industrial-100 rounded-industrial p-4 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {op.operationNo}
                        </div>
                        <div>
                          <p className="font-medium text-industrial-600">{op.operationName}</p>
                          <p className="text-xs text-industrial-400">{op.machineType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-industrial-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          准备: {formatTime(op.setupTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          节拍: {op.cycleTime}分钟
                        </span>
                      </div>
                    </div>

                    {op.parameters.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-industrial-400 mb-2">工艺参数</p>
                        <div className="grid grid-cols-3 gap-2">
                          {op.parameters.map((param, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-industrial-400">{param.name}:</span>
                              <span className="font-mono font-medium text-industrial-600">
                                {param.value} {param.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-industrial-400 mb-2 flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        所需刀具
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {op.toolList.map((toolId) => {
                          const tool = tools.find((t) => t.id === toolId);
                          return tool ? (
                            <span
                              key={toolId}
                              className="px-2 py-1 bg-industrial-50 text-industrial-600 text-xs rounded-industrial font-mono"
                            >
                              {tool.toolNo} - {tool.toolName}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {index < selectedProcess.operations.length - 1 && (
                      <div className="flex justify-center mt-3">
                        <ChevronRight className="w-5 h-5 text-industrial-200 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-industrial-100">
              <div className="flex items-center gap-4 text-sm text-industrial-400">
                <span>版本: {selectedProcess.version}</span>
                <span>创建: {selectedProcess.createTime}</span>
                <span>更新: {selectedProcess.updateTime}</span>
              </div>
              <StatusBadge status={selectedProcess.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
