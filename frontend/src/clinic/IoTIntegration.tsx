import { useState } from 'react';
import { UserRole } from '../App';
import { Activity, Heart, Droplet, Thermometer, TrendingUp, Wifi, AlertCircle, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IoTIntegrationProps {
  userRole: UserRole;
}

interface Device {
  id: string;
  name: string;
  type: 'bp_monitor' | 'glucose_meter' | 'heart_rate' | 'thermometer';
  patient: string;
  patientId: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  battery: number;
  currentReading?: {
    value: string;
    timestamp: string;
    status: 'normal' | 'warning' | 'critical';
  };
}

const mockDevices: Device[] = [
  {
    id: 'BP001',
    name: 'Omron BP Monitor',
    type: 'bp_monitor',
    patient: 'John Smith',
    patientId: 'P001',
    status: 'connected',
    lastSync: '2 min ago',
    battery: 85,
    currentReading: {
      value: '120/80 mmHg',
      timestamp: '2025-01-12 10:30',
      status: 'normal'
    }
  },
  {
    id: 'GLU001',
    name: 'Accu-Chek Glucose Meter',
    type: 'glucose_meter',
    patient: 'Robert Brown',
    patientId: 'P003',
    status: 'connected',
    lastSync: '5 min ago',
    battery: 92,
    currentReading: {
      value: '145 mg/dL',
      timestamp: '2025-01-12 10:25',
      status: 'warning'
    }
  },
  {
    id: 'HR001',
    name: 'Fitbit Heart Rate Monitor',
    type: 'heart_rate',
    patient: 'Emily Davis',
    patientId: 'P002',
    status: 'connected',
    lastSync: '1 min ago',
    battery: 68,
    currentReading: {
      value: '72 bpm',
      timestamp: '2025-01-12 10:31',
      status: 'normal'
    }
  },
  {
    id: 'TMP001',
    name: 'Digital Thermometer',
    type: 'thermometer',
    patient: 'Lisa Anderson',
    patientId: 'P004',
    status: 'disconnected',
    lastSync: '2 hours ago',
    battery: 45,
    currentReading: {
      value: '98.6°F',
      timestamp: '2025-01-12 08:30',
      status: 'normal'
    }
  },
];

const bpTrendData = [
  { time: '8 AM', systolic: 118, diastolic: 78 },
  { time: '10 AM', systolic: 120, diastolic: 80 },
  { time: '12 PM', systolic: 122, diastolic: 82 },
  { time: '2 PM', systolic: 125, diastolic: 85 },
  { time: '4 PM', systolic: 121, diastolic: 81 },
  { time: '6 PM', systolic: 119, diastolic: 79 },
];

const glucoseTrendData = [
  { time: 'Mon', value: 120 },
  { time: 'Tue', value: 135 },
  { time: 'Wed', value: 145 },
  { time: 'Thu', value: 140 },
  { time: 'Fri', value: 138 },
  { time: 'Sat', value: 142 },
  { time: 'Sun', value: 145 },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/30'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-900/30'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/30'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900/30'
  }
};

