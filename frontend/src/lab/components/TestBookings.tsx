import { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Calendar, 
    MoreVertical, 
    CheckCircle2, 
    XCircle,
    FileType,
    Activity,
    User,
    ChevronLeft,
    ChevronRight,
    Download,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../common/ui/tabs';
import labService from '../../services/labService';

export function TestBookings() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('Pending');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 6; // Grid displays 3-column rows, so 6 is perfect (2 rows of 3)

    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPage(1); // Reset page on filter change
    }, [selectedTab, fromDate, toDate]);

    // Close export dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch bookings with debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBookings();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedTab, fromDate, toDate, page]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await labService.getBookings({ 
                status: selectedTab, 
                fromDate, 
                toDate, 
                search: searchTerm,
                page,
                limit
            });
            if (res.success) {
                setBookings(res.bookings || []);
                setTotalPages(res.totalPages || 1);
                setTotalCount(res.total || 0);
            } else {
                setError(res.message || 'Failed to fetch bookings');
            }
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.message || err.message || 'Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            const res = await labService.updateBookingStatus(orderId, status);
            if (res.success) {
                fetchBookings();
            }
        } catch (err: any) {
            console.error('Error updating status:', err);
            alert(`Error: ${err.message || 'Could not update status'}`);
        }
    };

    // Bulk export function for Excel / CSV / PDF
    const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
        setLoading(true);
        try {
            // Get ALL bookings matching current filters (ignoring page/limit)
            const res = await labService.getBookings({
                status: selectedTab,
                fromDate,
                toDate,
                search: searchTerm,
                all: true
            });

            if (!res.success) {
                alert('Export failed: unable to fetch dataset');
                return;
            }

            const dataset = res.bookings || [];
            if (dataset.length === 0) {
                alert('No bookings found matching current filters to export');
                return;
            }

            if (format === 'csv' || format === 'excel') {
                const headers = ['Order ID', 'Patient Name', 'Gender', 'Age', 'Clinic', 'Tests', 'Date', 'Price (INR)', 'Status'];
                const rows = dataset.map((b: any) => [
                    b.lab_order_id,
                    b.patient?.full_name || 'N/A',
                    b.patient?.gender || 'N/A',
                    b.patient?.age || 'N/A',
                    b.clinic?.clinic_name || 'Direct Patient',
                    b.lab_order_items?.map((i: any) => i.lab_test_types?.test_name).join(', ') || 'N/A',
                    new Date(b.order_date).toLocaleDateString(),
                    b.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0,
                    b.status
                ]);

                const csvContent = [headers.join(','), ...rows.map((e: any[]) => e.map((val: any) => `"${val}"`).join(','))].join('\n');
                const blob = new Blob([csvContent], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `elab_bookings_export_${selectedTab.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.${format === 'csv' ? 'csv' : 'xls'}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (format === 'pdf') {
                // Open window for printing
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>E-Labs Bookings - Export</title>
                                <style>
                                    body { font-family: 'Inter', Arial, sans-serif; padding: 30px; color: #1e293b; }
                                    h1 { text-transform: uppercase; letter-spacing: 1px; color: #1e3a8a; margin-bottom: 5px; }
                                    p { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                                    th { background-color: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; }
                                    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
                                    .price { font-weight: bold; text-align: right; }
                                    .status { font-weight: bold; text-transform: uppercase; color: #2563eb; }
                                    .footer { margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 10px; }
                                </style>
                            </head>
                            <body>
                                <h1>E-Labs Diagnostics</h1>
                                <p>Report Type: Bookings Ledger (${selectedTab}) | Exported on: ${new Date().toLocaleString()}</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Patient</th>
                                            <th>Age/Gender</th>
                                            <th>Requested Tests</th>
                                            <th>Source Clinic</th>
                                            <th>Date</th>
                                            <th style="text-align: right">Price</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dataset.map((b: any) => `
                                            <tr>
                                                <td><b>${b.lab_order_id}</b></td>
                                                <td>${b.patient?.full_name || 'N/A'}</td>
                                                <td>${b.patient?.age || 'N/A'} yrs / ${b.patient?.gender || 'N/A'}</td>
                                                <td>${b.lab_order_items?.map((i: any) => i.lab_test_types?.test_name).join(', ') || 'N/A'}</td>
                                                <td>${b.clinic?.clinic_name || 'Direct Order'}</td>
                                                <td>${new Date(b.order_date).toLocaleDateString()}</td>
                                                <td class="price">₹${(b.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0) || 0).toLocaleString()}</td>
                                                <td class="status">${b.status}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                <div class="footer">Secure digital printout generated by E-Labs Management Node.</div>
                                <script>window.onload = function() { window.print(); window.close(); }</script>
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                }
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('An error occurred during dataset compilation for export.');
        } finally {
            setLoading(false);
            setShowExportMenu(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900">Test Bookings & Orders</h1>
                    <p className="text-gray-600 font-medium">Manage incoming test requests from clinics and patients</p>
                </div>
                
                {/* Date Filters and Export buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-xl shadow-sm text-xs font-semibold text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <input 
                            type="date" 
                            className="bg-transparent border-none outline-none focus:ring-0" 
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From Date"
                        />
                        <span className="text-gray-300">to</span>
                        <input 
                            type="date" 
                            className="bg-transparent border-none outline-none focus:ring-0"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To Date"
                        />
                        {(fromDate || toDate) && (
                            <button 
                                onClick={() => { setFromDate(''); setToDate(''); }}
                                className="text-[10px] text-red-500 font-black uppercase hover:underline ml-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    
                    {/* Export button with dropdown */}
                    <div className="relative" ref={exportMenuRef}>
                        <Button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 h-10 rounded-xl"
                        >
                            <Download className="w-4 h-4" /> Export Dataset
                        </Button>
                        
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                <button 
                                    onClick={() => handleExport('csv')}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                >
                                    <FileType className="w-4 h-4 text-gray-400" /> Export as CSV
                                </button>
                                <button 
                                    onClick={() => handleExport('excel')}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4 text-gray-400" /> Export as Excel (XLS)
                                </button>
                                <button 
                                    onClick={() => handleExport('pdf')}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                >
                                    <FileType className="w-4 h-4 text-red-500" /> Print / Save as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search and Filters toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Search patient name or booking ID..." 
                        className="pl-10 h-11 bg-white rounded-xl shadow-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {(searchTerm || fromDate || toDate) && (
                    <Button 
                        variant="ghost" 
                        onClick={() => { setSearchTerm(''); setFromDate(''); setToDate(''); }}
                        className="text-gray-500 hover:text-red-600 font-bold uppercase tracking-wider text-xs px-4"
                    >
                        Reset Filters
                    </Button>
                )}
            </div>

            {/* Tabs matching database workflow */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm mb-6 flex overflow-x-auto justify-start max-w-full">
                    <TabsTrigger value="Pending" className="px-6 py-2.5 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="Accepted" className="px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Accepted
                    </TabsTrigger>
                    <TabsTrigger value="Processing" className="px-6 py-2.5 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Processing
                    </TabsTrigger>
                    <TabsTrigger value="Sample Collected" className="px-6 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Collected
                    </TabsTrigger>
                    <TabsTrigger value="Completed" className="px-6 py-2.5 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Completed
                    </TabsTrigger>
                    <TabsTrigger value="Cancelled" className="px-6 py-2.5 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Cancelled
                    </TabsTrigger>
                </TabsList>

                {error ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-red-50/50 border border-red-100 rounded-2xl">
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                        <h3 className="text-base font-bold text-gray-900 uppercase">Synchronization Offline</h3>
                        <p className="text-gray-500 text-xs mt-1 max-w-md mx-auto">{error}</p>
                        <Button 
                            onClick={fetchBookings}
                            className="mt-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl px-4 py-2 shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reconnect Now
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <Card key={n} className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                                <div className="p-4 border-b bg-slate-50/30 flex justify-between">
                                    <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                                    <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-10 bg-slate-100 rounded animate-pulse" />
                                    <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <Card key={booking.lab_order_id} className={`relative hover:shadow-xl transition-all border-l-4 overflow-hidden group bg-white text-left ${
                                    selectedTab === 'Pending' ? 'border-l-orange-500' :
                                    selectedTab === 'Accepted' ? 'border-l-blue-500' :
                                    selectedTab === 'Processing' ? 'border-l-purple-500' :
                                    selectedTab === 'Sample Collected' ? 'border-l-indigo-500' :
                                    selectedTab === 'Completed' ? 'border-l-green-500' : 'border-l-red-500'
                                }`}>
                                    <CardHeader className="p-4 pb-2 border-b bg-gray-50/50 flex flex-row items-center justify-between text-left">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            <Badge className="bg-slate-900 border-none px-2 py-0.5 text-[9px]">{booking.lab_order_id}</Badge>
                                            <span>• {new Date(booking.order_date).toLocaleDateString()}</span>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                                    </CardHeader>
                                    
                                    <CardContent className="p-5 space-y-4 text-left">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold shrink-0 flex items-center justify-center text-lg shadow-inner uppercase">
                                                {booking.patient?.full_name?.charAt(0) || 'P'}
                                            </div>
                                            <div className="min-w-0 text-left">
                                                <h3 className="font-bold text-gray-900 truncate uppercase text-sm leading-tight">{booking.patient?.full_name || 'Walking Customer'}</h3>
                                                <p className="text-xs text-gray-500 mt-1 font-semibold">{booking.patient?.gender || 'N/A'} • Age: {booking.patient?.age || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-1 text-left">
                                            {booking.lab_order_items?.map((item: any, idx: number) => (
                                                <div key={idx} className="p-2.5 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                                    <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider mb-0.5">Requested Diagnostic</p>
                                                    <p className="text-xs font-bold text-gray-800">{item.lab_test_types?.test_name || 'General Diagnostics'}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {booking.technician && (
                                            <div className="p-2 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-2 text-left">
                                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-black uppercase">{booking.technician.full_name.charAt(0)}</div>
                                                <div className="text-[10px]">
                                                    <p className="font-black text-purple-700 uppercase leading-none">Assigned Tech</p>
                                                    <p className="text-purple-500 font-semibold mt-0.5">{booking.technician.full_name}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg uppercase">
                                                <User className="w-3.5 h-3.5" /> {booking.clinic?.clinic_name || 'Direct Booking'}
                                            </div>
                                            <span className="text-base font-black text-gray-900 font-mono">
                                                ₹{booking.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                    
                                    {selectedTab === 'Pending' && (
                                        <CardFooter className="p-4 bg-gray-50/70 border-t flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 bg-white hover:bg-red-50 border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl h-10"
                                                onClick={() => handleStatusUpdate(booking.lab_order_id, 'Cancelled')}
                                            >
                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                            </Button>
                                            <Button 
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-10 shadow-md"
                                                onClick={() => handleStatusUpdate(booking.lab_order_id, 'Accepted')}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Order
                                            </Button>
                                        </CardFooter>
                                    )}
                                    
                                    {selectedTab === 'Accepted' && (
                                        <CardFooter className="p-4 bg-gray-50/70 border-t flex gap-2">
                                            <Button 
                                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-10 shadow-md"
                                                onClick={() => handleStatusUpdate(booking.lab_order_id, 'Processing')}
                                            >
                                                <Activity className="w-3.5 h-3.5 mr-1 animate-pulse" /> Begin Processing
                                            </Button>
                                        </CardFooter>
                                    )}

                                    {selectedTab === 'Processing' && (
                                        <CardFooter className="p-4 bg-gray-50/70 border-t flex gap-2">
                                            <Button 
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-10 shadow-md"
                                                onClick={() => handleStatusUpdate(booking.lab_order_id, 'Sample Collected')}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Sample Collected
                                            </Button>
                                        </CardFooter>
                                    )}

                                    {selectedTab === 'Sample Collected' && (
                                        <CardFooter className="p-4 bg-gray-50/70 border-t flex gap-2">
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-10 shadow-md"
                                                onClick={() => handleStatusUpdate(booking.lab_order_id, 'Completed')}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete Diagnostics
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                        
                        {/* Server-Side Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t pt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
                                    Displaying {bookings.length} of {totalCount} requests
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="h-9 px-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-50 transition-all font-black text-xs uppercase"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
                                    </Button>
                                    <div className="text-xs font-black text-gray-800 font-mono mx-2">
                                        Page {page} / {totalPages}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="h-9 px-3 rounded-lg border-gray-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-50 transition-all font-black text-xs uppercase"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 italic uppercase">No bookings found</h3>
                        <p className="text-gray-500 text-sm mt-1">When matching order datasets appear, they will display here.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
}

