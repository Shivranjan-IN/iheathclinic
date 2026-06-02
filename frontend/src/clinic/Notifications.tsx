import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { Bell, Mail, MessageSquare, Send, Clock, CheckCircle, X, Loader2 } from 'lucide-react';
import { clinicService } from '../services/clinicService';

interface NotificationsProps {
  userRole: UserRole;
}

interface Notification {
  id: string;
  type: 'sms' | 'email' | 'whatsapp' | 'in-app';
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'failed';
  category: 'appointment' | 'payment' | 'announcement' | 'reminder';
}

export function Notifications({ userRole }: NotificationsProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    channel: 'SMS',
    category: 'Appointment Reminder',
    recipient: 'Select Patient(s)',
    title: '',
    message: ''
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await clinicService.getNotifications();
        // Map backend notification structure to frontend
        const mapped: Notification[] = data.map((n: any) => ({
          id: n.notification_id || String(n.id),
          type: n.type || 'in-app',
          title: n.title || 'Notification',
          message: n.content || n.message || '',
          recipient: n.recipients?.[0]?.recipient_contact || 'Multiple Recipients',
          timestamp: new Date(n.created_at).toLocaleString(),
          status: n.status || 'sent',
          category: n.category || 'announcement'
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Please fill in mandatory fields (Title and Message)');
      return;
    }

    try {
      setSending(true);
      const success = await clinicService.sendNotification(formData);
      if (success) {
        alert('Communication broadcast initiated successfully! All target recipients will be notified.');
        setShowSendModal(false);
        setFormData({
            channel: 'SMS',
            category: 'Appointment Reminder',
            recipient: 'Select Patient(s)',
            title: '',
            message: ''
        });
        // Refresh notifications list
        const data = await clinicService.getNotifications();
        const mapped: Notification[] = data.map((n: any) => ({
            id: n.notification_id || String(n.id),
            type: n.channel || 'in-app',
            title: n.title || 'Notification',
            message: n.message || '',
            recipient: 'Multi-recipient',
            timestamp: new Date(n.created_at).toLocaleString(),
            status: n.status || 'sent',
            category: n.notification_type || 'announcement'
          }));
        setNotifications(mapped);
      } else {
        alert('Broadcast failure: Neural link could not be established.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesCategory = filterCategory === 'all' || notif.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const pendingCount = notifications.filter(n => n.status === 'pending').length;
  const failedCount = notifications.filter(n => n.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Retrieving clinic transmissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications & Communication</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage patient communications across all channels</p>
        </div>
        {(userRole === 'clinic' || userRole === 'receptionist') && (
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
            Send Notification
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
          <p className="text-sm text-gray-605 dark:text-slate-400">Total Notifications</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-green-200 dark:border-green-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sentCount}</p>
          <p className="text-sm text-gray-605 dark:text-slate-400">Successfully Sent</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-yellow-200 dark:border-yellow-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          <p className="text-sm text-gray-655 dark:text-slate-400">Pending</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-red-200 dark:border-red-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
          <p className="text-sm text-gray-655 dark:text-slate-400">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-2">Channel</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'sms', 'email', 'whatsapp', 'in-app'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {type === 'all' ? 'All' : type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'appointment', 'payment', 'announcement', 'reminder'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Channels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-1 rounded-full">SMS</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Text Messages</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Quick appointment reminders and updates</p>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {notifications.filter((n: Notification) => n.type === 'sms').length}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">messages sent</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-green-200 dark:border-green-900/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-950/40 dark:text-green-400 px-2 py-1 rounded-full">EMAIL</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Detailed reports and receipts</p>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {notifications.filter((n: Notification) => n.type === 'email').length}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">emails sent</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-1 rounded-full">WHATSAPP</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Rich media and instant updates</p>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {notifications.filter((n: Notification) => n.type === 'whatsapp').length}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">messages sent</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-orange-200 dark:border-orange-900/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 px-2 py-1 rounded-full">IN-APP</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">In-App</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">System notifications and alerts</p>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {notifications.filter((n: Notification) => n.type === 'in-app').length}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">notifications sent</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Communication history</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${notification.type === 'sms' ? 'bg-blue-50 dark:bg-blue-950/20' :
                    notification.type === 'email' ? 'bg-green-50 dark:bg-green-950/20' :
                      notification.type === 'whatsapp' ? 'bg-purple-50 dark:bg-purple-950/20' :
                        'bg-orange-50 dark:bg-orange-950/20'
                    }`}>
                    {notification.type === 'sms' && <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    {notification.type === 'email' && <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    {notification.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    {notification.type === 'in-app' && <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-white transition-colors">{notification.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${notification.category === 'appointment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-450' :
                        notification.category === 'payment' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-450' :
                          notification.category === 'announcement' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-450' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-450'
                        }`}>
                        {notification.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-450">
                      <span>To: {notification.recipient}</span>
                      <span>•</span>
                      <span>{notification.timestamp}</span>
                      <span>•</span>
                      <span className="uppercase">{notification.type}</span>
                    </div>
                  </div>
                </div>

                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${notification.status === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-450' :
                  notification.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-450' :
                    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-405'
                  }`}>
                  {notification.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                  {notification.status === 'pending' && <Clock className="w-3 h-3" />}
                  {notification.status === 'failed' && <X className="w-3 h-3" />}
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border dark:border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Notification</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSendNotification}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Channel *</label>
                    <select 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none focus:border-blue-600"
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    >
                      <option>SMS</option>
                      <option>Email</option>
                      <option>WhatsApp</option>
                      <option>In-App</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category *</label>
                    <select 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none focus:border-blue-600"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Appointment Reminder</option>
                      <option>Payment Receipt</option>
                      <option>Announcement</option>
                      <option>General Reminder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Recipients *</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none focus:border-blue-600"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  >
                    <option>Select Patient(s)</option>
                    <option>All Patients</option>
                    <option>Today's Appointments</option>
                    <option>Pending Payments</option>
                    <option>Custom Selection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject/Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none focus:border-blue-600"
                    placeholder="Enter notification title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none focus:border-blue-600"
                    rows={4}
                    placeholder="Enter your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Available variables: {'{patient_name}'}, {'{appointment_date}'}, {'{doctor_name}'}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Preview:</strong> This notification will be sent via {formData.channel} to localized regional clusters.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Now
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-slate-850 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-850 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
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
