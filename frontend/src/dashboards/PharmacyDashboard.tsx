import { User } from '../common/types';
import { ThemeToggle } from '../common/ThemeToggle';
import {
    Pill,
    DollarSign,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Package,
    FileText,
    ShoppingCart
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PharmacyDashboardProps {
    user: User;
}

// Mock data
const mockSalesData = [
    { day: 'Mon', sales: 12000 },
    { day: 'Tue', sales: 15000 },
    { day: 'Wed', sales: 13000 },
    { day: 'Thu', sales: 17000 },
    { day: 'Fri', sales: 14000 },
    { day: 'Sat', sales: 19000 },
    { day: 'Sun', sales: 11000 },
];

const mockInventoryData = [
    { category: 'Tablets', stock: 450 },
    { category: 'Syrups', stock: 180 },
    { category: 'Injections', stock: 120 },
    { category: 'Ointments', stock: 90 },
    { category: 'Drops', stock: 60 },
];

const mockPendingPrescriptions = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', items: 3, total: '₹850', status: 'pending' },
    { id: 2, patient: 'Emily Davis', doctor: 'Dr. Michael Chen', items: 2, total: '₹450', status: 'ready' },
    { id: 3, patient: 'Robert Brown', doctor: 'Dr. Sarah Johnson', items: 5, total: '₹1,200', status: 'pending' },
    { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. Michael Chen', items: 1, total: '₹320', status: 'dispensed' },
];

const mockLowStockItems = [
    { id: 1, medicine: 'Paracetamol 500mg', stock: 45, reorderLevel: 100, category: 'Tablets' },
    { id: 2, medicine: 'Amoxicillin 250mg', stock: 28, reorderLevel: 50, category: 'Capsules' },
    { id: 3, medicine: 'Cough Syrup', stock: 12, reorderLevel: 30, category: 'Syrups' },
];

export function PharmacyDashboard({ user }: PharmacyDashboardProps) {
    const stats = [
        { label: 'Pending Prescriptions', value: '12', change: '+5%', icon: FileText, color: 'orange' },
        { label: 'Dispensed Today', value: '48', change: '+10%', icon: CheckCircle, color: 'green' },
        { label: 'Low Stock Items', value: '8', change: '-2', icon: AlertCircle, color: 'red' },
        { label: 'Revenue Today', value: '₹17,000', change: '+12%', icon: DollarSign, color: 'purple' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
                    <p className="text-gray-600">Medicine inventory and prescription management</p>
                </div>
                <ThemeToggle />
            </div>

            {/* Stats Grid - ROLE: Pharmacist can view pharmacy stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
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
                {/* Weekly Sales */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Weekly Sales</h3>
                            <p className="text-sm text-gray-600">Last 7 days</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12%</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={mockSalesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Inventory by Category */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Inventory by Category</h3>
                            <p className="text-sm text-gray-600">Current stock levels</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={mockInventoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pending Prescriptions - ROLE: Pharmacist can dispense medicines */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Pending Prescriptions</h3>
                    <p className="text-sm text-gray-600">Prescriptions to be dispensed</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockPendingPrescriptions.map((prescription) => (
                                <tr key={prescription.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{prescription.patient}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{prescription.doctor}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{prescription.items}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{prescription.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${prescription.status === 'dispensed' ? 'bg-green-100 text-green-700' :
                                                prescription.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ROLE: Pharmacist can dispense prescriptions */}
                                        {prescription.status !== 'dispensed' && (
                                            <button className="text-sm text-blue-600 hover:underline mr-3">Dispense</button>
                                        )}
                                        <button className="text-sm text-gray-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-xl border border-red-200">
                <div className="p-6 border-b border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
                            <p className="text-sm text-gray-600">Items requiring reorder</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockLowStockItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.medicine}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                    <td className="px-6 py-4 text-sm text-red-600 font-medium">{item.stock}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel}</td>
                                    <td className="px-6 py-4">
                                        {/* ROLE: Pharmacist can reorder stock */}
                                        <button className="text-sm text-blue-600 hover:underline">Reorder</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions - ROLE: Pharmacist specific actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <Pill className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Dispense Medicine</h3>
                    <p className="text-sm text-gray-600 mb-3">Process prescription orders</p>
                    <button className="text-sm text-blue-600 hover:underline font-medium">
                        Dispense →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <Package className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Inventory</h3>
                    <p className="text-sm text-gray-600 mb-3">Update stock and add items</p>
                    <button className="text-sm text-green-600 hover:underline font-medium">
                        Manage →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <ShoppingCart className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Place Order</h3>
                    <p className="text-sm text-gray-600 mb-3">Order new stock from suppliers</p>
                    <button className="text-sm text-purple-600 hover:underline font-medium">
                        Order →
                    </button>
                </div>
            </div>
        </div>
    );
}
