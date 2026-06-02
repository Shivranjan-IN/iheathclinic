import { useState } from 'react';
import { UserRole } from '../common/types';
import {
    Activity,
    Heart,
    Plus,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IoTIntegrationProps {
    userRole: UserRole;
}

interface Device {
    id: number;
    name: string;
    type: string;
    patient: string;
    status: 'online' | 'offline';
    lastReading: string;
    battery: number;
}

interface VitalReading {
    time: string;
    value: number;
}

const mockDevices: Device[] = [
    {
        id: 1,
        name: 'BP Monitor #001',
        type: 'Blood Pressure',
        patient: 'John Smith',
        status: 'online',
        lastReading: '2 mins ago',
        battery: 85
    },
    {
        id: 2,
        name: 'Glucose Meter #002',
        type: 'Blood Glucose',
        patient: 'Emily Davis',
        status: 'online',
        lastReading: '5 mins ago',
        battery: 92
    },
    {
        id: 3,
        name: 'Pulse Oximeter #003',
        type: 'SpO2',
        patient: 'Robert Brown',
        status: 'offline',
        lastReading: '2 hours ago',
        battery: 15
    },
];

const heartRateData: VitalReading[] = [
    { time: '10:00', value: 72 },
    { time: '10:15', value: 75 },
    { time: '10:30', value: 78 },
    { time: '10:45', value: 74 },
    { time: '11:00', value: 76 },
    { time: '11:15', value: 73 },
];

const bpData: VitalReading[] = [
    { time: '10:00', value: 120 },
    { time: '10:15', value: 118 },
    { time: '10:30', value: 122 },
    { time: '10:45', value: 119 },
    { time: '11:00', value: 121 },
    { time: '11:15', value: 120 },
];

export function IoTIntegration({ userRole }: IoTIntegrationProps) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const isDark = document.documentElement.classList.contains('dark');
    const gridStroke = isDark ? '#1e293b' : '#f0f0f0';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">IoT Integration</h1>
                    <p className="text-gray-600 dark:text-slate-400">Monitor patient vitals from connected devices</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Device
                </button>
            </div>

            {/* Device Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
                            <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                {mockDevices.filter(d => d.status === 'online').length}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Online Devices</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
                            <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                {mockDevices.filter(d => d.status === 'offline').length}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Offline Devices</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">1,247</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Total Readings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Vitals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
                                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Heart Rate</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">John Smith</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">73 <span className="text-sm font-normal text-gray-600 dark:text-slate-400">bpm</span></p>
                            <p className="text-sm text-green-600 dark:text-green-400">Normal</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={heartRateData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} domain={[60, 90]} />
                            <Tooltip contentStyle={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' } : undefined} />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Blood Pressure</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400">John Smith</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">120/80 <span className="text-sm font-normal text-gray-600 dark:text-slate-400">mmHg</span></p>
                            <p className="text-sm text-green-600 dark:text-green-400">Normal</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={bpData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} domain={[100, 140]} />
                            <Tooltip contentStyle={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' } : undefined} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Connected Devices */}
            <div className="bg-white dark:bg-[#111625] rounded-xl border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">Connected Devices</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-slate-850">
                    {mockDevices.map((device) => (
                        <div key={device.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/10 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${device.status === 'online' ? 'bg-green-100 dark:bg-green-950/20' : 'bg-gray-100 dark:bg-slate-800/30'
                                        }`}>
                                        {device.status === 'online' ? (
                                            <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <WifiOff className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-slate-100">{device.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{device.type} • {device.patient}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Last Reading</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{device.lastReading}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Battery</p>
                                        <p className={`text-sm font-medium ${device.battery > 50 ? 'text-green-600 dark:text-green-400' :
                                                device.battery > 20 ? 'text-orange-600 dark:text-orange-400' :
                                                    'text-red-600 dark:text-red-455'
                                            }`}>
                                            {device.battery}%
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${device.status === 'online'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                        {device.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl p-6 border border-orange-200 dark:border-orange-900/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-600 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-orange-200 mb-2">Device Alerts</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-orange-350">
                            <li className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                <span><strong>Low Battery:</strong> Pulse Oximeter #003 battery at 15%</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                <span><strong>Offline Device:</strong> Pulse Oximeter #003 offline for 2 hours</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
