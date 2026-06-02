import { User } from './types';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 h-20 px-6 flex items-center sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Welcome back, {user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{(user.role || 'user').replace('_', ' ')}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-slate-100">{user.name}</p>
              <p className="text-gray-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
