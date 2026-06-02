import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Users, DollarSign, Activity, Loader2 } from 'lucide-react';
import { analyticsService, DashboardStats, ChartData } from '../services/analyticsService';

interface ReportsAnalyticsProps {
    userRole: UserRole;
}

export function ReportsAnalytics({ }: ReportsAnalyticsProps) {
    const [dateRange, setDateRange] = useState('week');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, chartsRes] = await Promise.all([
                    analyticsService.getStats(),
                    analyticsService.getChartData()
                ]);
                setStats(statsRes);
                setChartData(chartsRes);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownload = (reportName: string, data: any[]) => {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(val => 
                typeof val === 'string' ? `"${val}"` : val
            ).join(',')
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportName.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportAll = () => {
        if (!stats && !chartData) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // 1. Key Metrics Section
        csvContent += "KEY PERFORMANCE METRICS\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Appointments,${stats?.totalAppointments || 0}\n`;
        csvContent += `Total Revenue (INR),${stats?.totalRevenue || 0}\n`;
        csvContent += `Active Patients,${stats?.totalPatients || 0}\n`;
        csvContent += `Average Rating,${stats?.avgRating || 0}\n\n`;
        
        // 2. Consultation Volume
        if (chartData?.dailyAppointments && chartData.dailyAppointments.length > 0) {
            csvContent += "CONSULTATION VOLUME\n";
            csvContent += "Date,Count\n";
            chartData.dailyAppointments.forEach(row => {
                csvContent += `"${row.date}",${row.count}\n`;
            });
            csvContent += "\n";
        }
        
        // 3. Financial Projections
        if (chartData?.revenueTrend && chartData.revenueTrend.length > 0) {
            csvContent += "FINANCIAL PROJECTIONS\n";
            csvContent += "Month,Revenue (INR)\n";
            chartData.revenueTrend.forEach(row => {
                csvContent += `"${row.month}",${row.revenue}\n`;
            });
            csvContent += "\n";
        }
        
        // 4. Patient Segmentation
        if (chartData?.visitDist && chartData.visitDist.length > 0) {
            csvContent += "PATIENT SEGMENTATION\n";
            csvContent += "Segment,Patients Count\n";
            chartData.visitDist.forEach(row => {
                csvContent += `"${row.name}",${row.value}\n`;
            });
            csvContent += "\n";
        }
        
        // 5. Medical Team Efficiency
        if (chartData?.doctorPerf && chartData.doctorPerf.length > 0) {
            csvContent += "MEDICAL TEAM EFFICIENCY\n";
            csvContent += "Doctor Name,Consultations,Revenue (INR),Rating\n";
            chartData.doctorPerf.forEach(row => {
                csvContent += `"${row.name}",${row.consultations},${row.revenue},${row.rating}\n`;
            });
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `practice_analytics_summary_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium animate-pulse">Synchronizing performance data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-slate-500 font-medium">Precision performance metrics for your medical practice</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all cursor-pointer shadow-sm"
                    >
                        <option value="week">Past 7 Days</option>
                        <option value="month">Current Month</option>
                        <option value="quarter">Quarterly</option>
                        <option value="year">Annual Summary</option>
                    </select>
                    <button 
                        onClick={handleExportAll}
                        className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, color: 'blue', change: '+12%' },
                    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', change: '+18%' },
                    { label: 'Active Patients', value: stats?.totalPatients || 0, icon: Users, color: 'indigo', change: '+8%' },
                    { label: 'Avg Rating', value: stats?.avgRating || 0, icon: Activity, color: 'orange', change: '+0.3' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                {stat.change}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Appointments */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Consultation Volume</h3>
                        <button 
                            onClick={() => handleDownload('Daily Appointments', chartData?.dailyAppointments || [])}
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                            title="Download CSV"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    {(!chartData?.dailyAppointments || chartData.dailyAppointments.length === 0) ? (
                        <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                             <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No recent consultations recorded</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.dailyAppointments}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800}}
                                />
                                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Projection</h3>
                        <button 
                            onClick={() => handleDownload('Revenue Trend', chartData?.revenueTrend || [])}
                            className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                            title="Download CSV"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    {(!chartData?.revenueTrend || chartData.revenueTrend.length === 0) ? (
                        <div className="h-[300px] flex flex-col items-center justify-center bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
                             <DollarSign className="w-8 h-8 text-emerald-300 mb-2" />
                             <p className="text-xs font-black text-emerald-400/70 uppercase tracking-widest">Revenue data not yet synced</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800}}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 5, strokeWidth: 3, stroke: '#fff' }} activeDot={{r: 8, strokeWidth: 0}} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Patient Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Segmentation</h3>
                        <button 
                            onClick={() => handleDownload('Visit Distribution', chartData?.visitDist || [])}
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                            title="Download CSV"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                    {(!chartData?.visitDist || chartData.visitDist.length === 0) ? (
                         <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                             <Users className="w-8 h-8 text-slate-300 mb-2" />
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting segmentation data</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.visitDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.visitDist.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {(chartData?.visitDist || []).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4]}} />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{(chartData?.visitDist || [])[i].name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Doctor Performance Summary */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Medical Team Efficiency</h3>
                    <div className="space-y-4">
                        {(!chartData?.doctorPerf || chartData.doctorPerf.length === 0) ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                                <Activity className="w-10 h-10 text-slate-300 mb-2" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No staff performance data available</p>
                            </div>
                        ) : (
                            chartData.doctorPerf.map((doc, idx) => (
                                <div key={idx} className="p-5 bg-slate-50/50 hover:bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-none">{doc.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Medical Specialist</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-black border border-yellow-100">
                                            <span>★</span>
                                            <span>{doc.rating}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-100">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultations</p>
                                            <p className="text-lg font-black text-slate-900">{doc.consultations}</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Generated</p>
                                            <p className="text-lg font-black text-emerald-600">₹{doc.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
