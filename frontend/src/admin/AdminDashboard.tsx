import { useEffect, useState } from 'react';
import { User } from '../common/types';
import { clinicService } from '../services/clinicService';
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  UserCog,
  ClipboardList,
  DollarSign,
  Pill,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
  Calendar,
  FileText as Prescription,
  Activity,
  Brain,
  Watch,
  Bell,
  LogOut,
  Loader2
} from 'lucide-react';

// Import existing components
import { ClinicProfile } from './ClinicProfile';
import { QueueManagement } from './QueueManagement';
import { DoctorManagement } from './DoctorManagement';
import { DoctorManagement as ClinicDoctorManagement } from '../clinic/DoctorManagement';
import { DoctorRegistration as ClinicDoctorRegistration } from '../clinic/DoctorRegistration';
import { StaffManagement } from './StaffManagement';

// Import clinic components (these exist in the clinic folder)
import { PatientManagement } from '../clinic/PatientManagement';
import { AppointmentManagement } from '../clinic/AppointmentManagement';
import { PrescriptionRecords } from '../clinic/PrescriptionRecords';
import { LabDiagnostics } from '../clinic/LabDiagnostics';
import { BillingPayments } from '../clinic/BillingPayments';
import { PharmacyInventory } from '../clinic/PharmacyInventory';
import { ReportsAnalytics } from '../clinic/ReportsAnalytics';
import { ClinicAIModules as AIModules } from '../clinic/ClinicAIModules';
import { IoTIntegration } from '../clinic/IoTIntegration';
import { Notifications } from '../clinic/Notifications';
import { SecurityCompliance } from '../clinic/SecurityCompliance';
import { Settings as SettingsComponent } from '../clinic/Settings';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminDashboardProps {
  user: User;
}

