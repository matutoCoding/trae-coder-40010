import { useState } from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getAlertLevelColor } from '@/utils/format';

export const Header = () => {
  const { alerts, markAlertRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useState(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
  });

  return (
    <header className="h-14 bg-white border-b border-industrial-100 flex items-center justify-between px-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
          <Input placeholder="搜索工艺、程序、刀具..." className="pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-industrial-400 font-mono hidden md:block">
          {currentTime}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="w-5 h-5 text-industrial-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-industrial shadow-industrial-lg border border-industrial-100 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-industrial-100">
                <h4 className="font-medium text-industrial-600">通知中心</h4>
                <X
                  className="w-4 h-4 text-industrial-400 cursor-pointer hover:text-industrial-600"
                  onClick={() => setShowNotifications(false)}
                />
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-industrial-400">暂无通知</div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'px-4 py-3 border-b border-industrial-50 hover:bg-industrial-50 cursor-pointer transition-colors',
                        !alert.read && 'bg-primary-50/30'
                      )}
                      onClick={() => markAlertRead(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            getAlertLevelColor(alert.level)
                          )}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-industrial-600">{alert.title}</span>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-industrial-400 mt-0.5 line-clamp-2">{alert.message}</p>
                          <span className="text-xs text-industrial-300 mt-1 block">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-industrial-100">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-industrial-600">管理员</p>
            <p className="text-xs text-industrial-400">车间主任</p>
          </div>
        </div>
      </div>
    </header>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
