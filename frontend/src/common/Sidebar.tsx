import { PageView as Page, UserRole } from './types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  CreditCard,
  Pill,
  FileText,
  Building2,
  FlaskConical,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
  Sparkles,
  Activity,
  Shield,
  ClipboardList,
  UserCog
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  userRole: UserRole;
}

interface MenuItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'reception', 'nurse', 'lab', 'pharmacy'] },
  { id: 'clinic-profile', label: 'Clinic Profile', icon: Building2, roles: ['admin', 'reception'] },
  { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'reception', 'nurse'] },
  { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'reception'] },
  { id: 'queue', label: 'Queue Management', icon: ClipboardList, roles: ['admin', 'reception', 'nurse'] },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin', 'reception'] },
  { id: 'staff', label: 'Staff', icon: UserCog, roles: ['admin', 'reception'] },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText, roles: ['admin', 'doctor', 'nurse', 'pharmacy'] },
  { id: 'lab', label: 'Lab & Diagnostics', icon: FlaskConical, roles: ['admin', 'doctor', 'lab'] },
  { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['admin', 'reception'] },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, roles: ['admin', 'pharmacy', 'reception'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'doctor', 'reception'] },
  { id: 'ai-modules', label: 'AI Modules', icon: Sparkles, roles: ['admin', 'doctor', 'reception'] },
  { id: 'iot', label: 'IoT & Wearables', icon: Activity, roles: ['admin', 'doctor', 'nurse'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'doctor', 'reception', 'nurse', 'lab', 'pharmacy'] },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['admin', 'doctor', 'reception', 'nurse', 'lab', 'pharmacy'] },
];

export function Sidebar({ currentPage, onPageChange, userRole }: SidebarProps) {
  const accessibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">I Health Clinic</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Healthcare Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {accessibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
