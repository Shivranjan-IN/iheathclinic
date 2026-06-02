import { User } from '../common/types';
import { ThemeToggle } from '../common/ThemeToggle';
import {
    Calendar,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    UserPlus,
    Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReceptionistDashboardProps {
    user: User;
}

// Mock data
const mockCheckInsData = [
    { time: '8 AM', checkIns: 3 },
    { time: '9 AM', checkIns: 7 },
    { time: '10 AM', checkIns: 9 },
    { time: '11 AM', checkIns: 6 },
    { time: '12 PM', checkIns: 4 },
    { time: '2 PM', checkIns: 8 },
    { time: '3 PM', checkIns: 5 },
    { time: '4 PM', checkIns: 3 },
];

const mockTodayAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', time: '9:30 AM', status: 'checked-in' },
    { id: 2, patient: 'Emily Davis', doctor: 'Dr. Michael Chen', time: '10:00 AM', status: 'waiting' },
    { id: 3, patient: 'Robert Brown', doctor: 'Dr. Sarah Johnson', time: '10:30 AM', status: 'scheduled' },
    { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. Michael Chen', time: '11:00 AM', status: 'scheduled' },
    { id: 5, patient: 'David Wilson', doctor: 'Dr. Sarah Johnson', time: '11:30 AM', status: 'no-show' },
];

export function ReceptionistDashboard({ user }: ReceptionistDashboardProps) {
    const stats = [
        { label: "Today's Appointments", value: '45', change: '+12%', icon: Calendar, color: 'blue' },
        { label: 'Waiting Patients', value: '8', change: '+2', icon: Clock, color: 'orange' },
        { label: 'Completed Check-ins', value: '37', change: '+15%', icon: CheckCircle, color: 'green' },
        { label: 'No-shows Today', value: '2', change: '-50%', icon: AlertCircle, color: 'red' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
                    <p className="text-gray-600">Manage appointments and patient check-ins</p>
                </div>
                <ThemeToggle />
            </div>

            {/* Stats Grid - ROLE: Receptionist can view appointment stats */}
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

            {/* Check-ins Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-900">Check-ins Today</h3>
                        <p className="text-sm text-gray-600">By time slot</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Peak: 10 AM</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mockCheckInsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="checkIns" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Today's Appointments - ROLE: Receptionist can manage appointments and check-ins */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
                        <p className="text-sm text-gray-600">Manage patient arrivals</p>
                    </div>
                    {/* ROLE: Receptionist can book new appointments */}
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        + Book Appointment
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockTodayAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.patient}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{appointment.doctor}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {appointment.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'checked-in' ? 'bg-green-100 text-green-700' :
                                                appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                                    appointment.status === 'no-show' ? 'bg-red-100 text-red-700' :
                                                        'bg-purple-100 text-purple-700'
                                            }`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* ROLE: Receptionist can check-in patients */}
                                        {appointment.status === 'scheduled' && (
                                            <button className="text-sm text-blue-600 hover:underline mr-3">Check In</button>
                                        )}
                                        <button className="text-sm text-gray-600 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions - ROLE: Receptionist specific actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <UserPlus className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Register Patient</h3>
                    <p className="text-sm text-gray-600 mb-3">Add new patient to system</p>
                    <button className="text-sm text-blue-600 hover:underline font-medium">
                        Register →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <Calendar className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Manage Queue</h3>
                    <p className="text-sm text-gray-600 mb-3">View and organize patient queue</p>
                    <button className="text-sm text-green-600 hover:underline font-medium">
                        View Queue →
                    </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <Phone className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Send Reminders</h3>
                    <p className="text-sm text-gray-600 mb-3">Notify patients about appointments</p>
                    <button className="text-sm text-purple-600 hover:underline font-medium">
                        Send →
                    </button>
                </div>
            </div>
        </div>
    );
}
