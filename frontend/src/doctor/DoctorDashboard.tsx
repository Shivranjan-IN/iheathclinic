import { useState } from 'react';
import { User } from '../common/types';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  TestTube,
  BarChart3,
  Brain,
  Activity,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { AppointmentManagement } from './AppointmentManagement';
import { Prescription } from './Prescription';
import { TelemedicineConsultationEnhanced } from './TelemedicineConsultationEnhanced';
import { PrescriptionRecords } from './PrescriptionRecords';
import { LabDiagnostics } from './LabDiagnostics';
import { ReportsAnalytics } from './ReportsAnalytics';
import { AIModules } from './AIModules';
import { IoTIntegration } from './IoTIntegration';
import { Notifications } from './Notifications';
import { PatientDocuments } from './PatientDocuments';
import { Settings } from './Settings';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface DoctorDashboardProps {
  user: User;
}

type DoctorView =
  | 'dashboard'
  | 'appointments'
  | 'prescription'
  | 'prescription_records'
  | 'lab'
  | 'reports'
  | 'patient_documents'
  | 'ai'
  | 'iot'
  | 'notifications'
  | 'settings'
  | 'video_consult';

const menuItems = [
  { id: 'dashboard' as DoctorView, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments' as DoctorView, label: 'Appointment Management', icon: Calendar },
  { id: 'prescription_records' as DoctorView, label: 'Prescription Records', icon: FileText },
  { id: 'lab' as DoctorView, label: 'Lab Diagnostics', icon: TestTube },
  { id: 'reports' as DoctorView, label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'patient_documents' as DoctorView, label: 'Patient Documents', icon: FileText },
  { id: 'ai' as DoctorView, label: 'AI Modules', icon: Brain },
  { id: 'iot' as DoctorView, label: 'IoT Integration', icon: Activity },
  { id: 'notifications' as DoctorView, label: 'Notifications', icon: Bell },
  { id: 'settings' as DoctorView, label: 'Settings', icon: SettingsIcon },
];

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [currentView, setCurrentView] = useState<DoctorView>('dashboard');
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleStartAppointment = (appointment: any) => {
    setActiveAppointment(appointment);
    if (appointment.mode === 'video') {
      setCurrentView('video_consult');
    } else {
      setCurrentView('prescription');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={user.role as any} />;
      case 'appointments':
        return <AppointmentManagement userRole={user.role as any} onStartAppointment={handleStartAppointment} />;
      case 'prescription':
        return <Prescription appointment={activeAppointment} onBack={() => setCurrentView('appointments')} />;
      case 'prescription_records':
        return <PrescriptionRecords />;
      case 'lab':
        return <LabDiagnostics userRole={user.role as any} />;
      case 'reports':
        return <ReportsAnalytics userRole={user.role as any} />;
      case 'patient_documents':
        return <PatientDocuments />;
      case 'ai':
        return <AIModules userRole={user.role as any} />;
      case 'iot':
        return <IoTIntegration userRole={user.role as any} />;
      case 'notifications':
        return <Notifications userRole={user.role as any} />;
      case 'settings':
        return <Settings userRole={user.role as any} />;
      case 'video_consult':
        return <TelemedicineConsultationEnhanced 
                  onClose={() => setCurrentView('appointments')} 
                  appointmentId={activeAppointment?.appointment_id} 
                />;
      default:
        return <Dashboard userRole={user.role as any} />;
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  // Get first letter of name for profile avatar fallback
  const avatarFallback = user.name ? user.name.charAt(0).toUpperCase() : 'D';

  return (
    <div className="flex h-screen bg-[#F0F2F5] dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 selection:bg-blue-600/10 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className={`h-full bg-white dark:bg-[#111625] border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className={`flex items-center gap-3 mb-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase italic truncate">I Health</h2>
            )}
          </div>
          {!isSidebarCollapsed && (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{user.name}</p>
              <div className="mt-2 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Medical Pro</span>
              </div>
            </>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center transition-all duration-300 relative group ${
                  isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'px-4 py-3.5 rounded-2xl gap-4'
                } ${isActive
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!isSidebarCollapsed && (
                  <span className="font-bold text-sm tracking-wide truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Collapse Sidebar Button at Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-100 dark:border-slate-800"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Sticky Top Header */}
        <header className="h-20 bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 shrink-0 z-10 shadow-sm transition-colors duration-300">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {menuItems.find(item => item.id === currentView)?.label || 'Doctor Portal'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ThemeToggle />
            </div>
            
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
            
            {/* User Profile Badge */}
            <button 
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shadow-md shadow-blue-500/5 group-hover:scale-105 transition-transform border border-blue-200 dark:border-blue-800/30">
                {avatarFallback}
              </div>
              <div className="hidden sm:block">
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Medical Specialist</p>
              </div>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-bold group border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
              title="Secure Sign Out"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#F0F2F5] dark:bg-[#0a0d14] transition-colors duration-300">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
          
          <div className="p-10 relative z-10 max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
