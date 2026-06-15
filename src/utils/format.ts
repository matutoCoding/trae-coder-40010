export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    approved: '已批准',
    obsolete: '已作废',
    verified: '已验证',
    released: '已发布',
    available: '可用',
    in_use: '使用中',
    worn: '已磨损',
    broken: '已损坏',
    idle: '空闲',
    running: '运行中',
    maintenance: '维护中',
    error: '故障',
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    paused: '已暂停',
    pass: '合格',
    fail: '不合格',
    repairing: '维修中',
    repaired: '已修复',
    scrapped: '已报废',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'bg-industrial-50 text-industrial-400',
    approved: 'bg-success-50 text-success-600',
    obsolete: 'bg-industrial-50 text-industrial-400',
    verified: 'bg-primary-50 text-primary-600',
    released: 'bg-success-50 text-success-600',
    available: 'bg-success-50 text-success-600',
    in_use: 'bg-primary-50 text-primary-600',
    worn: 'bg-warning-50 text-warning-600',
    broken: 'bg-danger-50 text-danger-600',
    idle: 'bg-industrial-50 text-industrial-400',
    running: 'bg-success-50 text-success-600',
    maintenance: 'bg-warning-50 text-warning-600',
    error: 'bg-danger-50 text-danger-600',
    pending: 'bg-warning-50 text-warning-600',
    in_progress: 'bg-primary-50 text-primary-600',
    completed: 'bg-success-50 text-success-600',
    paused: 'bg-industrial-50 text-industrial-400',
    pass: 'bg-success-50 text-success-600',
    fail: 'bg-danger-50 text-danger-600',
    repairing: 'bg-warning-50 text-warning-600',
    repaired: 'bg-success-50 text-success-600',
    scrapped: 'bg-danger-50 text-danger-600',
  };
  return colorMap[status] || 'bg-industrial-50 text-industrial-400';
};

export const getToolTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    endmill: '铣刀',
    drill: '钻头',
    turning: '车刀',
    boring: '镗刀',
    other: '其他',
  };
  return typeMap[type] || type;
};

export const getAlertTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    tool: 'Wrench',
    machine: 'Cog',
    quality: 'CheckCircle2',
    schedule: 'Calendar',
  };
  return iconMap[type] || 'AlertCircle';
};

export const getAlertLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    info: 'text-primary-500 bg-primary-50',
    warning: 'text-warning-500 bg-warning-50',
    error: 'text-danger-500 bg-danger-50',
  };
  return colorMap[level] || 'text-industrial-400 bg-industrial-50';
};
