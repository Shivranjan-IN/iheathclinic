import { useState } from 'react';
import { UserRole } from '../App';
import { Shield, Lock, Eye, FileText, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

interface SecurityComplianceProps {
  userRole: UserRole;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  ip: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'A001',
    user: 'Dr. Sarah Johnson',
    action: 'Viewed patient record',
    resource: 'Patient P001',
    timestamp: '2025-01-12 10:30:15',
    status: 'success',
    ip: '192.168.1.45'
  },
  {
    id: 'A002',
    user: 'Emma Wilson',
    action: 'Created appointment',
    resource: 'Appointment A005',
    timestamp: '2025-01-12 10:25:42',
    status: 'success',
    ip: '192.168.1.33'
  },
  {
    id: 'A003',
    user: 'Unknown',
    action: 'Failed login attempt',
    resource: 'System Login',
    timestamp: '2025-01-12 10:20:18',
    status: 'failed',
    ip: '203.45.67.89'
  },
  {
    id: 'A004',
    user: 'Dr. Michael Chen',
    action: 'Updated prescription',
    resource: 'Prescription RX-002',
    timestamp: '2025-01-12 10:15:33',
    status: 'success',
    ip: '192.168.1.52'
  },
  {
    id: 'A005',
    user: 'Robert Brown',
    action: 'Accessed billing data',
    resource: 'Invoice INV-003',
    timestamp: '2025-01-12 10:10:27',
    status: 'warning',
    ip: '192.168.1.28'
  },
];

const rolePermissions = [
  {
    role: 'Admin',
    permissions: ['Full System Access', 'User Management', 'Data Export', 'System Configuration', 'Audit Logs'],
    users: 1
  },
  {
    role: 'Doctor',
    permissions: ['View Patients', 'Create Prescriptions', 'View Lab Results', 'Update Medical Records'],
    users: 2
  },
  {
    role: 'Receptionist',
    permissions: ['Create Appointments', 'Patient Registration', 'Billing', 'View Schedule'],
    users: 1
  },
  {
    role: 'Nurse',
    permissions: ['View Patients', 'Update Vitals', 'View Prescriptions'],
    users: 1
  },
  {
    role: 'Lab Technician',
    permissions: ['View Lab Orders', 'Upload Results', 'Update Test Status'],
    users: 1
  },
  {
    role: 'Pharmacist',
    permissions: ['View Prescriptions', 'Manage Inventory', 'Dispense Medicine'],
    users: 1
  },
];

export function SecurityCompliance({ userRole }: SecurityComplianceProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only administrators can access security settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security & Compliance</h1>
          <p className="text-gray-600">Manage access control and audit trails</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">System Secured</span>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">Enabled</p>
          <p className="text-sm text-gray-600">Data Encryption</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">Active</p>
          <p className="text-sm text-gray-600">Role-Based Access</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{mockAuditLogs.length}</p>
          <p className="text-sm text-gray-600">Audit Logs (Today)</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600">1</p>
          <p className="text-sm text-gray-600">Security Alerts</p>
        </div>
      </div>

      {/* Role-Based Access Control */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Role-Based Access Control (RBAC)</h3>
          <p className="text-sm text-gray-600">Permission management by role</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {rolePermissions.map((role, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{role.role}</h4>
                      <p className="text-sm text-gray-600">{role.users} user(s)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAccessModal(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit Permissions
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, pIndex) => (
                    <span 
                      key={pIndex}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Encryption Status */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Data Encryption</h3>
          <p className="text-sm text-gray-600">Protection measures in place</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Lock className="w-5 h-5 text-green-600" />
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Data at Rest</h4>
              <p className="text-sm text-gray-600">AES-256 encryption enabled</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Data in Transit</h4>
              <p className="text-sm text-gray-600">TLS 1.3 encryption active</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Lock className="w-5 h-5 text-green-600" />
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Database</h4>
              <p className="text-sm text-gray-600">Encrypted backups enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Audit Logs</h3>
              <p className="text-sm text-gray-600">System activity tracking</p>
            </div>
            <button className="text-sm text-blue-600 hover:underline">
              Export Logs
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAuditLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.resource}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' :
                      log.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'success' && <CheckCircle className="w-3 h-3" />}
                      {log.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                      {log.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Compliance Checklist</h3>
          <p className="text-sm text-gray-600">Healthcare data protection standards</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              'HIPAA Compliance - Patient data privacy',
              'Data encryption at rest and in transit',
              'Regular security audits and monitoring',
              'Role-based access control implemented',
              'Secure authentication and authorization',
              'Audit logging and trail maintenance',
              'Regular data backups and disaster recovery',
              'Secure API endpoints and communications'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-900">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-xl border border-orange-200">
        <div className="p-6 border-b border-orange-100 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Security Alert</h3>
              <p className="text-sm text-orange-800 mt-1">
                Failed login attempt detected from IP 203.45.67.89 at 10:20 AM. 
                Account temporarily locked for security.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
              Investigate
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Access Control Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Access Permissions</h2>
                <button 
                  onClick={() => setShowAccessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Admin</option>
                    <option>Doctor</option>
                    <option>Receptionist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="space-y-2">
                    {['View Patients', 'Edit Patient Data', 'Create Appointments', 'View Billing', 'System Configuration'].map((permission, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={index < 3} className="rounded" />
                        <label className="text-sm text-gray-700">{permission}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setShowAccessModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
