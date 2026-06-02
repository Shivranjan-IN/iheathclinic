import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { patientService } from '../services/patientService';
import {
  CreditCard,
  Download,
  Eye,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Badge } from '../common/ui/badge';
import { Input } from '../common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import type { PatientUser } from '../PatientPortal';

interface MyBillingProps {
  patient: PatientUser;
}

const invoices = [
  {
    id: 'INV-2025-001',
    date: 'Nov 10, 2025',
    service: 'Cardiology Consultation',
    provider: 'Dr. Sarah Johnson',
    amount: 1500,
    status: 'Paid',
    paymentDate: 'Nov 10, 2025',
    paymentMethod: 'UPI'
  },
  {
    id: 'INV-2025-002',
    date: 'Nov 05, 2025',
    service: 'Blood Test - CBC',
    provider: 'Lab Services',
    amount: 800,
    status: 'Pending',
    dueDate: 'Nov 12, 2025'
  },
  {
    id: 'INV-2025-003',
    date: 'Oct 28, 2025',
    service: 'General Checkup',
    provider: 'Dr. Rajesh Kumar',
    amount: 500,
    status: 'Paid',
    paymentDate: 'Oct 28, 2025',
    paymentMethod: 'Card'
  },
  {
    id: 'INV-2025-004',
    date: 'Oct 15, 2025',
    service: 'X-Ray Chest',
    provider: 'Radiology Dept',
    amount: 1200,
    status: 'Paid',
    paymentDate: 'Oct 15, 2025',
    paymentMethod: 'Cash'
  },
  {
    id: 'INV-2025-005',
    date: 'Oct 08, 2025',
    service: 'Lipid Profile Test',
    provider: 'Lab Services',
    amount: 650,
    status: 'Paid',
    paymentDate: 'Oct 08, 2025',
    paymentMethod: 'UPI'
  }
];

