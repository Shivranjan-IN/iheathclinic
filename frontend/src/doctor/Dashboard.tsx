import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import {
    Calendar,
    DollarSign,
    Users,
    AlertCircle,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Brain
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService, DashboardStats, AppointmentChartData, RevenueChartData, RecentAppointment } from '../services/dashboardService';
import { doctorService } from '../services/doctorService';

interface DashboardProps {
    userRole: UserRole;
}

export function Dashboard({ userRole }: DashboardProps) {
    const [doctorStats, setDoctorStats] = useState({ totalPatients: 0, pendingAppointments: 0, completedAppointments: 0 });
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [appointmentData, setAppointmentData] = useState<AppointmentChartData[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
    const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
    const [loading, setLoading] = useState(true);

    const colorStyles: Record<string, { wrapper: string; icon: string }> = {
        blue: { wrapper: 'bg-blue-50', icon: 'text-blue-600' },
        orange: { wrapper: 'bg-orange-50', icon: 'text-orange-600' },
        green: { wrapper: 'bg-green-50', icon: 'text-green-600' },
        purple: { wrapper: 'bg-purple-50', icon: 'text-purple-600' },
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statRes, dStats] = await Promise.all([
                    dashboardService.getStats().catch(() => null),
                    doctorService.getDoctorStats()
                ]);
                setDoctorStats(dStats);
                setStats(statRes);

                // Fallback for other data if dashboardService fails in doctor context
                const [apptDataRes, revDataRes, recentApptsRes] = await Promise.all([
                    dashboardService.getAppointmentData().catch(() => []),
                    dashboardService.getRevenueData().catch(() => []),
                    dashboardService.getRecentAppointments().catch(() => [])
                ]);
                setAppointmentData(apptDataRes as any);
                setRevenueData(revDataRes as any);
                setRecentAppointments(recentApptsRes as any);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statConfig = [
        { 
            label: "Total Patients Managed", 
            value: (doctorStats?.totalPatients ?? 0).toString(), 
            change: 'Overall', 
            icon: Users, 
            color: 'blue' 
        },
        { 
            label: 'Pending Appointments', 
            value: (doctorStats?.pendingAppointments ?? 0).toString(), 
            change: 'Awaiting', 
            icon: Clock, 
            color: 'orange' 
        },
        { 
            label: 'Completed Cases', 
            value: (doctorStats?.completedAppointments ?? 0).toString(), 
            change: 'Total', 
            icon: CheckCircle, 
            color: 'green' 
        },
        { 
            label: 'Recent Revenue', 
            value: stats?.totalRevenue || '₹0', 
            change: 'Personal', 
            icon: DollarSign, 
            color: 'purple' 
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 animate-pulse">Scanning biometric data and syncing with medical database...</p>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Practice Overview</h1>
                    <p className="text-slate-500 font-medium">Real-time performance analytics for your clinic</p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-100">Last 30 Days</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statConfig.map((stat) => {
                    const Icon = stat.icon;
                    const styles = colorStyles[stat.color] || colorStyles.blue;
                    return (
                        <div key={stat.label} className="group bg-white rounded-[2rem] p-8 border border-slate-200 hover:border-blue-500/30 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-blue-600/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/5 to-transparent rounded-bl-[100px] -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                            
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className={`w-14 h-14 rounded-2xl ${styles.wrapper} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${styles.icon}`} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 ${styles.wrapper} ${styles.icon} rounded-lg`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="space-y-1 relative">
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Flow</h3>
                            <p className="text-sm font-medium text-slate-400">Activity peak analysis</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100 italic">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Peak: 11 AM</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appointmentData}>
                            <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontWeight: 800}}
                            />
                            <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                            <defs>
                                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Growth</h3>
                            <p className="text-sm font-medium text-slate-400">Weekly financial trajectory</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 italic">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+15.2%</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                            <Tooltip 
                                contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontWeight: 800}}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ fill: '#10b981', r: 6, strokeWidth: 4, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Appointments & Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                            <p className="text-sm font-medium text-slate-400">Latest patient consultations</p>
                        </div>
                        <button className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentAppointments.map((appointment) => (
                                    <tr key={appointment.appointment_id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-blue-600 transition-colors group-hover:text-white">
                                                    {(appointment.patient || 'P').charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700">{appointment.patient}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                {typeof appointment.time === 'string'
                                                    ? (appointment.time.includes('T')
                                                        ? new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : appointment.time)
                                                    : (appointment.time ? String(appointment.time) : '—')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {(() => {
                                                const rawStatus = typeof appointment.status === 'string' ? appointment.status : 'unknown';
                                                const normalized = rawStatus.toLowerCase();
                                                const style = normalized === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                              normalized === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                              'bg-slate-50 text-slate-500 border-slate-100';
                                                
                                                return (
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${style}`}>
                                                        {rawStatus.replace(/[_-]/g, ' ')}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <Brain className="w-10 h-10 mb-6 text-blue-100" />
                        <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight">AI Diagnostic Insights</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-200">System Alert</p>
                                <p className="text-sm font-bold">Peak activity detected at 11:00 AM. Optimal staffing suggested.</p>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-200">Revenue Forecast</p>
                                <p className="text-sm font-bold">+15% week-over-week growth projected based on current intake.</p>
                            </div>
                        </div>
                        <button className="mt-8 w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all">Details</button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 leading-tight">No-show Warning</h4>
                                <p className="text-xs font-medium text-slate-400">3 appointments at risk</p>
                            </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
