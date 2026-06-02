import { useEffect, useState } from 'react';
import { 
    FlaskConical, 
    CheckCircle, 
    Clock, 
    TrendingUp, 
    Activity, 
    Users, 
    FileText,
    ArrowRight,
    X,
    Calendar,
    Award,
    DollarSign,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function DashboardOverview() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Analytics states
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [bookingsForAnalytics, setBookingsForAnalytics] = useState<any[]>([]);
    const [analyticsFromDate, setAnalyticsFromDate] = useState('');
    const [analyticsToDate, setAnalyticsToDate] = useState('');
    const [selectedTrendPeriod, setSelectedTrendPeriod] = useState('Last 7 Days');

    useEffect(() => {
        fetchStats();
        fetchBookingsData();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await labService.getDashboardStats();
            if (res.success) {
                setStatsData(res.data);
            }
        } catch (error) {
            console.error('Error fetching lab stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookingsData = async () => {
        try {
            const res = await labService.getBookings({ all: true });
            if (res.success) {
                setBookingsForAnalytics(res.bookings || []);
            }
        } catch (err) {
            console.error('Error fetching bookings for analytics:', err);
        }
    };

    const stats = [
        { label: 'Total Tests Catalog', value: statsData?.totalTests || '0', icon: FlaskConical, color: 'blue', change: 'Catalog' },
        { label: 'Total Orders', value: statsData?.orders || '0', icon: Users, color: 'purple', change: 'Bookings' },
        { label: 'Total Revenue', value: `₹${(statsData?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green', change: 'Earnings' },
        { label: 'Technicians Count', value: statsData?.technicians || '0', icon: Award, color: 'orange', change: 'Staff' },
        { label: 'Total System Labs', value: statsData?.labs || '0', icon: Activity, color: 'blue', change: 'System Labs' },
        { label: 'Test Reports Uploaded', value: statsData?.reports || '0', icon: CheckCircle, color: 'purple', change: 'Reports' },
    ];

    // Compute Home Dashboard Area Chart Data (Last 7 Days Revenue Trend)
    const computeHomeChartData = () => {
        const trendsMap: { [key: string]: { date: string; revenue: number; bookings: number } } = {};
        const now = new Date();
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            trendsMap[dateStr] = { date: dateStr, revenue: 0, bookings: 0 };
        }

        bookingsForAnalytics.forEach((b: any) => {
            const dateObj = new Date(b.order_date);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (trendsMap[dateStr] !== undefined) {
                trendsMap[dateStr].bookings += 1;
                if (b.status === 'Completed') {
                    const price = b.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0;
                    trendsMap[dateStr].revenue += price;
                }
            }
        });

        return Object.values(trendsMap);
    };

    const homeChartData = computeHomeChartData();

    // Compute Detailed Filtered Analytics Data
    const getFilteredAnalytics = () => {
        const filtered = bookingsForAnalytics.filter((b: any) => {
            const d = new Date(b.order_date);
            if (analyticsFromDate && d < new Date(analyticsFromDate)) return false;
            if (analyticsToDate) {
                const end = new Date(analyticsToDate);
                end.setHours(23, 59, 59, 999);
                if (d > end) return false;
            }
            return true;
        });

        // 1. Calculate scorecard metrics
        const totalOrders = filtered.length;
        const pendingSamples = filtered.filter((b: any) => ['Pending', 'Accepted', 'Processing'].includes(b.status)).length;
        const completedTests = filtered.filter((b: any) => b.status === 'Completed').length;
        const revenue = filtered
            .filter((b: any) => b.status === 'Completed')
            .reduce((sum: number, b: any) => sum + (b.lab_order_items?.reduce((s: number, item: any) => s + (parseFloat(item.price) || 0), 0) || 0), 0);

        // 2. Trend chart data
        const trendsMap: { [key: string]: { date: string; dateVal: Date; orders: number; revenue: number } } = {};
        filtered.forEach((b: any) => {
            const dateObj = new Date(b.order_date);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const price = b.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0;
            
            if (!trendsMap[dateStr]) {
                trendsMap[dateStr] = { date: dateStr, dateVal: dateObj, orders: 0, revenue: 0 };
            }
            trendsMap[dateStr].orders += 1;
            if (b.status === 'Completed') {
                trendsMap[dateStr].revenue += price;
            }
        });
        const trendsData = Object.values(trendsMap).sort((a: any, b: any) => a.dateVal.getTime() - b.dateVal.getTime());

        // 3. Test proportions data
        const testMap: { [key: string]: number } = {};
        filtered.forEach((b: any) => {
            b.lab_order_items?.forEach((item: any) => {
                const name = item.lab_test_types?.test_name || 'Other Service';
                testMap[name] = (testMap[name] || 0) + 1;
            });
        });
        const pieColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
        const pieData = Object.entries(testMap).map(([name, value], index) => ({
            name,
            value,
            color: pieColors[index % pieColors.length]
        }));

        // 4. Technician scorecard
        const techMap: { [key: string]: { id: number; name: string; phone: string; completed: number; pending: number; total: number } } = {};
        filtered.forEach((b: any) => {
            if (b.technician) {
                const tech = b.technician;
                const name = tech.full_name;
                if (!techMap[name]) {
                    techMap[name] = { id: tech.id, name, phone: tech.phone || 'N/A', completed: 0, pending: 0, total: 0 };
                }
                techMap[name].total += 1;
                if (b.status === 'Completed') {
                    techMap[name].completed += 1;
                } else if (['Accepted', 'Processing', 'Sample Collected'].includes(b.status)) {
                    techMap[name].pending += 1;
                }
            }
        });
        const technicianScorecard = Object.values(techMap).sort((a, b) => b.completed - a.completed);

        return {
            totalOrders,
            pendingSamples,
            completedTests,
            revenue,
            trendsData,
            pieData,
            technicianScorecard
        };
    };

    const analytics = getFilteredAnalytics();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Activity className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Dashboard statistics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Dashboard Overview</h1>
                    <p className="text-gray-600 dark:text-slate-400 font-medium">Welcome to your diagnostic command center</p>
                </div>
                <div className="flex gap-2.5">
                    <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
                        onClick={() => {
                            window.print();
                        }}
                    >
                        <FileText className="w-4 h-4 text-slate-500" /> Export Summary
                    </Button>
                    <Button 
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-100 dark:shadow-none"
                        onClick={() => {
                            setShowAnalyticsModal(true);
                            fetchBookingsData();
                        }}
                    >
                        <TrendingUp className="w-4 h-4" /> View Detailed Analytics
                    </Button>
                </div>
            </div>

            {/* Stats Grid - 6 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-2xl shrink-0 ${
                                    stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
                                    stat.color === 'purple' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' :
                                    stat.color === 'orange' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' : 
                                    'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                                }`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest truncate">{stat.label}</p>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1 font-mono">{stat.value}</h3>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase text-gray-400 dark:text-slate-500 mt-1.5 border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 px-1 py-0">
                                        {stat.change}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Summary Card */}
                <Card className="lg:col-span-2 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-white">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Revenue & Bookings (7 Days)
                        </CardTitle>
                        <select 
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 font-bold text-slate-600 dark:text-slate-400 outline-none"
                            value={selectedTrendPeriod}
                            onChange={(e) => setSelectedTrendPeriod(e.target.value)}
                        >
                            <option>Last 7 Days</option>
                        </select>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={homeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/40" />
                                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                                        labelClassName="font-bold text-xs text-slate-800"
                                    />
                                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-4 mt-2">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aggregate Net Revenue</p>
                            <p className="text-xl font-black text-blue-600 dark:text-blue-400 italic">₹{statsData?.revenueSummary?.toLocaleString() || '0'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-white">
                            <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsData?.recentActivity?.length > 0 ? statsData.recentActivity.map((activity: any) => (
                                <div key={activity.lab_order_id} className="flex gap-3 items-start p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-colors cursor-pointer group text-left">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                        activity.status === 'Pending' ? 'bg-orange-400 shadow-[0_0_6px_#fb923c]' : 
                                        activity.status === 'Sample Collected' ? 'bg-indigo-400 shadow-[0_0_6px_#818cf8]' : 
                                        activity.status === 'Completed' ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-blue-400 shadow-[0_0_6px_#60a5fa]'
                                    }`} />
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">{activity.patient?.full_name || 'Walking Customer'}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold mt-0.5">{activity.status} • ID: {activity.lab_order_id}</p>
                                        <p className="text-[9px] text-gray-400 mt-1 font-semibold">{new Date(activity.order_date).toLocaleDateString()}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 dark:text-slate-600 text-sm italic">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PRE-FILTERED DETAILED ANALYTICS OVERLAY MODAL */}
            {showAnalyticsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-105 dark:border-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300 text-left">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b dark:border-slate-800 pb-4">
                            <div className="text-left">
                                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-955 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
                                    <Sparkles className="w-3.5 h-3.5" /> Intelligence Node Activated
                                </span>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Laboratory Detailed Analytics</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review operational metrics, revenue curves, and field agent logs.</p>
                            </div>
                            <button 
                                onClick={() => setShowAnalyticsModal(false)}
                                className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-full transition-colors active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Date Picker Tool Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Date Filtering Bounds
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 border dark:border-slate-850 rounded-xl shadow-sm text-xs font-semibold text-gray-600 dark:text-slate-300">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none outline-none focus:ring-0 text-xs text-gray-800 dark:text-slate-100" 
                                        value={analyticsFromDate}
                                        onChange={(e) => setAnalyticsFromDate(e.target.value)}
                                    />
                                    <span className="text-gray-300 dark:text-slate-700">to</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none outline-none focus:ring-0 text-xs text-gray-800 dark:text-slate-100"
                                        value={analyticsToDate}
                                        onChange={(e) => setAnalyticsToDate(e.target.value)}
                                    />
                                </div>
                                {(analyticsFromDate || analyticsToDate) && (
                                    <Button 
                                        variant="ghost"
                                        onClick={() => { setAnalyticsFromDate(''); setAnalyticsToDate(''); }}
                                        className="text-xs font-black text-red-500 uppercase hover:underline p-1 h-fit hover:bg-transparent"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Analytic scorecards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'Net Revenue', value: `₹${analytics.revenue.toLocaleString()}`, color: 'blue', desc: 'Accrued from paid orders', icon: DollarSign },
                                { title: 'Total Bookings', value: analytics.totalOrders, color: 'purple', desc: 'Orders registered in bounds', icon: BarChart3 },
                                { title: 'Pending Samples', value: analytics.pendingSamples, color: 'orange', desc: 'Awaiting technician or collection', icon: Clock },
                                { title: 'Completed Tests', value: analytics.completedTests, color: 'green', desc: 'Reports finalized and sent', icon: CheckCircle }
                            ].map((card, idx) => (
                                <div key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 text-left shadow-sm">
                                    <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-slate-950 text-${card.color}-600 dark:text-${card.color}-400`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{card.title}</p>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{card.value}</h4>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">{card.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue & Bookings Trend */}
                            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-600" /> Orders & Revenue Trend Line
                                </h3>
                                <div className="h-[250px] w-full">
                                    {analytics.trendsData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analytics.trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/40" />
                                                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                                                    labelClassName="font-bold text-xs text-slate-800"
                                                />
                                                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue2)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-650 italic text-xs">No trend datasets in selected range</div>
                                    )}
                                </div>
                            </div>

                            {/* Test Proportions Pie Chart */}
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-purple-600" /> Test Proportions
                                </h3>
                                <div className="h-[200px] w-full flex items-center justify-center">
                                    {analytics.pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={65}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {analytics.pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px', fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-slate-400 dark:text-slate-600 italic text-xs">No diagnostic proportions found</div>
                                    )}
                                </div>
                                <div className="max-h-[80px] overflow-y-auto space-y-1.5 custom-scrollbar text-[10px] mt-2">
                                    {analytics.pieData.map((d, index) => (
                                        <div key={index} className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                                <span className="truncate">{d.name}</span>
                                            </div>
                                            <span>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Technician Scorecard */}
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-left space-y-4">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4 text-green-600" /> Technician Field Scorecard
                            </h3>
                            {analytics.technicianScorecard.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-slate-600 dark:text-slate-400">
                                        <thead>
                                            <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-widest text-[9px] text-gray-500 dark:text-slate-400">
                                                <th className="p-3 text-left">Technician</th>
                                                <th className="p-3 text-left">Contact Info</th>
                                                <th className="p-3 text-center">Completed Collections</th>
                                                <th className="p-3 text-center">Active Requests</th>
                                                <th className="p-3 text-center">Efficiency Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-slate-800">
                                            {analytics.technicianScorecard.map((tech) => {
                                                const efficiency = tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0;
                                                return (
                                                    <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                        <td className="p-3 flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs uppercase">{tech.name.charAt(0)}</div>
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{tech.name}</span>
                                                        </td>
                                                        <td className="p-3 font-semibold">{tech.phone}</td>
                                                        <td className="p-3 text-center font-bold text-green-600 dark:text-green-400">{tech.completed}</td>
                                                        <td className="p-3 text-center font-bold text-orange-600 dark:text-orange-400">{tech.pending}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                                                efficiency > 80 ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400' :
                                                                efficiency > 50 ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' : 
                                                                'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                                                            }`}>{efficiency}%</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 dark:text-slate-600 italic text-xs">No active field technician assignments logged in range.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