export function MyBilling({ patient }: MyBillingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await patientService.getMyInvoices();
      setInvoices(data || []);
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.description || 'Medical Consultation').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter((i: any) => i.status?.toLowerCase() === 'paid').reduce((sum: number, i: any) => sum + Number(i.total_amount || i.amount || 0), 0);
  const totalPending = invoices.filter((i: any) => i.status?.toLowerCase() === 'pending').reduce((sum: number, i: any) => sum + Number(i.total_amount || i.amount || 0), 0);
  const completedCount = invoices.filter((i: any) => i.status?.toLowerCase() === 'paid').length;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const printInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Failed to open print window. Please allow popups.');
      return;
    }

    const itemsHTML = (invoice.invoice_items || []).map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.service_name || 'Medical Service'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(item.rate || 0).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(item.amount || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = Number(invoice.subtotal || invoice.total_amount || 0);
    const tax = Number(invoice.tax || 0);
    const discount = Number(invoice.discount || 0);
    const total = Number(invoice.total_amount || 0);

    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${invoice.invoice_id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ec4899; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #ec4899; }
            .invoice-details { text-align: right; }
            .billing-info { display: flex; justify-content: space-between; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; }
            .totals { margin-top: 30px; float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; color: #ec4899; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">I Health Clinic</div>
              <p>123 Medical Wellness Way<br>Sydney, NSW 2000</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice ID:</strong> ${invoice.invoice_id}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoice_date || Date.now()).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${invoice.status || 'Paid'}</p>
            </div>
          </div>
          
          <div class="billing-info">
            <div>
              <h3>Billed To:</h3>
              <p><strong>Patient Name:</strong> ${patient.full_name || patient.name || ''}</p>
              <p><strong>Patient ID:</strong> ${patient.patient_id || patient.id || ''}</p>
            </div>
            <div>
              <h3>Payment Status:</h3>
              <p><strong>Status:</strong> ${invoice.status || 'Paid'}</p>
              <p><strong>Method:</strong> Online</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%; text-align: center;">Quantity</th>
                <th style="width: 15%; text-align: right;">Rate</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML || `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${invoice.description || 'Medical Consultation'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">1</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${total.toFixed(2)}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${total.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${(subtotal || total).toFixed(2)}</span>
            </div>
            ${tax > 0 ? `
            <div class="totals-row">
              <span>Tax (GST):</span>
              <span>₹${tax.toFixed(2)}</span>
            </div>
            ` : ''}
            ${discount > 0 ? `
            <div class="totals-row">
              <span>Discount:</span>
              <span>-₹${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Total:</span>
              <span>₹${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="clear: both;"></div>
          
          <div class="footer">
            <p>Thank you for choosing I Health Clinic. For any questions, please contact support.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white mb-1">My Billing</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">View your invoices and pay your bills securely online</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 dark:bg-none dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600 rounded-lg">
                <CheckCircle className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">₹{totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200 dark:bg-none dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600 rounded-lg">
                <Clock className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 dark:bg-none dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <CreditCard className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white focus-visible:ring-blue-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                {invoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
                {filteredInvoices.map((invoice: any) => (
                  <React.Fragment key={invoice.invoice_id}>
                    <tr id={`invoice-row-${invoice.invoice_id}`} className="hover:bg-gray-50 dark:hover:bg-slate-850/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{invoice.invoice_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <Calendar className="size-4" />
                          {new Date(invoice.invoice_date || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-slate-200">{invoice.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Clinic Visit</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-white">₹{invoice.total_amount || invoice.amount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.status?.toLowerCase() === 'paid' ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="size-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-600 text-white">
                            <Clock className="size-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {invoice.status?.toLowerCase() === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setShowPaymentModal(invoice.invoice_id)}
                            >
                              Pay Now
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="dark:border-slate-800 dark:hover:bg-slate-800"
                            onClick={() => printInvoice(invoice)}
                          >
                            <Download className="size-4 mr-1" />
                            Print/PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="dark:hover:bg-slate-800"
                            onClick={() => toggleExpand(invoice.invoice_id)}
                          >
                            {expandedId === invoice.invoice_id ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === invoice.invoice_id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-slate-950">
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Invoice Details</h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-slate-400 mb-1">Patient Name</p>
                                <p className="font-medium text-gray-900 dark:text-white">{patient.full_name}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-slate-400 mb-1">Patient ID</p>
                                <p className="font-medium text-gray-900 dark:text-white">{patient.patient_id}</p>
                              </div>
                              {invoice.status?.toLowerCase() === 'paid' && (
                                <>
                                  <div>
                                    <p className="text-gray-600 dark:text-slate-400 mb-1">Payment Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{new Date(invoice.invoice_date || Date.now()).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 dark:text-slate-400 mb-1">Payment Method</p>
                                    <p className="font-medium text-gray-900 dark:text-white">Online</p>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 dark:text-slate-400">Service Charge</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{invoice.total_amount || invoice.amount || 0}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ₹{invoice.total_amount || invoice.amount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <CreditCard className="size-5" />
                Make Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const invoice = invoices.find((i: any) => i.invoice_id === showPaymentModal);
                const total = invoice ? Math.round(Number(invoice.total_amount || invoice.amount || 0)) : 0;

                return (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-850">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Invoice ID</span>
                        <span className="text-sm font-mono font-medium dark:text-slate-300">{showPaymentModal}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Service</span>
                        <span className="text-sm font-medium dark:text-slate-300">{invoice?.service}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-850">
                        <span className="font-medium text-gray-900 dark:text-white">Amount to Pay</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{total}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <CreditCard className="size-4 mr-2" />
                        Pay with UPI
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <CreditCard className="size-4 mr-2" />
                        Pay with Card
                      </Button>
                      <Button className="w-full dark:border-slate-800 dark:hover:bg-slate-800" variant="outline">
                        <CreditCard className="size-4 mr-2" />
                        Net Banking
                      </Button>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="size-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          Your payment is secured with 256-bit SSL encryption
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full dark:border-slate-800 dark:hover:bg-slate-800"
                      variant="outline"
                      onClick={() => setShowPaymentModal(null)}
                    >
                      Cancel
                    </Button>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}