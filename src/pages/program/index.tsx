import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Code2, Eye, Edit, Download, Upload, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { TableColumn } from '@/components/ui/Table';
import type { NCProgram } from '@/types';

export const ProgramList = () => {
  const navigate = useNavigate();
  const { programs, processes } = useAppStore();
  const [searchText, setSearchText] = useState('');

  const filteredPrograms = programs.filter(
    (p) =>
      p.programName.includes(searchText) ||
      p.programNo.includes(searchText) ||
      p.machineType.includes(searchText)
  );

  const columns: TableColumn<NCProgram>[] = [
    { key: 'programNo', title: '程序号', width: 120 },
    { key: 'programName', title: '程序名称', width: 180 },
    {
      key: 'processId',
      title: '所属零件',
      width: 180,
      render: (record) => {
        const process = processes.find((p) => p.id === record.processId);
        return process ? `${process.partNo} - ${process.partName}` : record.processId;
      },
    },
    { key: 'machineType', title: '适用机床', width: 120 },
    { key: 'version', title: '版本', width: 80, align: 'center' },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (record) => <StatusBadge status={record.status} />,
    },
    { key: 'createTime', title: '创建时间', width: 160 },
    {
      key: 'action',
      title: '操作',
      width: 200,
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/program/${record.id}`)}
          >
            <Code2 className="w-4 h-4" />
            编辑
          </Button>
          <Button size="sm" variant="ghost">
            <Download className="w-4 h-4" />
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
          <h1 className="text-xl font-bold text-industrial-600">程序编制</h1>
          <p className="text-sm text-industrial-400 mt-1">数控程序管理与编辑</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Upload className="w-4 h-4" />
            上传程序
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            新建程序
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <Input
              placeholder="搜索程序号、名称..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">全部</Button>
            <Button variant="ghost" size="sm">已发布</Button>
            <Button variant="ghost" size="sm">已验证</Button>
            <Button variant="ghost" size="sm">草稿</Button>
          </div>
        </div>

        <Table columns={columns} data={filteredPrograms} rowKey="id" />
      </Card>
    </div>
  );
};
