import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../common/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../common/ui/avatar';
import { Badge } from '../common/ui/badge';
import type { PatientUser } from './PatientPortal';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../common/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { notificationService, type Notification } from '../services/notificationService';

interface PatientHeaderProps {
  patient: PatientUser;
  onLogout?: () => void;
}

export function PatientHeader({ patient, onLogout }: PatientHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
      setLoading(false);
    };
    
    initialFetch();
    
    // Refresh notifications every 2 minutes
    const interval = setInterval(async () => {
      const data = await notificationService.getNotifications();
      if (data) setNotifications(data);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n.status !== 'READ').length : 0;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, status: 'READ' } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-pink-200 dark:border-slate-800 h-20 px-6 flex items-center sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 transition-colors">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">Welcome back, {patient.name ? patient.name.split(' ')[0] : 'User'}!</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">Manage your health, anytime, anywhere</p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-pink-50 dark:hover:bg-slate-800">
                <Bell className="size-5 text-gray-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-pink-600">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between px-2 py-1.5 cursor-default">
                <DropdownMenuLabel className="p-0 dark:text-white">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">Loading notifications...</div>
                ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.notification_id} 
                      className={`flex flex-col items-start gap-1 p-4 cursor-pointer border-b dark:border-slate-800 last:border-0 ${
                        notification.status !== 'READ' ? 'bg-pink-50/50 dark:bg-slate-800' : 'dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between w-full">
                        <span className={`font-semibold text-sm ${notification.status !== 'READ' ? 'text-pink-900 dark:text-pink-400' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">{formatNotificationTime(notification.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{notification.message}</p>
                      {notification.status !== 'READ' && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.notification_id, e)}
                          className="text-[10px] text-pink-600 mt-1 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              <DropdownMenuItem className="justify-center text-pink-600 dark:text-pink-400 font-medium cursor-pointer dark:hover:bg-slate-800">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3 border-l border-pink-200 dark:border-slate-700 pl-4">
            <Avatar>
              {patient.avatar ? (
                <AvatarImage src={patient.avatar} alt={patient.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                  <User className="size-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
              {patient.abhaId && (
                <p className="text-xs text-pink-600 dark:text-pink-400">ABHA: {patient.abhaId}</p>
              )}
            </div>
          </div>

          {onLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
