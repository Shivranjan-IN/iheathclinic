import { User } from '../common/types';
import { ThemeToggle } from '../common/ThemeToggle';
import {
    Users,
    Activity,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Thermometer,
    Heart,
    ClipboardList
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NurseDashboardProps {
    user: User;
}

// Mock data
const mockVitalChecksData = [
    { time: '8 AM', checks: 5 },
    { time: '10 AM', checks: 8 },
    { time: '12 PM', checks: 6 },
    { time: '2 PM', checks: 7 },
    { time: '4 PM', checks: 4 },
];

const mockAssignedPatients = [
    { id: 1, name: 'John Smith', room: '101', condition: 'Stable', vitals: 'Normal', priority: 'low' },
    { id: 2, name: 'Emily Davis', room: '102', condition: 'Monitoring', vitals: 'Elevated BP', priority: 'medium' },
    { id: 3, name: 'Robert Brown', room: '103', condition: 'Recovery', vitals: 'Normal', priority: 'low' },
    { id: 4, name: 'Lisa Anderson', room: '104', condition: 'Critical', vitals: 'Unstable', priority: 'high' },
];

export function NurseDashboard({ user }: NurseDashboardProps) {
    const stats = [
        { label: 'Assigned Patients', value: '18', change: '+3', icon: Users, color: 'blue' },
        { label: 'Vital Checks Today', value: '30', change: '+10%', icon: Activity, color: 'green' },
        { label: 'Pending Tasks', value: '7', change: '-2', icon: AlertCircle, color: 'orange' },
        { label: 'Completed Care', value: '23', change: '+12%', icon: CheckCircle, color: 'purple' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
                    <p className="text-gray-600">Patient care and vital monitoring</p>
                </div>
                <ThemeToggle />
            </div>

            {/* Stats Grid - ROLE: Nurse can view patient care stats */}
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

            {/* Vital Checks Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900">Vital Checks Today</h3>
                        <p className="text-sm text-gray-600">By time slot</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>On Track</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mockVitalChecksData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="checks" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Assigned Patients - ROLE: Nurse can view and update patient vitals */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Assigned Patients</h3>
                    <p className="text-sm text-gray-600">Patients under your care</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vitals</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockAssignedPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{patient.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{patient.room}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{patient.condition}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{patient.vitals}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${patient.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                patient.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {patient.priority.charAt(0).toUpperCase() + patient.priority.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ROLE: Nurse can update vitals */}
                                        <button className="text-sm text-blue-600 hover:underline mr-3">Update Vitals</button>
                                        <button className="text-sm text-gray-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions - ROLE: Nurse specific actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <Thermometer className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Record Vitals</h3>
                    <p className="text-sm text-gray-600 mb-3">Update patient vital signs</p>
                    <button className="text-sm text-blue-600 hover:underline font-medium">
                        Record Now →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <Heart className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Patient Care</h3>
                    <p className="text-sm text-gray-600 mb-3">View care instructions</p>
                    <button className="text-sm text-green-600 hover:underline font-medium">
                        View Tasks →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <ClipboardList className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Medication Schedule</h3>
                    <p className="text-sm text-gray-600 mb-3">Manage medication rounds</p>
                    <button className="text-sm text-purple-600 hover:underline font-medium">
                        View Schedule →
                    </button>
                </div>
            </div>
        </div>
    );
}