type ViewType =
  | 'dashboard'
  | 'profile'
  | 'patients'
  | 'appointments'
  | 'queue'
  | 'doctors'
  | 'staff'
  | 'prescriptions'
  | 'lab'
  | 'billing'
  | 'pharmacy'
  | 'reports'
  | 'ai'
  | 'iot'
  | 'notifications'
  | 'settings'
  | 'clinic-register-doctor';

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentQueue, setRecentQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard') {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const [reportsData, queueData] = await Promise.all([
            clinicService.getReports(),
            clinicService.getQueue()
          ]);
          setStats(reportsData);
          setRecentQueue(queueData.slice(0, 5));
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [currentView]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as ViewType, label: 'Clinic Profile', icon: Building2 },
    { id: 'patients' as ViewType, label: 'Patients', icon: Users },
    { id: 'appointments' as ViewType, label: 'Appointments', icon: Calendar },
    { id: 'queue' as ViewType, label: 'Queue Management', icon: ClipboardList },
    { id: 'doctors' as ViewType, label: 'Doctors', icon: Stethoscope },
    { id: 'staff' as ViewType, label: 'Staff', icon: UserCog },
    { id: 'prescriptions' as ViewType, label: 'Prescriptions', icon: Prescription },
    { id: 'lab' as ViewType, label: 'Lab & Diagnostics', icon: Activity },
    { id: 'billing' as ViewType, label: 'Billing', icon: DollarSign },
    { id: 'pharmacy' as ViewType, label: 'Pharmacy', icon: Pill },
    { id: 'reports' as ViewType, label: 'Reports', icon: FileText },
    { id: 'ai' as ViewType, label: 'AI Modules', icon: Brain },
    { id: 'iot' as ViewType, label: 'IoT & Wearables', icon: Watch },
    { id: 'notifications' as ViewType, label: 'Notifications', icon: Bell },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ClinicProfile user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'patients':
        return <PatientManagement user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'appointments':
        return <AppointmentManagement userRole={user.role} />;
      case 'queue':
        return <QueueManagement userRole={user.role} />;
      case 'doctors':
        if (user.role === 'clinic') {
          return <ClinicDoctorManagement user={user} onNavigate={setCurrentView as any} onBack={() => setCurrentView('dashboard')} />;
        }
        return <DoctorManagement userRole={user.role} />;
      case 'clinic-register-doctor' as any: 
        return <ClinicDoctorRegistration onSuccess={() => setCurrentView('doctors')} onBack={() => setCurrentView('doctors')} />;
      case 'staff':
        return <StaffManagement userRole={user.role} />;
      case 'prescriptions':
        return <PrescriptionRecords userRole={user.role} />;
      case 'lab':
        return <LabDiagnostics user={user} />;
      case 'billing':
        return <BillingPayments userRole={user.role} />;
      case 'pharmacy':
        return <PharmacyInventory userRole={user.role} />;
      case 'reports':
        return <ReportsAnalytics userRole={user.role} />;
      case 'ai':
        return <AIModules user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'iot':
        return <IoTIntegration userRole={user.role} />;
      case 'notifications':
        return <Notifications userRole={user.role} />;
      case 'settings':
        return <SettingsComponent userRole={user.role} />;
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Clinic Command Center</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Welcome back, {user.full_name || 'Administrator'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm animate-pulse">
                  System Normal
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Patients', value: stats?.total_patients || 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-l-4 border-l-blue-500' },
                { label: 'Active Doctors', value: stats?.total_doctors || 0, icon: Stethoscope, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-4 border-l-emerald-500' },
                { label: 'Staff Members', value: stats?.total_staff || 0, icon: UserCog, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-l-4 border-l-purple-500' },
                { label: 'Total Appointments', value: stats?.total_appointments || 0, icon: Calendar, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-l-4 border-l-orange-500' }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${stat.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm backdrop-blur-md">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                Quick Services & Clinic Hub
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { view: 'queue', title: 'Manage Queue', desc: `${recentQueue.length} waiting now`, icon: ClipboardList, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-blue-50/20' },
                  { view: 'appointments', title: 'Appointments', desc: 'Real-time schedule', icon: Calendar, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20' },
                  { view: 'patients', title: 'Patients', desc: 'Registry access', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50/20' },
                  { view: 'billing', title: 'Revenue & Bills', desc: `₹${stats?.total_revenue || 0} total`, icon: DollarSign, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'hover:border-orange-300 dark:hover:border-orange-500/30 hover:bg-orange-50/20' }
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentView(act.view as any)}
                    className={`p-5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-center transition-all duration-300 group flex flex-col items-center justify-center bg-white dark:bg-slate-900/40 ${act.border}`}
                  >
                    <div className={`p-4 rounded-2xl ${act.bg} ${act.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <act.icon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{act.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent queue */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Live Clinical Queue Operations
                  </h2>
                  <div className="space-y-3">
                    {recentQueue.length > 0 ? (
                      recentQueue.map((apt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                              {apt.patient?.full_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{apt.patient?.full_name}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{apt.doctor?.full_name} • {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                            apt.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium text-sm">
                        No active clinical operations right now
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('queue')}
                  className="w-full mt-6 py-2.5 text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100/70 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/20 text-sm font-bold rounded-xl transition-all"
                >
                  Launch Full Operational Queue →
                </button>
              </div>

              {/* Facility Log */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  Infrastructure Logs & Integrations
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Server Engine', status: 'Online', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500' },
                    { label: 'Primary SQL Database', status: 'Connected', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500' },
                    { label: 'Automated Backup Vault', status: '2 hrs ago', color: 'text-amber-600 dark:text-amber-400 bg-amber-500' },
                    { label: 'Gemini AI Framework', status: 'Active', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500' }
                  ].map((sys, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sys.color}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sys.color}`}></span>
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{sys.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">This module is being optimized. Check back shortly!</p>
          </div>
        );
    }
  };

  if (loading && currentView === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-bold">Synchronizing medical command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ───────── Sidebar ───────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] flex flex-col
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 md:shrink-0
        ${
          /* mobile: slide in/out as a drawer */
          sidebarOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0'
        }
        ${
          /* desktop: collapsed → icon-only rail */
          !sidebarOpen ? 'md:w-[72px]' : 'md:w-64'
        }
      `}>
        {/* Sidebar logo row — always h-16 to match the top navbar */}
        <div className="h-16 shrink-0 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          {/* Animated logo */}
          <div className="shrink-0 w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">CA</span>
          </div>
          {/* Brand text – hidden when sidebar is collapsed on desktop */}
          <div className={`flex-1 min-w-0 transition-opacity duration-200 ${
            !sidebarOpen ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
          }`}>
            <h1 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none truncate">
              Clinic Admin
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Command Center</p>
          </div>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="shrink-0 flex md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                }`} />
                <span className={`text-sm font-semibold truncate transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                } ${
                  !sidebarOpen ? 'md:hidden' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ───────── Main area ───────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top Navbar — always exactly h-16 on every page ── */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
          border-b border-slate-200 dark:border-slate-800
          sticky top-0 z-40 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">

          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 p-2 -ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="hidden sm:inline text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest shrink-0">Admin</span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700 text-sm">/</span>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest truncate">
                {menuItems.find(i => i.id === currentView)?.label ?? 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right: theme + user chip + logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

            {/* User chip */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow">
                {user.full_name?.charAt(0) ?? user.email?.charAt(0) ?? 'A'}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none max-w-[110px] lg:max-w-[160px] truncate">
                  {user.full_name ?? user.email}
                </p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
