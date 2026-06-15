import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Code2,
  Wrench,
  CalendarClock,
  PlayCircle,
  ClipboardCheck,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Drill,
  Ruler,
  Activity,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', label: '仪表板', icon: LayoutDashboard },
  {
    path: '/process',
    label: '图纸工艺',
    icon: FileText,
    children: [{ path: '/process', label: '零件加工工艺', icon: Ruler }],
  },
  {
    path: '/program',
    label: '程序编制',
    icon: Code2,
    children: [{ path: '/program', label: '数控程序编制', icon: Code2 }],
  },
  {
    path: '/tool',
    label: '刀具管理',
    icon: Wrench,
    children: [
      { path: '/tool', label: '刀具清单领用', icon: Drill },
      { path: '/tool/compensation', label: '刀具补偿设置', icon: Settings },
    ],
  },
  {
    path: '/schedule',
    label: '机床排产',
    icon: CalendarClock,
    children: [{ path: '/schedule', label: '机床任务排产', icon: CalendarClock }],
  },
  {
    path: '/operation',
    label: '加工作业',
    icon: PlayCircle,
    children: [
      { path: '/operation/setup', label: '装夹找正记录', icon: Activity },
      { path: '/operation/deburr', label: '工件去毛刺', icon: Wrench },
    ],
  },
  {
    path: '/inspection',
    label: '首件检验',
    icon: ClipboardCheck,
    children: [
      { path: '/inspection/first', label: '加工尺寸首检', icon: ClipboardCheck },
      { path: '/inspection/online', label: '在线测量数据', icon: Gauge },
    ],
  },
  {
    path: '/tool-life',
    label: '刀具寿命',
    icon: Timer,
    children: [
      { path: '/tool-life/wear', label: '刀具磨损记录', icon: Activity },
      { path: '/tool-life/repair', label: '断刀报修登记', icon: AlertTriangle },
    ],
  },
  {
    path: '/statistics',
    label: '加工节拍统计',
    icon: BarChart3,
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const isPathActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isChildActive = (children: { path: string }[]) => {
    return children.some((child) => location.pathname.startsWith(child.path));
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-industrial-600 text-white transition-all duration-300',
        sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-industrial-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-industrial flex items-center justify-center">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">数控车间管理</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-primary-500 rounded-industrial flex items-center justify-center">
              <Gauge className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.children ? item.children[0].path : item.path}
              className={({ isActive }) =>
                cn(
                  'sidebar-item',
                  isPathActive(item.path) && 'sidebar-item-active',
                  sidebarCollapsed && 'justify-center px-0'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
            {!sidebarCollapsed && item.children && isChildActive(item.children) && (
              <div className="ml-4">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      cn(
                        'sidebar-item text-xs',
                        isActive && 'sidebar-item-active',
                        'ml-2'
                      )
                    }
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-industrial-700">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-industrial-300 hover:text-white hover:bg-industrial-700 rounded-industrial transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
};
