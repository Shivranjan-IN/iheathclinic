import {
  LayoutDashboard,
  Brain,
  ShoppingBag,
  User,
  Calendar,
  FileText,
  FolderOpen,
  CreditCard,
  Activity,
  ShoppingCart,
  History,
  Bell
} from 'lucide-react';
import { cn } from '../common/ui/utils';
import type { PatientPage } from './PatientPortal';

interface PatientSidebarProps {
  currentPage: PatientPage;
  onPageChange: (page: PatientPage) => void;
}

const menuItems = [
  { id: 'dashboard' as PatientPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-tools' as PatientPage, label: 'AI Health Tools', icon: Brain },
  { id: 'medicine-store' as PatientPage, label: 'Buy Medicine', icon: ShoppingBag },
  { id: 'book-appointment' as PatientPage, label: 'Book Appointment', icon: Calendar },
  { id: 'appointments' as PatientPage, label: 'Doctor', icon: Calendar },
  { id: 'profile' as PatientPage, label: 'My Profile', icon: User },
  { id: 'prescriptions' as PatientPage, label: 'My Prescriptions', icon: FileText },
  { id: 'reports' as PatientPage, label: 'My Reports', icon: FolderOpen },
  { id: 'cart' as PatientPage, label: 'My Cart', icon: ShoppingCart },
  { id: 'orders' as PatientPage, label: 'Order History', icon: History },
  { id: 'reminders' as PatientPage, label: 'Reminders', icon: Bell },
  { id: 'billing' as PatientPage, label: 'My Billing', icon: CreditCard },
];

export function PatientSidebar({ currentPage, onPageChange }: PatientSidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="size-8 text-pink-600 dark:text-pink-500" />
          <div>
            <h1 className="font-bold text-gray-900 dark:text-slate-100">I Health Clinic</h1>
            <p className="text-xs text-gray-600 dark:text-slate-400">Patient Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-slate-700'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-4 border border-pink-200 dark:border-slate-700">
          <p className="text-xs font-medium text-pink-900 dark:text-pink-400 mb-1">Need Help?</p>
          <p className="text-xs text-pink-700 dark:text-slate-300 mb-3">Contact our support team</p>
          <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs py-2 rounded-md hover:from-pink-700 hover:to-purple-700">
            Get Support
          </button>
        </div>
      </div>
    </aside>
  );
}