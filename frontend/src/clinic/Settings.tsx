import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { User, Bell, CreditCard, Database, HelpCircle, Save, Loader2, ArrowUpRight, FileText, Upload, Trash2, ExternalLink, Paperclip } from 'lucide-react';
import { clinicService } from '../services/clinicService';

interface SettingsProps {
  userRole: UserRole;
}

export function Settings({ userRole }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [ticketData, setTicketData] = useState({ type: 'Technical Issue', subject: '', description: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Clinic Registration');

  const fetchDocs = async () => {
    try {
      setDocsLoading(true);
      const docs = await clinicService.getClinicDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching clinic docs:', error);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocs();
    }
  }, [activeTab]);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return alert('Please select a file to upload');

    try {
      setUploadingDoc(true);
      await clinicService.uploadClinicDocument(docFile, docType);
      alert('Clinic document uploaded successfully!');
      setDocFile(null);
      fetchDocs();
    } catch (error) {
      console.error('Error uploading doc:', error);
      alert('Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await clinicService.deleteClinicDocument(id);
      alert('Document deleted successfully');
      fetchDocs();
    } catch (error) {
      console.error('Error deleting doc:', error);
      alert('Failed to delete document');
    }
  };


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await clinicService.getSettings();
        setSettings(data);
        
        // Also fetch profile for clinic_name etc.
        const profile = await clinicService.getProfile();
        if (profile) {
            setSettings((prev: any) => ({ 
                ...prev, 
                clinic_name: profile.clinic_name, 
                clinic_email: profile.email, 
                clinic_phone: profile.mobile 
            }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (updates: any) => {
    try {
      setSaving(true);
      await clinicService.updateSettings(updates);
      setSettings((prev: any) => ({ ...prev, ...updates }));
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    const stringValue = String(value);
    const oldValue = settings[key];
    
    // Optimistic update
    setSettings((prev: any) => ({ ...prev, [key]: stringValue }));
    
    try {
        const success = await clinicService.updateSettings({ [key]: stringValue });
        if (!success) throw new Error('Failed to update');
    } catch (error) {
        console.error('Error updating notification toggle:', error);
        // Rollback
        setSettings((prev: any) => ({ ...prev, [key]: oldValue }));
        alert('Failed to update preference. Please try again.');
    }
  };

  const handleTicketSubmit = async () => {
    if (!ticketData.subject.trim() || !ticketData.description.trim()) {
        alert('Please fill in both subject and description.');
        return;
    }

    try {
        setSubmittingTicket(true);
        const success = await clinicService.submitTicket(ticketData);
        if (success) {
            alert('Support ticket raised successfully! Our technical team will analyze the situation and contact you shortly.');
            setTicketData({ type: 'Technical Issue', subject: '', description: '' });
        } else {
            alert('Transmission failure: Could not reach support center.');
        }
    } catch (error) {
        console.error('Error submitting ticket:', error);
        alert('An error occurred while submitting the ticket.');
    } finally {
        setSubmittingTicket(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'documents', label: 'Verification Documents', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Gateway', icon: CreditCard, adminOnly: true },
    { id: 'backup', label: 'Data & Backup', icon: Database, adminOnly: true },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const accessibleTabs = tabs.filter(tab => !tab.adminOnly || userRole === 'clinic' || userRole === 'admin');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Configuring clinic environment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your preferences and configurations</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-4">
          <nav className="space-y-1">
            {accessibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-[#111625] rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Upload Verification Documents</h2>
                <form onSubmit={handleUploadDoc} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-1">Document Type *</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-950 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Clinic Registration">Clinic Registration</option>
                        <option value="Medical Council License">Medical Council License</option>
                        <option value="Tax Registration Certificate">Tax Registration Certificate</option>
                        <option value="Compliance Document">Compliance Document</option>
                        <option value="Other Certification">Other Certification</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-1">Select Document File *</label>
                      <div className="relative border border-dashed border-gray-300 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/20 cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-slate-400 truncate max-w-[200px]">
                          {docFile ? docFile.name : 'Choose file...'}
                        </span>
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={uploadingDoc || !docFile}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      {uploadingDoc ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploadingDoc ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-[#111625] rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Compliance Repository</h2>
                {docsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <FileText className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto" />
                    <p className="text-gray-500 dark:text-slate-400 text-sm">No verification documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="p-4 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-200 truncate">{doc.document_type}</h4>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors animate-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors animate-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={settings.clinic_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={settings.clinic_email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setSettings({ ...settings, clinic_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={settings.clinic_phone || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => setSettings({ ...settings, clinic_phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input type="text" value={String(userRole)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={async () => {
                    await handleSave(settings);
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <p className="text-sm text-gray-600 mb-6">Choose how you want to be notified</p>

                <div className="space-y-4">
                  {[
                    { key: 'notify_email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'notify_sms', label: 'SMS Notifications', desc: 'Get text message alerts' },
                    { key: 'notify_inapp', label: 'In-App Notifications', desc: 'Show notifications in the app' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer group">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key] === 'true'}
                          className="sr-only peer"
                          onChange={(e) => handleToggle(item.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (userRole === 'admin' || userRole === 'clinic') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Setup</h2>
                <p className="text-sm text-gray-600 mb-6">Configure your payment processing</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gateway Provider</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Razorpay</option>
                      <option>Paytm</option>
                      <option>PhonePe</option>
                      <option>Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input type="text" placeholder="Enter your API key" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                    <input type="password" placeholder="Enter your API secret" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="testMode" className="rounded" />
                    <label htmlFor="testMode" className="text-sm text-gray-700">Enable Test Mode</label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Status:</strong> Payment gateway is configured and active. Last transaction: 2 hours ago.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (userRole === 'admin' || userRole === 'clinic') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Backup & Restore</h2>
                <p className="text-sm text-gray-600 mb-6">Manage your clinic data backups</p>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-green-900">Automatic Backups</h3>
                        <p className="text-sm text-green-700">Daily backups are enabled</p>
                      </div>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-green-800">Last backup: Today at 3:00 AM</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                      <option>1 Year</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">Manual Backup</h3>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Create Backup Now
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Restore from Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h2>
                <p className="text-sm text-gray-600 mb-6">Get assistance and report issues</p>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Help Center</h3>
                    <p className="text-sm text-blue-800 mb-3">Browse our documentation and FAQs</p>
                    <a 
                      href="/features" 
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, this would navigate to a dedicated help section
                        // For now we'll show a friendly message
                        alert('I Health Clinic Help Center: Documentation is being updated for the latest version. Please contact support@ihealthclinic.com for immediate assistance.');
                      }}
                      className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                    >
                        Visit Help Center <ArrowUpRight className="w-5 h-5" />
                    </a>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                    <p className="text-sm text-gray-600 mb-1">Email: support@ihealthclinic.com</p>
                    <p className="text-sm text-gray-600 mb-1">Phone: +91 1800 123 4567</p>
                    <p className="text-sm text-gray-600">Response time: Within 24 hours</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Raise Support Ticket</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={ticketData.type}
                          onChange={(e) => setTicketData({ ...ticketData, type: e.target.value })}
                        >
                          <option>Technical Issue</option>
                          <option>Billing Question</option>
                          <option>Feature Request</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                          placeholder="What would you like assistance with?"
                          value={ticketData.subject}
                          onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                          rows={4}
                          placeholder="Provide as much detail as possible..."
                          value={ticketData.description}
                          onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                        ></textarea>
                      </div>
                      <button 
                        onClick={handleTicketSubmit}
                        disabled={submittingTicket}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Submit Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
