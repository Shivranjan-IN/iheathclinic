import { useState, useEffect } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    FileText, 
    CreditCard, 
    Download, 
    Plus, 
    Search,
    ChevronRight,
    Activity,
    Calendar,
    BadgeCheck,
    Clock,
    User,
    ArrowDownLeft,
    AlertCircle,
    X,
    Trash2,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { Label } from '../../common/ui/label';
import labService from '../../services/labService';

export function BillingPayments() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [manualInvoices, setManualInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ledgerTab, setLedgerTab] = useState<'bookings' | 'manual'>('bookings');
    const [stats, setStats] = useState({
        revenue: '₹0',
        pending: '₹0',
        settled: '₹0',
        count: 0
    });

    // Modals
    const [isSettlementOpen, setIsSettlementOpen] = useState(false);
    const [isManualInvoiceOpen, setIsManualInvoiceOpen] = useState(false);
    const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    // Settlement Date filters & report
    const [settlementFromDate, setSettlementFromDate] = useState('');
    const [settlementToDate, setSettlementToDate] = useState('');
    const [settlementReport, setSettlementReport] = useState<any>(null);
    const [loadingReport, setLoadingReport] = useState(false);

    // Manual Invoice Form
    const [patientName, setPatientName] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [discount, setDiscount] = useState('0');
    const [invoiceItems, setInvoiceItems] = useState<any[]>([{ service_name: '', rate: '', quantity: '1' }]);
    const [savingInvoice, setSavingInvoice] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchManualInvoices();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await labService.getTransactions();
            if (res.success) {
                const data = res.data;
                setTransactions(data);

                // Calculate stats
                let totalRev = 0;
                let totalPending = 0;
                data.forEach((tx: any) => {
                    const price = parseFloat(tx.price || 0);
                    if (tx.payment_status === 'Paid') totalRev += price;
                    else if (tx.payment_status === 'Pending') totalPending += price;
                });

                setStats({
                    revenue: `₹${totalRev.toLocaleString()}`,
                    pending: `₹${totalPending.toLocaleString()}`,
                    settled: `₹${(totalRev * 0.82).toLocaleString()}`, // Deducting 18% GST
                    count: data.length
                });
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManualInvoices = async () => {
        try {
            const res = await labService.getManualInvoices();
            if (res.success) {
                setManualInvoices(res.data);
            }
        } catch (error) {
            console.error('Error fetching manual invoices:', error);
        }
    };

    // Settlement Report Generation
    const handleGenerateSettlementReport = async () => {
        setLoadingReport(true);
        try {
            const res = await labService.getBillingReport({
                fromDate: settlementFromDate,
                toDate: settlementToDate
            });
            if (res.success) {
                setSettlementReport(res.data);
            }
        } catch (err) {
            console.error('Error generating settlement report:', err);
            alert('Failed to generate report.');
        } finally {
            setLoadingReport(false);
        }
    };

    // Exporters
    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) return;
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const escaped = ('' + val).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportSettlementCSV = () => {
        if (!settlementReport || !settlementReport.bookings) return;
        const formatted = settlementReport.bookings.map((b: any) => ({
            "Booking ID": b.bookingId,
            "Patient Name": b.patientName,
            "Date": new Date(b.date).toLocaleDateString(),
            "Status": b.status,
            "Amount (INR)": b.amount
        }));
        downloadCSV(formatted, `Settlement_Report_${settlementFromDate || 'all'}_to_${settlementToDate || 'all'}.csv`);
    };

    const printReport = (report: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Settlement Report</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
                        h2 { text-transform: uppercase; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
                        .meta { margin-bottom: 30px; font-size: 13px; line-height: 1.6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e5e7eb; padding: 12px 10px; text-align: left; font-size: 12px; }
                        th { background-color: #f9fafb; font-weight: bold; color: #374151; }
                        .totals { margin-top: 30px; font-size: 13px; width: 45%; float: right; }
                        .totals table { border: none; width: 100%; }
                        .totals td { border: none; padding: 6px 0; }
                        .totals td.bold { font-weight: 850; font-size: 15px; color: #1e3a8a; border-top: 2px solid #1e3a8a; padding-top: 12px; }
                    </style>
                </head>
                <body>
                    <h2>Laboratory Settlement Report</h2>
                    <div class="meta">
                        <strong>Period:</strong> ${report.fromDate || 'Start'} to ${report.toDate || 'Present'}<br/>
                        <strong>Generated At:</strong> ${new Date().toLocaleString()}<br/>
                        <strong>Total Records:</strong> ${report.totalBookings}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.bookings.map((b: any) => `
                                <tr>
                                    <td>${b.bookingId}</td>
                                    <td>${b.patientName}</td>
                                    <td>${new Date(b.date).toLocaleDateString()}</td>
                                    <td>${b.status}</td>
                                    <td style="text-align: right;">₹${parseFloat(b.amount).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <table>
                            <tr>
                                <td>Total Revenue Accrued:</td>
                                <td style="text-align: right;">₹${parseFloat(report.totalRevenue).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Completed Revenue:</td>
                                <td style="text-align: right;">₹${parseFloat(report.completedRevenue).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Pending Collections:</td>
                                <td style="text-align: right;">₹${parseFloat(report.pendingRevenue).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>GST Tax Collected (18%):</td>
                                <td style="text-align: right;">₹${parseFloat(report.tax).toFixed(2)}</td>
                            </tr>
                            <tr class="bold">
                                <td>Net Lab Earnings:</td>
                                <td style="text-align: right;">₹${parseFloat(report.labEarnings).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Manual Invoice Calculations
    const calculateFormTotals = () => {
        let subtotal = 0;
        invoiceItems.forEach(item => {
            const rate = parseFloat(item.rate) || 0;
            const qty = parseInt(item.quantity) || 1;
            subtotal += rate * qty;
        });
        const disc = parseFloat(discount) || 0;
        const subAfterDisc = Math.max(0, subtotal - disc);
        const tax = subAfterDisc * 0.18; // 18% GST
        const total = subAfterDisc + tax;
        return { subtotal, tax, total };
    };

    const handleAddItemRow = () => {
        setInvoiceItems([...invoiceItems, { service_name: '', rate: '', quantity: '1' }]);
    };

    const handleRemoveItemRow = (index: number) => {
        if (invoiceItems.length === 1) return;
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const updated = [...invoiceItems];
        updated[index] = { ...updated[index], [field]: value };
        setInvoiceItems(updated);
    };

    const handleCreateManualInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName.trim()) {
            alert('Patient name is required.');
            return;
        }

        const invalidItems = invoiceItems.some(i => !i.service_name.trim() || !i.rate);
        if (invalidItems) {
            alert('All invoice lines must have a description and valid rate.');
            return;
        }

        setSavingInvoice(true);
        try {
            const res = await labService.createManualInvoice({
                patient_name: patientName,
                gst_number: gstNumber,
                invoice_date: invoiceDate,
                discount: parseFloat(discount),
                items: invoiceItems
            });

            if (res.success) {
                alert('Manual invoice created successfully!');
                setIsManualInvoiceOpen(false);
                // Clear state
                setPatientName('');
                setGstNumber('');
                setDiscount('0');
                setInvoiceItems([{ service_name: '', rate: '', quantity: '1' }]);
                // Refresh data
                fetchManualInvoices();
                fetchTransactions();
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to save manual invoice.');
        } finally {
            setSavingInvoice(false);
        }
    };

    const printInvoice = (inv: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const subtotal = parseFloat(inv.subtotal);
        const tax = parseFloat(inv.tax);
        const cgst = tax / 2;
        const sgst = tax / 2;
        const total = parseFloat(inv.total_amount);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${inv.invoice_id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo-section h1 { margin: 0; color: #1e3a8a; font-size: 24px; text-transform: uppercase; font-weight: 900; }
                        .logo-section p { margin: 5px 0 0 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
                        .invoice-title { text-align: right; }
                        .invoice-title h2 { margin: 0; color: #111827; font-size: 28px; font-weight: 800; text-transform: uppercase; }
                        .invoice-title p { margin: 5px 0 0 0; font-size: 12px; color: #4b5563; font-weight: bold; }
                        .details { display: flex; justify-content: space-between; margin-bottom: 45px; font-size: 13px; line-height: 1.6; }
                        .details h3 { margin: 0 0 8px 0; color: #1e3a8a; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { padding: 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
                        th { background-color: #f9fafb; font-weight: 750; color: #374151; text-transform: uppercase; font-size: 11px; }
                        .text-right { text-align: right; }
                        .totals { width: 330px; margin-left: auto; font-size: 13px; margin-top: 20px; }
                        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                        .totals-row.grand-total { border-top: 2px solid #1e3a8a; border-bottom: none; font-size: 16px; font-weight: 850; color: #1e3a8a; padding-top: 12px; }
                        .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo-section">
                            <h1>E-Labs Diagnostics</h1>
                            <p>Premium Laboratory Partner</p>
                        </div>
                        <div class="invoice-title">
                            <h2>GST Tax Invoice</h2>
                            <p>ID: ${inv.invoice_id}</p>
                            <p>Date: ${new Date(inv.invoice_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="details">
                        <div>
                            <h3>Billing Entity (Issuer)</h3>
                            <strong>E-Labs Diagnostics Ltd.</strong><br/>
                            GSTIN: ${inv.gst_number || 'N/A'}<br/>
                            Email: billing@elab-global.com<br/>
                            Phone: +91 9988776655
                        </div>
                        <div style="text-align: right;">
                            <h3>Recipient (Customer)</h3>
                            <strong>${inv.patient_name}</strong><br/>
                            Status: Paid<br/>
                            Payment Method: Cash / Offline Manual
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inv.invoice_items.map((item: any) => `
                                <tr>
                                    <td>${item.service_name}</td>
                                    <td class="text-right">₹${parseFloat(item.rate).toFixed(2)}</td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">₹${parseFloat(item.amount).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>₹${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="totals-row">
                            <span>Discount:</span>
                            <span>₹${parseFloat(inv.discount || 0).toFixed(2)}</span>
                        </div>
                        <div class="totals-row">
                            <span>CGST (9%):</span>
                            <span>₹${cgst.toFixed(2)}</span>
                        </div>
                        <div class="totals-row">
                            <span>SGST (9%):</span>
                            <span>₹${sgst.toFixed(2)}</span>
                        </div>
                        <div class="totals-row grand-total">
                            <span>Total (Inclusive of GST):</span>
                            <span>₹${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is a system generated document. No signature needed.</p>
                        <p>Thank you for your business!</p>
                    </div>
                    
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleOpenInvoiceDetail = (inv: any) => {
        setSelectedInvoice(inv);
        setIsInvoiceDetailOpen(true);
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.order_id?.toString().includes(searchTerm)
    );

    const filteredManualInvoices = manualInvoices.filter(inv =>
        inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_id?.toString().includes(searchTerm)
    );

    const formTotals = calculateFormTotals();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white italic">Lab Financial Dashboard</h1>
                    <p className="text-gray-600 dark:text-slate-400 font-medium">Manage earnings, generate invoices, and track diagnostic transaction history</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsSettlementOpen(true)}
                        className="flex items-center gap-2 h-11 border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-none"
                    >
                        <Download className="w-4 h-4" /> Settlement Report
                    </Button>
                    <Button 
                        onClick={() => setIsManualInvoiceOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 dark:shadow-none flex items-center gap-2 h-11 px-6 active:scale-95 transition-all italic font-black uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="w-4 h-4" /> Create Manual Invoice
                    </Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Net Revenue Accrued', value: stats.revenue, icon: DollarSign, color: 'blue', change: '+System Log' },
                    { label: 'Pending Collections', value: stats.pending, icon: Clock, color: 'orange', change: 'Outstanding' },
                    { label: 'Settled to Banks', value: stats.settled, icon: BadgeCheck, color: 'green', change: 'Audit Ready' },
                    { label: 'Transaction Pipeline', value: stats.count.toString(), icon: Activity, color: 'purple', change: 'Active Records' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white dark:bg-slate-900 border-blue-50/50 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden">
                        <CardContent className="p-5 flex items-center justify-between relative">
                            <div className="space-y-1 text-left relative z-10">
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none font-mono mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white italic transform transition-transform group-hover:scale-110 origin-left leading-none">{stat.value}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-1 h-3 rounded-full bg-${stat.color}-500`} />
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight italic">{stat.change}</p>
                                </div>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 dark:bg-slate-950 flex items-center justify-center text-${stat.color}-600 grow-0 shrink-0 shadow-inner group-hover:rotate-12 transition-all relative z-10`}>
                                <stat.icon className="w-6 h-6" />
                                {stat.label === 'Pending Collections' && (
                                    <div className="absolute -top-1 -right-1 flex">
                                        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction Ledger */}
                <Card className="lg:col-span-2 shadow-xl border-blue-50 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200"><CreditCard className="w-4 h-4" /></div>
                                <CardTitle className="text-lg uppercase italic font-black text-gray-900 dark:text-white">Transaction Ledger</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-950 p-1 rounded-xl w-fit">
                                <button 
                                    onClick={() => setLedgerTab('bookings')} 
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider italic transition-all ${ledgerTab === 'bookings' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Bookings
                                </button>
                                <button 
                                    onClick={() => setLedgerTab('manual')} 
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider italic transition-all ${ledgerTab === 'manual' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Manual Invoices
                                </button>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-black" />
                            <Input 
                                placeholder={ledgerTab === 'bookings' ? "Search bookings..." : "Search manual invoices..."}
                                className="pl-10 h-10 text-xs shadow-sm bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-slate-100" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto text-left">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : ledgerTab === 'bookings' ? (
                                filteredTransactions.length > 0 ? (
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 uppercase tracking-widest text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4 italic">Invoice ID</th>
                                                <th className="px-6 py-4 italic">Patient / Test</th>
                                                <th className="px-6 py-4 italic">Datetime</th>
                                                <th className="px-6 py-4 italic text-right">Settled Amount</th>
                                                <th className="px-6 py-4 italic text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-left">
                                            {filteredTransactions.map((tx) => (
                                                <tr key={tx.order_id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white">INV-{tx.order_id}</td>
                                                    <td className="px-6 py-4 min-w-[150px]">
                                                        <div className="flex flex-col gap-1 text-left">
                                                            <span className="font-black text-gray-800 dark:text-slate-200 flex items-center gap-1 group-hover:text-blue-600 transition-colors uppercase italic text-[10px]"><User className="w-3 h-3 text-gray-400" /> {tx.patient_name}</span>
                                                            <span className="text-[9px] text-gray-400 dark:text-slate-400 font-black italic tracking-widest uppercase border-l border-blue-600 pl-1">{tx.test_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col font-bold text-gray-500 gap-0.5 text-left">
                                                            <span className="flex items-center gap-1 text-[10px] uppercase italic font-black leading-none"><Calendar className="w-3 h-3" /> {new Date(tx.created_at).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1 text-[9px] uppercase italic font-bold opacity-50"><Clock className="w-3 h-3" /> {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white italic transform group-hover:scale-110 origin-right transition-transform block">₹{parseFloat(tx.price || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            {tx.payment_status === 'Paid' ? (
                                                                <Badge className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30 border uppercase font-black text-[9px] tracking-widest px-2 shadow-sm italic"><ArrowDownLeft className="w-3 h-3 mr-1" /> PAID</Badge>
                                                            ) : tx.payment_status === 'Failed' ? (
                                                                <Badge className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30 border uppercase font-black text-[9px] tracking-widest px-2 italic"><AlertCircle className="w-3 h-3 mr-1" /> FAILED</Badge>
                                                            ) : (
                                                                <Badge className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30 border uppercase font-black text-[9px] tracking-widest px-2 animate-pulse font-mono flex items-center gap-1 italic"><Clock className="w-3 h-3" /> PENDING</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-20 italic">
                                         <DollarSign className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                                         <h3 className="text-lg font-bold text-gray-400 dark:text-slate-600 italic">No booking transactions found</h3>
                                    </div>
                                )
                            ) : (
                                filteredManualInvoices.length > 0 ? (
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 uppercase tracking-widest text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4 italic">Invoice ID</th>
                                                <th className="px-6 py-4 italic">Patient / Items Count</th>
                                                <th className="px-6 py-4 italic">Date</th>
                                                <th className="px-6 py-4 italic">GSTIN</th>
                                                <th className="px-6 py-4 italic text-right">Total Price</th>
                                                <th className="px-6 py-4 italic text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-left">
                                            {filteredManualInvoices.map((inv) => (
                                                <tr key={inv.invoice_id} onClick={() => handleOpenInvoiceDetail(inv)} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white">{inv.invoice_id}</td>
                                                    <td className="px-6 py-4 min-w-[150px]">
                                                        <div className="flex flex-col gap-1 text-left">
                                                            <span className="font-black text-gray-800 dark:text-slate-200 flex items-center gap-1 group-hover:text-blue-600 transition-colors uppercase italic text-[10px]"><User className="w-3 h-3 text-gray-400" /> {inv.patient_name}</span>
                                                            <span className="text-[9px] text-gray-400 font-black italic tracking-widest uppercase border-l border-blue-600 pl-1">
                                                                {inv.invoice_items?.length || 0} Service Line(s)
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="flex items-center gap-1 text-[10px] uppercase italic font-black text-gray-500 dark:text-slate-400 leading-none">
                                                            <Calendar className="w-3 h-3" /> {new Date(inv.invoice_date).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono font-bold text-gray-600 dark:text-slate-400 uppercase">
                                                        {inv.gst_number || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white italic transform group-hover:scale-110 origin-right transition-transform block">₹{parseFloat(inv.total_amount || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    printInvoice(inv);
                                                                }}
                                                                className="p-2 hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                                                                title="Print PDF Invoice"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-20 italic">
                                         <DollarSign className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                                         <h3 className="text-lg font-bold text-gray-400 dark:text-slate-600 italic">No manual invoices found</h3>
                                    </div>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Cards Column */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-blue-50 dark:border-slate-800 border-t-4 border-t-blue-600 overflow-hidden text-left bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                             <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Growth Analytics</p>
                                <TrendingUp className="w-4 h-4 text-green-500 animate-bounce" />
                             </div>
                             <CardTitle className="text-lg font-black italic uppercase leading-none dark:text-white">M-o-M Revenue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-24 flex items-end gap-1 px-4 mt-2">
                                {[30, 45, 25, 60, 40, 80, 55, 90, 35, 75].map((h, idx) => (
                                    <div key={idx} 
                                        className="w-full bg-blue-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors rounded-t cursor-pointer relative group" 
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap z-10 font-mono italic">₹{h * 10 }k</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-slate-950 rounded-xl border border-dashed border-blue-200 dark:border-slate-800 space-y-1">
                                <div className="flex justify-between items-center mb-2 text-left">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest italic font-mono">Next Settlement</p>
                                    <Badge variant="outline" className="text-[8px] font-black text-gray-500 dark:text-slate-400 uppercase border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">System Auto</Badge>
                                </div>
                                <div className="flex items-center justify-between text-left">
                                    <span className="text-sm sm:text-base font-black text-blue-900 dark:text-blue-400 italic transform hover:scale-105 transition-transform origin-left">30th June, 2026</span>
                                    <p className="text-xs font-black text-green-600 dark:text-green-400 italic leading-none border-b-2 border-green-100 dark:border-green-950">Expected: ₹54k</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-blue-50 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="p-4 border-b dark:border-slate-800">
                            <CardTitle className="text-md font-black italic uppercase flex items-center gap-2 text-gray-900 dark:text-white leading-none">
                                <FileText className="w-4 h-4 text-orange-600" /> Linked Tax Profiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                             <div className="flex items-center justify-between group cursor-pointer text-left">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-slate-950 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 dark:group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner"><FileText className="w-5 h-5" /></div>
                                     <div className="text-left">
                                         <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest italic leading-none mb-1">GST Certificate</p>
                                         <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest italic flex items-center gap-1 group-hover:text-blue-600 transition-colors ml-1"><BadgeCheck className="w-3 h-3 text-green-500" /> Verified Active</p>
                                     </div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                             </div>
                             <div className="flex items-center justify-between group cursor-pointer text-left">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-slate-950 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 dark:group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner"><CreditCard className="w-5 h-5" /></div>
                                     <div className="text-left">
                                         <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest italic leading-none mb-1">PAN DATABASE</p>
                                         <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest italic flex items-center gap-1 group-hover:text-blue-600 transition-colors ml-1"><BadgeCheck className="w-3 h-3 text-green-500" /> Linked Account</p>
                                     </div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal: Settlement Report Dialog */}
            {isSettlementOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 text-left">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">Generate Settlement Report</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider italic">Filter laboratory bookings by date range</p>
                            </div>
                            <button onClick={() => { setIsSettlementOpen(false); setSettlementReport(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all text-gray-500 dark:text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From Date</Label>
                                    <Input type="date" value={settlementFromDate} onChange={(e) => setSettlementFromDate(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Date</Label>
                                    <Input type="date" value={settlementToDate} onChange={(e) => setSettlementToDate(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                            </div>
                            <Button 
                                onClick={handleGenerateSettlementReport}
                                disabled={loadingReport}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest text-xs h-12 rounded-2xl transform active:scale-95 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
                            >
                                {loadingReport ? 'Generating Report...' : 'Compute Settlement Figures'}
                            </Button>

                            {settlementReport && (
                                <div className="space-y-6 pt-4 border-t dark:border-slate-800 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Bookings Count', val: settlementReport.totalBookings },
                                            { label: 'Total Revenue', val: `₹${parseFloat(settlementReport.totalRevenue).toLocaleString()}` },
                                            { label: 'Completed Rev', val: `₹${parseFloat(settlementReport.completedRevenue).toLocaleString()}` },
                                            { label: 'GST Tax (18%)', val: `₹${parseFloat(settlementReport.tax).toLocaleString()}` },
                                            { label: 'Lab Earnings', val: `₹${parseFloat(settlementReport.labEarnings).toLocaleString()}`, highlight: true }
                                        ].map((itm, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border dark:border-slate-800 ${itm.highlight ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30' : 'bg-gray-50 dark:bg-slate-950'}`}>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{itm.label}</p>
                                                <p className={`text-base font-black italic ${itm.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{itm.val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Table preview */}
                                    <div className="border dark:border-slate-800 rounded-3xl overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 uppercase tracking-widest text-[9px]">
                                                <tr>
                                                    <th className="px-4 py-3">Booking ID</th>
                                                    <th className="px-4 py-3">Patient</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                {settlementReport.bookings.map((b: any) => (
                                                    <tr key={b.bookingId} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                                        <td className="px-4 py-3 font-bold">{b.bookingId}</td>
                                                        <td className="px-4 py-3 font-bold uppercase">{b.patientName}</td>
                                                        <td className="px-4 py-3">{new Date(b.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3 uppercase text-[9px] font-black text-blue-600">{b.status}</td>
                                                        <td className="px-4 py-3 text-right font-black">₹{parseFloat(b.amount).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={handleExportSettlementCSV} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-gray-200 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800">
                                            <Download className="w-4 h-4" /> Export CSV/Excel
                                        </Button>
                                        <Button onClick={() => printReport(settlementReport)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2">
                                            <Printer className="w-4 h-4" /> Print PDF Report
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create Manual Invoice */}
            {isManualInvoiceOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 text-left">
                    <form onSubmit={handleCreateManualInvoice} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">Create GST-Compliant Manual Invoice</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider italic">Save offline customers and diagnostic services directly</p>
                            </div>
                            <button type="button" onClick={() => setIsManualInvoiceOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all text-gray-500 dark:text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</Label>
                                    <Input placeholder="Enter patient name" required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GSTIN / Tax Registration</Label>
                                    <Input placeholder="Issuer / Customer GSTIN" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Date</Label>
                                    <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount (INR)</Label>
                                    <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-12 rounded-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                                </div>
                            </div>

                            {/* Item Rows */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Line Items</Label>
                                    <Button type="button" variant="outline" onClick={handleAddItemRow} className="text-blue-600 dark:text-blue-400 h-8 rounded-xl font-bold uppercase text-[9px] tracking-wider border-blue-100 dark:border-slate-800 bg-blue-50/30">
                                        <Plus className="w-3 h-3 mr-1" /> Add Line
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {invoiceItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <Input 
                                                placeholder="Service Name / Test Description" 
                                                required 
                                                value={item.service_name} 
                                                onChange={(e) => handleItemChange(idx, 'service_name', e.target.value)} 
                                                className="h-12 rounded-2xl flex-1 dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs" 
                                            />
                                            <Input 
                                                type="number" 
                                                placeholder="Rate (₹)" 
                                                min="0"
                                                required 
                                                value={item.rate} 
                                                onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} 
                                                className="h-12 rounded-2xl w-24 dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs" 
                                            />
                                            <Input 
                                                type="number" 
                                                placeholder="Qty" 
                                                min="1"
                                                required 
                                                value={item.quantity} 
                                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} 
                                                className="h-12 rounded-2xl w-16 dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveItemRow(idx)}
                                                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all shrink-0"
                                                disabled={invoiceItems.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamically calculated figures */}
                            <div className="p-6 bg-gray-50 dark:bg-slate-950 rounded-3xl border dark:border-slate-800 flex justify-between items-center text-xs">
                                <div className="space-y-1">
                                    <div className="flex gap-4"><span className="text-gray-400">Subtotal:</span><span className="font-bold text-gray-800 dark:text-slate-200">₹{formTotals.subtotal.toFixed(2)}</span></div>
                                    <div className="flex gap-4"><span className="text-gray-400">Discount:</span><span className="font-bold text-gray-800 dark:text-slate-200">₹{parseFloat(discount || '0').toFixed(2)}</span></div>
                                    <div className="flex gap-4"><span className="text-gray-400">CGST (9%) / SGST (9%):</span><span className="font-bold text-gray-800 dark:text-slate-200">₹{(formTotals.tax/2).toFixed(2)} / ₹{(formTotals.tax/2).toFixed(2)}</span></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 italic">₹{formTotals.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-slate-800 flex gap-4 bg-gray-50/50 dark:bg-slate-950/50">
                            <Button type="button" variant="outline" onClick={() => setIsManualInvoiceOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-gray-200 dark:border-slate-800 dark:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={savingInvoice} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none">
                                {savingInvoice ? 'Saving Invoice...' : 'Save & Issue Invoice'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: Manual Invoice Details & Print */}
            {isInvoiceDetailOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 text-left">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
                        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tight text-gray-900 dark:text-white">Manual Invoice Detail</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider italic">ID: {selectedInvoice.invoice_id}</p>
                            </div>
                            <button onClick={() => { setIsInvoiceDetailOpen(false); setSelectedInvoice(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all text-gray-500 dark:text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start text-xs leading-relaxed">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer / Patient</p>
                                    <strong className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedInvoice.patient_name}</strong>
                                    {selectedInvoice.gst_number && <p className="font-mono text-gray-500">GSTIN: {selectedInvoice.gst_number}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice Date</p>
                                    <strong className="text-gray-900 dark:text-white">{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</strong>
                                </div>
                            </div>

                            <div className="border dark:border-slate-800 rounded-3xl overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400 font-bold border-b dark:border-slate-800 uppercase tracking-widest text-[9px]">
                                        <tr>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Qty</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {selectedInvoice.invoice_items?.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                                <td className="px-4 py-3 font-bold">{item.service_name}</td>
                                                <td className="px-4 py-3 text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-black">₹{parseFloat(item.amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-64 space-y-1 text-xs border-t dark:border-slate-800 pt-3">
                                    <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span>₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>Discount:</span><span>₹{parseFloat(selectedInvoice.discount || 0).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>Taxes (18% GST):</span><span>₹{parseFloat(selectedInvoice.tax).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-base font-black text-blue-600 dark:text-blue-400 border-t dark:border-slate-800 pt-2 mt-1"><span>Grand Total:</span><span>₹{parseFloat(selectedInvoice.total_amount).toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex gap-4">
                            <Button onClick={() => printInvoice(selectedInvoice)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2">
                                <Printer className="w-4 h-4" /> Print Tax Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