export function IoTIntegration({ userRole }: IoTIntegrationProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');
  const gridStroke = isDark ? '#1e293b' : '#f0f0f0';

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'bp_monitor': return Activity;
      case 'glucose_meter': return Droplet;
      case 'heart_rate': return Heart;
      case 'thermometer': return Thermometer;
    }
  };

  const getDeviceColorKey = (type: Device['type']): 'blue' | 'purple' | 'red' | 'orange' => {
    switch (type) {
      case 'bp_monitor': return 'blue';
      case 'glucose_meter': return 'purple';
      case 'heart_rate': return 'red';
      case 'thermometer': return 'orange';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-105 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">IoT & Wearable Integration</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Monitor patient vitals in real-time</p>
        </div>
        {(userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse' || userRole === 'clinic') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{mockDevices.length}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Connected Devices</p>
        </div>

        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-green-200 dark:border-green-900/20 transition-colors duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{mockDevices.filter(d => d.status === 'connected').length}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Active Now</p>
        </div>

        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-purple-200 dark:border-purple-900/20 transition-colors duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">1,247</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Readings Today</p>
        </div>

        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-orange-200 dark:border-orange-900/20 transition-colors duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Alerts</p>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="bg-white dark:bg-[#111625] rounded-xl border border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Connected Devices</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Real-time monitoring devices</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockDevices.map((device) => {
              const Icon = getDeviceIcon(device.type);
              const colorKey = getDeviceColorKey(device.type);
              const colors = colorMap[colorKey] || colorMap.blue;
              
              return (
                <div 
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className="p-4 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-[#161c2d]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-slate-100">{device.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{device.patient} ({device.patientId})</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      device.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                      device.status === 'syncing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      <Wifi className="w-3 h-3" />
                      {device.status}
                    </span>
                  </div>

                  {device.currentReading && (
                    <div className={`p-3 rounded-lg mb-3 border ${
                      device.currentReading.status === 'normal' ? 'bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/30' :
                      device.currentReading.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/30' :
                      'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Latest Reading</p>
                          <p className={`text-2xl font-bold ${
                            device.currentReading.status === 'normal' ? 'text-green-700 dark:text-green-400' :
                            device.currentReading.status === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                            'text-red-750 dark:text-red-400'
                          }`}>
                            {device.currentReading.value}
                          </p>
                        </div>
                        {device.currentReading.status !== 'normal' && (
                          <AlertCircle className={`w-5 h-5 ${
                            device.currentReading.status === 'warning' ? 'text-yellow-600 dark:text-yellow-450' : 'text-red-600 dark:text-red-400'
                          }`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{device.currentReading.timestamp}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-450">
                    <span>Last sync: {device.lastSync}</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        device.battery > 70 ? 'bg-green-500' :
                        device.battery > 30 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span>{device.battery}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Trend */}
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Blood Pressure Trend</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">John Smith - Today</p>
            </div>
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bpTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
              <Tooltip contentStyle={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' } : undefined} />
              <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#10b981" strokeWidth={2} name="Diastolic" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Glucose Trend */}
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Glucose Level Trend</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Robert Brown - Last 7 Days</p>
            </div>
            <Droplet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={glucoseTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
              <Tooltip contentStyle={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' } : undefined} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-900 dark:text-yellow-250">
                Glucose levels trending higher. Consider consulting with doctor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Devices */}
      <div className="bg-white dark:bg-[#111625] rounded-xl border border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Supported Devices</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Compatible IoT and wearable devices</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'BP Monitors', icon: Activity, count: '5 models', color: 'blue' },
              { name: 'Glucose Meters', icon: Droplet, count: '4 models', color: 'purple' },
              { name: 'Heart Rate Trackers', icon: Heart, count: '8 models', color: 'red' },
              { name: 'Thermometers', icon: Thermometer, count: '3 models', color: 'orange' },
            ].map((deviceType, index) => {
              const colors = colorMap[deviceType.color as 'blue' | 'purple' | 'red' | 'orange'] || colorMap.blue;
              return (
                <div key={index} className={`p-4 border ${colors.border} ${colors.bg} rounded-lg`}>
                  <deviceType.icon className={`w-8 h-8 ${colors.text} mb-3`} />
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">{deviceType.name}</h4>
                  <p className="text-sm text-gray-650 dark:text-slate-400">{deviceType.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111625] border dark:border-slate-800 rounded-xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add IoT Device</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Device Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option>BP Monitor</option>
                    <option>Glucose Meter</option>
                    <option>Heart Rate Tracker</option>
                    <option>Thermometer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Device Model *</label>
                  <input type="text" placeholder="e.g., Omron BP Monitor" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Patient *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Patient</option>
                    <option>John Smith (P001)</option>
                    <option>Emily Davis (P002)</option>
                    <option>Robert Brown (P003)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Device ID</label>
                  <input type="text" placeholder="Unique device identifier" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Device
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
