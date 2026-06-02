import { useEffect, useState } from 'react';
import { 
    Lock, 
    Bell, 
    FileText, 
    ShieldCheck, 
    Building2, 
    Globe, 
    MapPin, 
    Save, 
    ShieldAlert, 
    Upload,
    ChevronRight,
    BadgeCheck,
    FlaskConical,
    Clock,
    Tag,
    Trash2,
    ExternalLink,
    Paperclip,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Label } from '../../common/ui/label';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/ui/tabs';
import labService from '../../services/labService';
import { authService } from '../../services/authService';

export function LabSettings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: '',
        email: '',
        establishment_year: '',
        license_number: '',
        registration_number: '',
        gst_number: '',
        certification: '',
        address: {
            address: '',
            city: '',
            state: '',
            pin_code: ''
        }
    });
    const [scheduling, setScheduling] = useState<any>({
        workingHours: [],
        holidays: [],
        slots: []
    });
    const [catalog, setCatalog] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [changingPassword, setChangingPassword] = useState(false);

    const [documents, setDocuments] = useState<any[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('NABL Accreditation');

    const fetchDocs = async () => {
        try {
            setDocsLoading(true);
            const res = await labService.getLabDocuments();
            if (res.success) {
                setDocuments(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching lab documents:', err);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docFile) return alert('Please select a file to upload');

        try {
            setUploadingDoc(true);
            const res = await labService.uploadLabDocument(docFile, docType);
            if (res.success) {
                alert('Document uploaded successfully!');
                setDocFile(null);
                fetchDocs();
            } else {
                alert(res.message || 'Failed to upload document.');
            }
        } catch (error: any) {
            console.error('Error uploading doc:', error);
            alert(error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDoc = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            const res = await labService.deleteLabDocument(id);
            if (res.success) {
                alert('Document deleted successfully');
                fetchDocs();
            } else {
                alert(res.message || 'Failed to delete document');
            }
        } catch (error: any) {
            console.error('Error deleting doc:', error);
            alert(error.response?.data?.message || 'Failed to delete document');
        }
    };

    useEffect(() => {
        if (activeTab === 'trust') {
            fetchDocs();
        }
    }, [activeTab]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setChangingPassword(true);
        setPasswordMessage(null);
        try {
            const res = await authService.changePassword(currentPassword, newPassword);
            if (res.success) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: res.message || 'Failed to update password.' });
            }
        } catch (err: any) {
            console.error('Password change error:', err);
            setPasswordMessage({ type: 'error', text: err.message || 'Incorrect current password or server failure.' });
        } finally {
            setChangingPassword(false);
        }
    };

    useEffect(() => {
        async function fetchSettingsData() {
            try {
                setLoading(true);
                const [profileRes, schedulingRes, catalogRes] = await Promise.all([
                    labService.getProfile(),
                    labService.getScheduling(),
                    labService.getInventory()
                ]);

                if (profileRes.success && profileRes.data) {
                    setProfile({
                        name: profileRes.data.name || '',
                        email: profileRes.data.email || '',
                        establishment_year: profileRes.data.establishment_year || '',
                        license_number: profileRes.data.license_number || '',
                        registration_number: profileRes.data.registration_number || '',
                        gst_number: profileRes.data.gst_number || '',
                        certification: profileRes.data.certification || '',
                        address: {
                            address: profileRes.data.address?.address || '',
                            city: profileRes.data.address?.city || '',
                            state: profileRes.data.address?.state || '',
                            pin_code: profileRes.data.address?.pin_code || ''
                        }
                    });
                }

                if (schedulingRes.success && schedulingRes.data) {
                    setScheduling(schedulingRes.data);
                }

                if (catalogRes.success && catalogRes.data) {
                    setCatalog(catalogRes.data);
                }
            } catch (err: any) {
                console.error('Error fetching settings:', err);
                setMessage({ type: 'error', text: 'Failed to load settings data.' });
            } finally {
                setLoading(false);
            }
        }

        fetchSettingsData();
    }, []);

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setMessage(null);
            const response = await labService.updateProfile(profile);
            if (response.success) {
                setMessage({ type: 'success', text: 'Facility profile updated successfully.' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to update profile.' });
            }
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error occurred while saving profile.' });
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { id: 'profile', icon: Building2, label: 'Facility Profile' },
        { id: 'security', icon: Lock, label: 'Cyber Protection' },
        { id: 'logic', icon: Bell, label: 'System Logic' },
        { id: 'trust', icon: FileText, label: 'Diagnostic Trust' },
        { id: 'sync', icon: Globe, label: 'Partner Sync' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Facility Configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1 shadow-sm">Facility Control Center</h1>
                    <p className="text-gray-500 dark:text-slate-400 font-bold italic text-xs uppercase tracking-widest leading-none">Global laboratory configuration, security auditing, and verification status</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 dark:shadow-none flex items-center gap-2 h-11 px-8 rounded-2xl transform transition-transform active:scale-95 font-black uppercase text-[10px] tracking-widest leading-none border-4 border-blue-500/20">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Finalize Global Logic'}
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl font-bold uppercase text-[10px] tracking-wider ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 pt-4">
                {/* Left Navigation Card */}
                <Card className="lg:w-80 shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 shrink-0 group border-b-8 border-b-white dark:border-b-slate-900 hover:border-b-blue-600 dark:hover:border-b-blue-600 transition-all">
                     <CardHeader className="bg-gray-900 dark:bg-slate-950 p-8 pb-10 grow-0 flex flex-col items-center">
                          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900 border-4 border-white dark:border-slate-800 transform -rotate-6 mb-4 group-hover:rotate-0 transition-transform">
                              <FlaskConical className="w-10 h-10 shadow-inner" />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter shadow-sm mb-1">E-Labs Global</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <div className="p-1 px-2.5 bg-blue-600/20 rounded-full border border-blue-600/30">
                                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-1"><BadgeCheck className="w-2.5 h-2.5" /> High Security</p>
                              </div>
                          </div>
                     </CardHeader>
                     <CardContent className="p-4 bg-white dark:bg-slate-900 grow flex flex-col gap-2 pt-8">
                          {navItems.map((item) => (
                              <button 
                                  key={item.id} 
                                  onClick={() => setActiveTab(item.id)}
                                  className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group/btn ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 shadow-inner' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                                      <span className="font-black uppercase tracking-widest text-[10px] italic">{item.label}</span>
                                  </div>
                                  {activeTab === item.id && <ChevronRight className="w-4 h-4 animate-pulse" />}
                              </button>
                          ))}
                     </CardContent>
                     <CardFooter className="p-6 bg-gray-50 dark:bg-slate-950/50 flex items-center justify-center">
                          <p className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest italic flex items-center gap-1 pointer-events-none transition-colors group-hover:text-blue-600"><ShieldCheck className="w-3.5 h-3.5" /> Ver. 2.4.5.0-LCA</p>
                     </CardFooter>
                </Card>

                {/* Main Settings Content */}
                <Card className="flex-1 shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 group border-t-8 border-t-white dark:border-t-slate-900 hover:border-t-blue-600 dark:hover:border-t-blue-600 transition-all p-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                        <TabsList className="bg-white dark:bg-slate-900 p-8 pb-4 h-fit flex items-center justify-start gap-12 rounded-none border-b dark:border-slate-800 shadow-none cursor-pointer overflow-x-auto custom-scrollbar">
                            <TabsTrigger value="profile" className="px-0 py-2 shrink-0 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                Global Profile Control
                            </TabsTrigger>
                            <TabsTrigger value="security" className="px-0 py-2 shrink-0 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                Identity & Access
                            </TabsTrigger>
                            <TabsTrigger value="logic" className="px-0 py-2 shrink-0 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                System Logic
                            </TabsTrigger>
                            <TabsTrigger value="trust" className="px-0 py-2 shrink-0 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                Diagnostic Trust
                            </TabsTrigger>
                            <TabsTrigger value="sync" className="px-0 py-2 shrink-0 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                                Partner Sync
                            </TabsTrigger>
                        </TabsList>

                        <div className="p-10 flex-1 overflow-y-auto">
                            <TabsContent value="profile" className="mt-0 space-y-10 animate-in fade-in duration-700">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     <div className="space-y-6">
                                         <div className="flex items-center gap-10">
                                             <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-slate-600 relative group/photo cursor-pointer shadow-inner overflow-hidden border dark:border-slate-700">
                                                 <Building2 className="w-10 h-10" />
                                                 <div className="absolute inset-0 bg-blue-600/90 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity flex-col">
                                                     <Upload className="w-6 h-6 text-white" />
                                                     <p className="text-[8px] font-black text-white uppercase mt-1">Update</p>
                                                 </div>
                                             </div>
                                             <div className="flex-1">
                                                 <h4 className="font-black text-xl italic uppercase text-gray-900 dark:text-white tracking-tight leading-none mb-1">Facility Identity</h4>
                                                 <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic mb-2">Public diagnostic institution metadata</p>
                                                 <Badge className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30 border uppercase font-black text-[9px] px-3">Fully Verified</Badge>
                                             </div>
                                         </div>

                                         <div className="grid gap-5">
                                             <div className="space-y-2">
                                                 <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">Facility Nomenclature</Label>
                                                 <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 focus-visible:ring-blue-600 shadow-sm" />
                                             </div>
                                             <div className="space-y-2">
                                                 <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">Global Communication Logic</Label>
                                                 <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 focus-visible:ring-blue-600 shadow-sm" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">Establishment Epoch</Label>
                                                     <Input value={profile.establishment_year} onChange={(e) => setProfile({ ...profile, establishment_year: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">Medical License Key</Label>
                                                     <Input value={profile.license_number} onChange={(e) => setProfile({ ...profile, license_number: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm" />
                                                 </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">GSTIN / Registration</Label>
                                                     <Input value={profile.gst_number} onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest flex">Govt Reg Number</Label>
                                                     <Input value={profile.registration_number} onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm" />
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="space-y-10">
                                         <div className="p-8 bg-gray-50/50 dark:bg-slate-800/40 rounded-3xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all relative overflow-hidden group/alert cursor-help active:scale-95">
                                             <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover/alert:scale-125 transition-transform group-hover/alert:rotate-12 group-hover/alert:text-orange-600"><ShieldAlert className="w-20 h-20" /></div>
                                             <h4 className="font-black text-lg italic text-orange-600 dark:text-orange-400 uppercase tracking-tighter mb-2 flex items-center gap-2 grow-0"><ShieldCheck className="w-5 h-5" /> Security System Alert</h4>
                                             <p className="text-gray-500 dark:text-slate-400 font-bold italic text-xs leading-relaxed uppercase tracking-tight">Updating your core facility nomenclature requires secondary blockchain validation. This action will be audited by the regional medical council.</p>
                                             <Button variant="outline" className="mt-4 border-orange-200 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-950 hover:bg-orange-50 dark:hover:bg-slate-900 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-sm">Request Authorization</Button>
                                         </div>

                                         <div className="space-y-6">
                                              <h4 className="font-black text-xs uppercase tracking-widest italic text-gray-400 dark:text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Facility Physical Coordinates</h4>
                                              <div className="grid gap-4">
                                                   <div className="space-y-2">
                                                       <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Global Address Archive</Label>
                                                       <Input value={profile.address?.address} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, address: e.target.value } })} className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm" />
                                                   </div>
                                                   <div className="grid grid-cols-3 gap-4">
                                                       <Input value={profile.address?.city} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })} placeholder="City" className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm col-span-1" />
                                                       <Input value={profile.address?.state} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })} placeholder="State" className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm col-span-1" />
                                                       <Input value={profile.address?.pin_code} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, pin_code: e.target.value } })} placeholder="Pincode" className="h-12 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 italic font-black text-gray-800 dark:text-slate-100 shadow-sm col-span-1" />
                                                   </div>
                                              </div>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Operating Hours and Test Catalog Summary */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t dark:border-slate-800">
                                     <div className="space-y-4">
                                         <h4 className="font-black text-sm uppercase tracking-widest italic text-gray-900 dark:text-white flex items-center gap-2">
                                             <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Facility Operating Hours
                                         </h4>
                                         <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border dark:border-slate-800 space-y-3">
                                             {scheduling.workingHours && scheduling.workingHours.length > 0 ? (
                                                 scheduling.workingHours.map((wh: any, idx: number) => (
                                                     <div key={idx} className="flex justify-between items-center text-xs">
                                                         <span className="font-bold text-gray-700 dark:text-slate-300">{wh.day}</span>
                                                         {wh.isOpen ? (
                                                             <span className="font-mono text-gray-500 dark:text-slate-400">{wh.openTime} - {wh.closeTime}</span>
                                                         ) : (
                                                             <Badge className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 uppercase text-[9px] scale-90 font-black">Closed</Badge>
                                                         )}
                                                     </div>
                                                 ))
                                             ) : (
                                                 <p className="text-xs italic text-gray-400">No working hours configured.</p>
                                             )}
                                         </div>
                                     </div>

                                     <div className="space-y-4">
                                         <h4 className="font-black text-sm uppercase tracking-widest italic text-gray-900 dark:text-white flex items-center gap-2">
                                             <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Laboratory Services Catalog ({catalog.length})
                                         </h4>
                                         <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border dark:border-slate-800 max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                                             {catalog.length > 0 ? (
                                                 catalog.map((test: any, idx: number) => (
                                                     <div key={idx} className="flex justify-between items-center text-xs p-2 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all">
                                                         <div className="flex flex-col">
                                                             <span className="font-black text-gray-800 dark:text-slate-200 uppercase">{test.test_name}</span>
                                                             <span className="text-[9px] text-gray-400 uppercase tracking-widest">{test.department || 'Diagnostics'}</span>
                                                         </div>
                                                         <span className="font-mono font-bold text-blue-600 dark:text-blue-400">₹{test.price}</span>
                                                     </div>
                                                 ))
                                             ) : (
                                                 <p className="text-xs italic text-gray-400">Test catalog is currently empty.</p>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                            </TabsContent>
                                                       <TabsContent value="security" className="mt-0 animate-in slide-in-from-right duration-700">
                                 <form onSubmit={handleChangePassword} className="max-w-md mx-auto space-y-10 py-10">
                                     <div className="text-center space-y-2">
                                          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto border-4 border-white dark:border-slate-800 shadow-xl shadow-orange-100 dark:shadow-none mb-4 animate-bounce duration-1000"><Lock className="w-10 h-10" /></div>
                                          <h4 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white tracking-tighter shadow-sm mb-1">Authorization Matrix Control</h4>
                                          <p className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest italic leading-none transition-colors hover:text-orange-600 cursor-cell">Identity verification and credential rotation</p>
                                     </div>

                                     {passwordMessage && (
                                         <div className={`p-4 rounded-2xl font-bold uppercase text-[10px] tracking-wider ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                                             {passwordMessage.text}
                                         </div>
                                     )}
                                     
                                     <div className="space-y-6 bg-gray-50/50 dark:bg-slate-950 p-10 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-orange-500/20 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl">
                                         <div className="space-y-2">
                                             <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic flex items-center gap-1"><Lock className="w-3 h-3" /> Current Password</Label>
                                             <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••••••" className="h-14 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-extrabold text-lg text-black dark:text-white focus-visible:ring-orange-500 shadow-inner" />
                                         </div>
                                         <div className="space-y-2">
                                             <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic flex items-center gap-1"><Lock className="w-3 h-3" /> New Password</Label>
                                             <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••••••" className="h-14 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-extrabold text-lg text-black dark:text-white focus-visible:ring-orange-500" />
                                         </div>
                                         <div className="space-y-2">
                                             <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic flex items-center gap-1"><Lock className="w-3 h-3" /> Confirm New Password</Label>
                                             <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className="h-14 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-extrabold text-lg text-black dark:text-white focus-visible:ring-orange-500" />
                                         </div>
                                         <Button type="submit" disabled={changingPassword} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-xl shadow-orange-100 dark:shadow-none transform active:scale-95 transition-all mt-4 leading-none border-4 border-orange-500/30">
                                             {changingPassword ? 'Rotating Credentials...' : 'Rotate Authorization Tokens'}
                                         </Button>
                                     </div>
                                     
                                     <div className="p-8 border-2 border-dashed dark:border-slate-800 rounded-3xl flex items-center gap-6 cursor-not-allowed opacity-40 group/mfa grayscale hover:grayscale-0 transition-all">
                                         <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 grow-0 shrink-0"><ShieldCheck className="w-10 h-10" /></div>
                                         <div className="text-left">
                                             <h4 className="font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-1">Biometric / MFA Shield</h4>
                                             <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest italic leading-tight">Advanced authentication layer is currently restricted to Lab Admins only.</p>
                                         </div>
                                     </div>
                                 </form>
                            </TabsContent>

                            <TabsContent value="logic" className="mt-0 space-y-8 animate-in fade-in duration-700">
                                <div className="text-left space-y-2 mb-6">
                                    <h4 className="text-xl font-black italic uppercase text-gray-900 dark:text-white tracking-tight">Laboratory Routing & Automation Logic</h4>
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">Configure algorithmic rules for dispatching, alerts, and processing</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6 bg-gray-50/50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400">Dispatch & SLA Rules</h5>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase">Auto-Assign Field Technicians</p>
                                                    <p className="text-[10px] text-gray-450 dark:text-slate-400">Assign collections to nearest staff automatically</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all checked:after:translate-x-4 shrink-0" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">SLA Processing Threshold (Hours)</Label>
                                                <Input type="number" defaultValue="12" className="h-10 rounded-xl dark:bg-slate-905 dark:border-slate-800 dark:text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-gray-50/50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400">Critical Patient Alert Boundaries</h5>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase">Emergency Doctor SMS Dispatch</p>
                                                    <p className="text-[10px] text-gray-455 dark:text-slate-400">Broadcast immediate SMS for critical test boundaries</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all checked:after:translate-x-4 shrink-0" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase">Auto-include Signatures on PDF Reports</p>
                                                    <p className="text-[10px] text-gray-455 dark:text-slate-400">Inject digital stamps and verifying physician signature</p>
                                                </div>
                                                <input type="checkbox" defaultChecked className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all checked:after:translate-x-4 shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="trust" className="mt-0 space-y-8 animate-in fade-in duration-700">
                                <div className="text-left space-y-2 mb-6">
                                    <h4 className="text-xl font-black italic uppercase text-gray-900 dark:text-white tracking-tight">Accreditations, Compliance & QA Audit</h4>
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">Manage medical certificates, certifications, and verification keys</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { cert: 'NABL ISO 15189', desc: 'National Accreditation Board for Labs', validity: 'Until Dec 2028', status: 'Active' },
                                        { cert: 'CAP Accreditation', desc: 'College of American Pathologists QC', validity: 'Until Jul 2027', status: 'Active' },
                                        { cert: 'Govt Diagnostic License', desc: 'Regional Council Health Certification', validity: 'Until Jan 2030', status: 'Active' }
                                    ].map((c, idx) => (
                                        <div key={idx} className="p-6 bg-gray-50 dark:bg-slate-950 border dark:border-slate-800 rounded-3xl text-left relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 transform group-hover:scale-110 transition-transform"><ShieldCheck className="w-16 h-16 text-blue-600 dark:text-blue-400" /></div>
                                            <h5 className="font-black text-sm uppercase italic text-gray-800 dark:text-slate-200 mb-1">{c.cert}</h5>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 leading-normal">{c.desc}</p>
                                            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
                                                <span className="text-gray-400 dark:text-slate-500">{c.validity}</span>
                                                <Badge className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 font-black px-2 py-0.5">Verified</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800 text-left space-y-4">
                                    <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400">Laboratory Quality Assurance Auditing Log</h5>
                                    <div className="space-y-3">
                                        {[
                                            { date: '2026-05-20', type: 'External QC Audit', result: '99.92% Precision Score', remark: 'Passed within normal bounds' },
                                            { date: '2026-04-12', type: 'Internal Blind Sample Run', result: '100% Correlation Score', remark: 'Verified by Pathologist Director' }
                                        ].map((log, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-3 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-2xl transition-all">
                                                <div className="text-left">
                                                    <span className="font-black text-gray-800 dark:text-slate-200 uppercase">{log.type}</span>
                                                    <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">{log.remark}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-green-600 dark:text-green-400">{log.result}</span>
                                                    <p className="text-[9px] text-gray-450 dark:text-slate-500">{log.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Upload form */}
                                    <div className="bg-gray-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800 text-left space-y-6">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Upload Verification Documents
                                        </h5>
                                        <form onSubmit={handleUploadDoc} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Document Classification</label>
                                                <select
                                                    value={docType}
                                                    onChange={(e) => setDocType(e.target.value)}
                                                    className="w-full h-11 px-3 rounded-xl border dark:border-slate-800 dark:border-slate-850 bg-white dark:bg-slate-900 text-xs font-bold text-gray-800 dark:text-slate-200 outline-none focus:border-blue-600"
                                                >
                                                    <option value="NABL Accreditation">NABL Accreditation</option>
                                                    <option value="ISO Certificate">ISO Certificate</option>
                                                    <option value="Govt License Certificate">Govt License Certificate</option>
                                                    <option value="Diagnostic Lab Registration">Diagnostic Lab Registration</option>
                                                    <option value="QA Audit Certification">QA Audit Certification</option>
                                                    <option value="Other Compliance File">Other Compliance File</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Select Scanned Copy / PDF</label>
                                                <div className="relative group border border-dashed border-slate-350 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-all p-3 flex items-center justify-between cursor-pointer">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Paperclip className="w-4 h-4 text-slate-450 dark:text-slate-500" />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                            {docFile ? docFile.name : 'Select file...'}
                                                        </span>
                                                    </div>
                                                    <Upload className="w-4 h-4 text-slate-450 dark:text-slate-500" />
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={uploadingDoc || !docFile}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-11 rounded-xl shadow-xl shadow-blue-100 dark:shadow-none transform active:scale-95 transition-all mt-4 leading-none border-4 border-blue-500/20"
                                            >
                                                {uploadingDoc ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Uploading Compliance File...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-3.5 h-3.5 mr-2" /> Upload Document
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </div>

                                    {/* Uploaded documents list */}
                                    <div className="bg-gray-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800 text-left space-y-4">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Lab Credentials Repository
                                        </h5>
                                        <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                                            {docsLoading ? (
                                                <div className="flex justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                                </div>
                                            ) : documents.length === 0 ? (
                                                <div className="text-center py-8 space-y-2">
                                                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
                                                    <p className="text-xs italic text-gray-400 uppercase tracking-wider">No compliance documents uploaded yet.</p>
                                                </div>
                                            ) : (
                                                documents.map((doc: any) => (
                                                    <div key={doc.id} className="flex justify-between items-center text-xs p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 dark:border-slate-850 rounded-2xl transition-all shadow-sm">
                                                        <div className="text-left overflow-hidden mr-2">
                                                            <span className="font-black text-gray-800 dark:text-slate-200 uppercase truncate block text-[11px] leading-tight">{doc.document_type}</span>
                                                            <p className="text-[9px] text-gray-450 dark:text-slate-500 uppercase mt-0.5">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <a
                                                                href={doc.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-450 rounded-lg border dark:border-slate-800 transition-colors"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                            <button
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                                className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg border dark:border-slate-800 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="sync" className="mt-0 space-y-8 animate-in fade-in duration-700">
                                <div className="text-left space-y-2 mb-6">
                                    <h4 className="text-xl font-black italic uppercase text-gray-900 dark:text-white tracking-tight">Connected Hospital & Clinic Partners</h4>
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">Control webhook routing and pricing catalogs sync options</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6 bg-gray-50/50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400">Secure API Credentials</h5>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Laboratory API Connection Key</Label>
                                                <div className="flex gap-2">
                                                    <Input type="password" value="abcdef1234567890labsecretkeycredentials" readOnly className="h-10 rounded-xl flex-1 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono text-xs" />
                                                    <Button type="button" variant="outline" className="h-10 rounded-xl font-black text-[9px] uppercase tracking-wider dark:text-white dark:border-slate-800">Regenerate</Button>
                                                </div>
                                                <p className="text-[8px] text-gray-400 dark:text-slate-550 uppercase">Share this API key with partner clinics to allow automatic booking injections.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-gray-50/50 dark:bg-slate-950 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                        <h5 className="font-black text-xs uppercase tracking-widest italic text-blue-600 dark:text-blue-400">Catalog Synchronization</h5>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase">Automatic Price Matching</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-slate-500">Instantly mirror reference lab rates regional guidelines</p>
                                                </div>
                                                <input type="checkbox" className="w-10 h-6 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all checked:after:translate-x-4 shrink-0" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Auto-Sync Frequency</Label>
                                                <select className="h-10 w-full rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-gray-800 dark:text-slate-200 px-3 outline-none">
                                                    <option>Real-Time Push</option>
                                                    <option>Daily Batch Sync</option>
                                                    <option>Weekly Reference Sync</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
