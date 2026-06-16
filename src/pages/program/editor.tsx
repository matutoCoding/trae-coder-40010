import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { GCodeLanguage } from 'gcode-lang-codemirror';
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Play,
  Eye,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const ProgramEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { programs, processes, updateProgram } = useAppStore();
  const program = programs.find((p) => p.id === id);

  const [code, setCode] = useState('');
  const [programName, setProgramName] = useState('');
  const [processId, setProcessId] = useState('');
  const [machineType, setMachineType] = useState('');

  useEffect(() => {
    if (program) {
      setCode(program.content);
      setProgramName(program.programName);
      setProcessId(program.processId);
      setMachineType(program.machineType);
    }
  }, [program]);

  const handleSave = () => {
    if (!program) return;
    updateProgram({
      ...program,
      programName,
      processId,
      machineType,
      content: code,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  };

  const handleRelease = () => {
    if (!program) return;
    updateProgram({
      ...program,
      status: 'released',
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-industrial-400">程序不存在</p>
      </div>
    );
  }

  const processOptions = processes.map((p) => ({
    value: p.id,
    label: `${p.partNo} - ${p.partName}`,
  }));

  const lineCount = code.split('\n').length;

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/program')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-industrial-600 flex items-center gap-2">
              {program.programNo}
              <StatusBadge status={program.status} />
            </h1>
            <p className="text-sm text-industrial-400 mt-1">数控程序编辑器</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <History className="w-4 h-4" />
            版本历史
          </Button>
          <Button variant="secondary">
            <Eye className="w-4 h-4" />
            仿真预览
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            下载
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            保存
          </Button>
          {program.status !== 'released' && (
            <Button variant="secondary" onClick={handleRelease}>
              <CheckCircle2 className="w-4 h-4" />
              发布
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-4">
          <Card title="程序信息">
            <div className="space-y-4">
              <Input
                label="程序名称"
                value={programName}
                onChange={(v) => setProgramName(v)}
              />
              <Select
                label="所属工艺"
                value={processId}
                onChange={(v) => setProcessId(v)}
                options={processOptions}
              />
              <Input
                label="适用机床"
                value={machineType}
                onChange={(v) => setMachineType(v)}
              />
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">版本</p>
                <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
                  {program.version}
                </p>
              </div>
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-xs text-industrial-400">行数</p>
                <p className="text-sm font-medium text-industrial-600 mt-1 font-mono">
                  {lineCount} 行
                </p>
              </div>
            </div>
          </Card>

          <Card title="操作记录">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success-500 rounded-full mt-1.5" />
                <div>
                  <p className="text-sm text-industrial-600">程序创建</p>
                  <p className="text-xs text-industrial-400">{program.createTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                <div>
                  <p className="text-sm text-industrial-600">最后更新</p>
                  <p className="text-xs text-industrial-400">{program.updateTime}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0" title="代码编辑">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-industrial-100">
              <Button size="sm" variant="ghost">
                <Play className="w-4 h-4" />
                语法检查
              </Button>
              <Button size="sm" variant="ghost">
                格式化
              </Button>
              <div className="flex-1" />
              <span className="text-xs text-industrial-400 font-mono">
                G-Code | ISO
              </span>
            </div>
            <div className="flex-1 min-h-0 border border-industrial-100 rounded-industrial overflow-hidden">
              <CodeMirror
                value={code}
                height="100%"
                extensions={[GCodeLanguage()]}
                onChange={setCode}
                theme="dark"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                }}
                style={{ height: '100%', fontSize: '13px' }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
