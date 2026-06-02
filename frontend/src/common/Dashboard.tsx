import { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import {
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../lib/api';
import { authService } from '../services/authService';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface DashboardProps {
  user: User;
}

interface DashboardStats {
  todaysAppointments: number;
  totalRevenue: string;
  activePatients: number;
  pendingPayments: number;
}

interface AppointmentData {
  time: string;
  count: number;
}

interface RevenueData {
  day: string;
  revenue: number;
}

interface RecentAppointment {
  appointment_id: string;
  patient: string;
  doctor: string;
  time: string;
  status: string;
}

export function Dashboard({ user }: DashboardProps) {
  const { navigateTo } = useNavigation();
  const { logout: authLogout } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    todaysAppointments: 0,
    totalRevenue: '₹0',
    activePatients: 0,
    pendingPayments: 0
  });
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await authLogout();
      navigateTo('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // API endpoints (same for all roles, backend handles role-specific logic)
        const statsEndpoint = '/dashboard/stats';
        const appointmentsEndpoint = '/dashboard/appointments-data';
        const revenueEndpoint = '/dashboard/revenue-data';
        const recentAppointmentsEndpoint = '/dashboard/recent-appointments';

        const [statsResponse, appointmentResponse, revenueResponse, appointmentsResponse] = await Promise.all([
          API.get(statsEndpoint),
          API.get(appointmentsEndpoint),
          API.get(revenueEndpoint),
          API.get(recentAppointmentsEndpoint)
        ]);

        // Provide default values if API returns undefined or invalid data
        setStats((statsResponse as DashboardStats) || {
          todaysAppointments: 0,
          totalRevenue: '₹0',
          activePatients: 0,
          pendingPayments: 0
        });
        setAppointmentData(Array.isArray(appointmentResponse) ? appointmentResponse : []);
        setRevenueData(Array.isArray(revenueResponse) ? revenueResponse : []);
        setRecentAppointments(Array.isArray(appointmentsResponse) ? appointmentsResponse : []);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        // Continue with default values - don't set error state
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Continue showing dashboard even if there's an error loading data
  // Use default values for stats, appointmentData, revenueData, recentAppointments

  // Role-specific configuration
  const getRoleConfig = () => {
    const safeStats = {
      todaysAppointments: stats?.todaysAppointments ?? 0,
      totalRevenue: stats?.totalRevenue ?? '₹0',
      activePatients: stats?.activePatients ?? 0,
      pendingPayments: stats?.pendingPayments ?? 0
    };

    switch (user.role) {
      case 'doctor':
        return {
          title: 'Doctor Dashboard',
          subtitle: 'Manage your appointments and patient care',
          stats: [
            { label: "Today's Appointments", value: safeStats.todaysAppointments.toString(), change: '+12%', icon: Calendar, color: 'blue' },
            { label: 'Active Patients', value: safeStats.activePatients.toString(), change: '+5%', icon: Users, color: 'purple' },
            { label: 'Completed Consultations', value: '28', change: '+8%', icon: CheckCircle, color: 'green' },
            { label: 'Pending Reviews', value: '3', change: '-2%', icon: AlertCircle, color: 'orange' },
          ]
        };
      case 'clinic':
        return {
          title: 'Clinic Dashboard',
          subtitle: 'Overview of clinic operations and performance',
          stats: [
            { label: "Today's Appointments", value: safeStats.todaysAppointments.toString(), change: '+12%', icon: Calendar, color: 'blue' },
            { label: 'Total Revenue', value: safeStats.totalRevenue, change: '+8%', icon: DollarSign, color: 'green' },
            { label: 'Active Patients', value: safeStats.activePatients.toString(), change: '+5%', icon: Users, color: 'purple' },
            { label: 'Pending Payments', value: safeStats.pendingPayments.toString(), change: '-3%', icon: AlertCircle, color: 'orange' },
          ]
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'System-wide clinic management and analytics',
          stats: [
            { label: 'Total Clinics', value: '12', change: '+2%', icon: Users, color: 'blue' },
            { label: 'Total Revenue', value: safeStats.totalRevenue, change: '+8%', icon: DollarSign, color: 'green' },
            { label: 'Active Users', value: safeStats.activePatients.toString(), change: '+5%', icon: Users, color: 'purple' },
            { label: 'System Alerts', value: '2', change: '-1%', icon: AlertCircle, color: 'orange' },
          ]
        };
      case 'receptionist':
        return {
          title: 'Reception Dashboard',
          subtitle: 'Manage appointments and patient check-ins',
          stats: [
            { label: "Today's Appointments", value: safeStats.todaysAppointments.toString(), change: '+12%', icon: Calendar, color: 'blue' },
            { label: 'Waiting Patients', value: '5', change: '+2%', icon: Clock, color: 'orange' },
            { label: 'Completed Check-ins', value: '23', change: '+15%', icon: CheckCircle, color: 'green' },
            { label: 'No-shows Today', value: '1', change: '-50%', icon: AlertCircle, color: 'red' },
          ]
        };
      case 'nurse':
        return {
          title: 'Nurse Dashboard',
          subtitle: 'Patient care and vital monitoring',
          stats: [
            { label: 'Assigned Patients', value: '18', change: '+3%', icon: Users, color: 'blue' },
            { label: 'Vital Checks Today', value: '45', change: '+10%', icon: TrendingUp, color: 'green' },
            { label: 'Pending Tasks', value: '7', change: '-5%', icon: AlertCircle, color: 'orange' },
            { label: 'Completed Care', value: '32', change: '+12%', icon: CheckCircle, color: 'purple' },
          ]
        };
      case 'lab':
        return {
          title: 'Lab Dashboard',
          subtitle: 'Laboratory tests and diagnostics management',
          stats: [
            { label: 'Pending Tests', value: '24', change: '+8%', icon: AlertCircle, color: 'orange' },
            { label: 'Completed Today', value: '18', change: '+15%', icon: CheckCircle, color: 'green' },
            { label: 'Critical Results', value: '2', change: '0%', icon: AlertCircle, color: 'red' },
            { label: 'Equipment Status', value: 'OK', change: '100%', icon: TrendingUp, color: 'blue' },
          ]
        };
      case 'pharmacy':
        return {
          title: 'Pharmacy Dashboard',
          subtitle: 'Medicine inventory and prescription management',
          stats: [
            { label: 'Pending Prescriptions', value: '12', change: '+5%', icon: AlertCircle, color: 'orange' },
            { label: 'Dispensed Today', value: '28', change: '+10%', icon: CheckCircle, color: 'green' },
            { label: 'Low Stock Items', value: '3', change: '-1%', icon: AlertCircle, color: 'red' },
            { label: 'Revenue Today', value: '₹8,500', change: '+12%', icon: DollarSign, color: 'purple' },
          ]
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Overview of clinic performance',
          stats: [
            { label: "Today's Appointments", value: safeStats.todaysAppointments.toString(), change: '+12%', icon: Calendar, color: 'blue' },
            { label: 'Total Revenue', value: safeStats.totalRevenue, change: '+8%', icon: DollarSign, color: 'green' },
            { label: 'Active Patients', value: safeStats.activePatients.toString(), change: '+5%', icon: Users, color: 'purple' },
            { label: 'Pending Payments', value: safeStats.pendingPayments.toString(), change: '-3%', icon: AlertCircle, color: 'orange' },
          ]
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{roleConfig.title}</h1>
          <p className="text-gray-600">{roleConfig.subtitle}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout from the doctor dashboard? You will be redirected to the home page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleConfig.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
              <p className="text-sm text-gray-600">By time slot</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>Peak: 11 AM</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Weekly Revenue</h3>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
          <p className="text-sm text-gray-600">Latest patient appointments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAppointments.map((appointment) => (
                <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{appointment.patient}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{appointment.doctor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                          appointment.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {appointment.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {appointment.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span><strong>Peak Hours:</strong> Most appointments scheduled between 10-11 AM. Consider adding more slots.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span><strong>Revenue Trend:</strong> 15% increase in weekly revenue. Saturday shows highest revenue generation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span><strong>No-show Prediction:</strong> 3 appointments at risk of no-show today. Auto-reminder sent.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
