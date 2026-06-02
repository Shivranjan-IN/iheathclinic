import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    ShieldCheck, 
    Activity, 
    Mail, 
    Phone, 
    BadgeCheck, 
    Search,
    Trash2,
    Briefcase,
    Globe,
    Lock,
    ChevronRight,
    ArrowUpRight,
    Star,
    Edit2,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '../../common/ui/dialog';
import { Label } from '../../common/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../../common/ui/select';
import { ScrollArea } from '../../common/ui/scroll-area';
import labService from '../../services/labService';

export function StaffManagement() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shifts, setShifts] = useState<any[]>([]);
    
    // Onboard State
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);
    const [onboardData, setOnboardData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'Technician',
        department: 'Diagnostics',
        security_level: 1
    });

    // Shifts State
    const [isShiftsOpen, setIsShiftsOpen] = useState(false);
    const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
    const [shiftData, setShiftData] = useState({
        staff_id: '',
        shift_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        status: 'Upcoming'
    });



    const [filters, setFilters] = useState({
        sortBy: 'name',
        role: '',
        status: ''
    });

    useEffect(() => {
        fetchStaff();
        fetchShifts();
    }, [filters]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await labService.getStaff(filters);
            if (res.success) setStaff(res.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShifts = async () => {
        try {
            const res = await labService.getShifts();
            if (res.success) setShifts(res.data);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        }
    };

    const handleOnboardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await labService.onboardStaff(onboardData);
            if (res.success) {
                setIsOnboardOpen(false);
                fetchStaff();
                setOnboardData({ full_name: '', email: '', phone: '', role: 'Technician', department: 'Diagnostics', security_level: 1 });
                alert('Staff onboarded successfully!');
            }
        } catch (error) {
            console.error('Error onboarding staff:', error);
            alert('Failed to onboard staff');
        }
    };

    const handleAddShift = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await labService.createShift(shiftData);
            if (res.success) {
                setIsAddShiftOpen(false);
                fetchShifts();
                alert('Shift scheduled successfully!');
            }
        } catch (error) {
            console.error('Error adding shift:', error);
            alert('Failed to add shift');
        }
    };

    const filteredStaff = staff.filter(s => 
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-1">Employee Management</h1>
                    <p className="text-gray-500 font-bold italic text-xs uppercase tracking-widest leading-none">Manage technical shifts, security clearances, and operational staff roles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsShiftsOpen(true)}
                        className="flex items-center gap-2 h-11 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 transition-all shadow-blue-50 border active:scale-95 leading-none"
                    >
                        <Lock className="w-4 h-4" /> Shift Logs
                    </Button>
                    <Button 
                        onClick={() => setIsOnboardOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 flex items-center gap-2 h-11 px-8 rounded-2xl transform transition-transform active:scale-95 font-black uppercase text-[10px] tracking-widest leading-none border-4 border-blue-500/20"
                    >
                        <UserPlus className="w-4 h-4" /> Onboard Talent
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {[
                    { label: 'Active Roster', value: filteredStaff.length, icon: Users, color: 'blue', change: 'Total Employees' },
                    { label: 'On Shift Now', value: filteredStaff.filter(s => s.is_active).length, icon: Activity, color: 'green', change: 'Current Presence' },
                    { label: 'Leave Requests', value: 0, icon: Globe, color: 'orange', change: 'Pending Approval' },
                    { label: 'System Admins', value: filteredStaff.filter(s => s.role === 'Admin').length, icon: ShieldCheck, color: 'purple', change: 'Restricted Access' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-2xl transition-all group overflow-hidden border-none shadow-xl rounded-3xl">
                        <CardContent className="p-6 flex items-center justify-between relative h-28">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-x-4 translate-y-4 -z-10 group-hover:scale-110 transition-transform" />
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black text-gray-900 italic transform transition-transform group-hover:scale-110 origin-left">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-blue-500" /> {stat.change}</p>
                             </div>
                             <div className={`w-14 h-14 rounded-3xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 grow-0 shrink-0 transform rotate-0 group-hover:-rotate-12 transition-transform shadow-xl shadow-${stat.color}-100/50`}>
                                 <stat.icon className="w-7 h-7" />
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white mt-8 group border-t-8 border-t-white hover:border-t-blue-600 transition-all">
                <CardHeader className="flex flex-col lg:flex-row items-center justify-between p-8 pb-4 border-none gap-6">
                     <div className="flex items-center gap-3">
                         <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-2xl shadow-gray-400 group-hover:scale-110 transition-transform"><Briefcase className="w-6 h-6" /></div>
                         <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Verified Professionals</CardTitle>
                     </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                             <Select value={filters.sortBy} onValueChange={(v) => setFilters({...filters, sortBy: v})}>
                                 <SelectTrigger className="h-10 border-none bg-transparent font-black text-[10px] uppercase tracking-widest w-[180px] shadow-none">
                                     <span className="text-gray-400 mr-2">SORT BY:</span>
                                     <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="bg-white border-none shadow-2xl font-black uppercase text-[10px] rounded-2xl">
                                     <SelectItem value="name">Personnel Name</SelectItem>
                                     <SelectItem value="role">Occupational Role</SelectItem>
                                     <SelectItem value="status">Active Status</SelectItem>
                                     <SelectItem value="clearance">Security Level</SelectItem>
                                 </SelectContent>
                             </Select>
                             <div className="w-[1px] h-6 bg-gray-200" />
                             <Select value={filters.role} onValueChange={(v) => setFilters({...filters, role: v === 'all' ? '' : v})}>
                                 <SelectTrigger className="h-10 border-none bg-transparent font-black text-[10px] uppercase tracking-widest w-[150px] shadow-none">
                                     <span className="text-gray-400 mr-2">ROLE:</span>
                                     <SelectValue placeholder="All" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-white border-none shadow-2xl font-black uppercase text-[10px] rounded-2xl">
                                     <SelectItem value="all">All Sectors</SelectItem>
                                     <SelectItem value="Technician">Technician</SelectItem>
                                     <SelectItem value="Analyst">Analyst</SelectItem>
                                     <SelectItem value="Security">Security</SelectItem>
                                     <SelectItem value="Admin">Admin</SelectItem>
                                 </SelectContent>
                             </Select>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 font-black" />
                            <Input 
                                placeholder="Search DB..." 
                                className="pl-12 h-12 text-sm font-bold uppercase border-none bg-gray-50 rounded-2xl shadow-inner focus-visible:ring-blue-600" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                      </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-left">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredStaff.length > 0 ? (
                            <table className="w-full text-sm text-left px-8">
                                <thead className="bg-gray-50/50 text-gray-400 font-black border-b uppercase tracking-widest text-[10px] italic">
                                    <tr>
                                        <th className="px-10 py-5">Profile Archive</th>
                                        <th className="px-6 py-5">Role Designation</th>
                                        <th className="px-6 py-5">Contact Details</th>
                                        <th className="px-6 py-5">Recent Presence</th>
                                        <th className="px-6 py-5 text-center">Status Power</th>
                                        <th className="px-6 py-5">Security Level</th>
                                        <th className="px-10 py-5 text-right">Records</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 pb-8 text-left">
                                    {filteredStaff.map((person) => (
                                        <tr key={person.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group/row relative">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center text-gray-300 font-black text-2xl shadow-inner shrink-0 group-hover/row:scale-110 transition-transform border uppercase">
                                                        {person.full_name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-lg text-gray-900 leading-tight uppercase italic group-hover/row:text-blue-600 transition-colors truncate">{person.full_name}</h3>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 group-hover/row:text-gray-500"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> ID: {person.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <Badge variant="outline" className="border-gray-200 text-gray-900 font-black uppercase tracking-widest text-[10px] px-3 py-1 italic bg-white shadow-sm group-hover/row:border-blue-300 group-hover/row:text-blue-600 transition-colors">{person.role || 'Staff'}</Badge>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-gray-500 space-y-1">
                                                <p className="flex items-center gap-2 text-xs leading-none group-hover/row:text-gray-900 transition-colors"><Mail className="w-3.5 h-3.5 text-blue-500" /> {person.email || 'N/A'}</p>
                                                <p className="flex items-center gap-2 text-xs leading-none group-hover/row:text-gray-900 transition-colors"><Phone className="w-3.5 h-3.5 text-blue-500" /> {person.phone || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-6 text-left">
                                                <p className="text-xs font-black text-gray-900 italic transform transition-transform group-hover/row:scale-110 origin-left">{new Date(person.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1 leading-none mt-1"><Search className="w-3 h-3" /> Historical Logs</p>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex justify-center group/badge">
                                                    <Badge className={`uppercase font-black text-[9px] tracking-widest px-4 py-1.5 rounded-full shadow-lg transition-all ${
                                                        person.is_active ? 'bg-green-100 text-green-700 border-green-200 border group-hover/row:bg-green-600 group-hover/row:text-white group-hover/row:border-green-600 shadow-green-100' : 'bg-red-100 text-red-700 border-red-200 border group-hover/row:bg-red-600 group-hover/row:text-white group-hover/row:border-red-600 shadow-red-100'
                                                    }`}>
                                                        {person.is_active ? 'active' : 'inactive'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1 items-start">
                                                     <div className="flex gap-1">
                                                         {[1, 2, 3].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= (person.security_level || 1) ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
                                                     </div>
                                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Level {person.security_level || 1} Clear</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                    <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-blue-100 text-blue-600 hover:shadow-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-red-100 text-red-600 hover:shadow-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    <button className="p-3 hover:bg-blue-600 rounded-2xl text-gray-300 hover:text-white transition-all shadow-none hover:shadow-2xl"><ChevronRight className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20 bg-gray-50/50">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 italic">No staff found in records</h3>
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="p-8 bg-gray-50 border-t flex justify-end">
                    <Button 
                        variant="ghost" 
                        onClick={() => alert("Loading full staff directory...")}
                        className="text-blue-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-blue-100 transition-colors group/btn"
                    >
                        View Full Staff Directory <ArrowUpRight className="w-5 h-5 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Button>
                </div>
            </Card>

            {/* Onboard Talent Modal */}
            <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] border-none shadow-2xl p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Onboard New Talent</DialogTitle>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 uppercase">Establish new personnel record in the laboratory database</p>
                    </DialogHeader>
                    <form onSubmit={handleOnboardSubmit} className="space-y-6 mt-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</Label>
                                <Input 
                                    required
                                    className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-bold uppercase placeholder:text-gray-300"
                                    placeholder="Enter employee full name"
                                    value={onboardData.full_name}
                                    onChange={e => setOnboardData({...onboardData, full_name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</Label>
                                <Input 
                                    type="email"
                                    className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-bold uppercase placeholder:text-gray-300"
                                    placeholder="Enter corporate email"
                                    value={onboardData.email}
                                    onChange={e => setOnboardData({...onboardData, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Connection</Label>
                                <Input 
                                    className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-bold uppercase placeholder:text-gray-300"
                                    placeholder="Enter contact number"
                                    value={onboardData.phone}
                                    onChange={e => setOnboardData({...onboardData, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Designated Role</Label>
                                <Select onValueChange={v => setOnboardData({...onboardData, role: v})} defaultValue={onboardData.role}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-black uppercase">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white rounded-2xl border-none shadow-2xl font-bold uppercase">
                                        <SelectItem value="Technician">Technician</SelectItem>
                                        <SelectItem value="Analyst">Analyst</SelectItem>
                                        <SelectItem value="Security">Security</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Researcher">Researcher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Clearance</Label>
                                <Select value={onboardData.security_level.toString()} onValueChange={v => setOnboardData({...onboardData, security_level: parseInt(v)})}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner font-black uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white rounded-2xl border-none shadow-2xl font-bold uppercase">
                                        <SelectItem value="1">Level 1 - General</SelectItem>
                                        <SelectItem value="2">Level 2 - Specialized</SelectItem>
                                        <SelectItem value="3">Level 3 - Restricted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="mt-8">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsOnboardOpen(false)}
                                className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="h-14 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-blue-100"
                            >
                                Confirm Onboarding
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Shift Logs Modal */}
            <Dialog open={isShiftsOpen} onOpenChange={setIsShiftsOpen}>
                <DialogContent className="max-w-4xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gray-900 p-10 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Security Shift Logs</DialogTitle>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 uppercase">Operational biometric entry and exit database</p>
                            </div>
                            <Button 
                                onClick={() => setIsAddShiftOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Active Shift
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        {isAddShiftOpen ? (
                             <form onSubmit={handleAddShift} className="space-y-6 bg-gray-50 p-8 rounded-3xl animate-in fade-in duration-300">
                                <h3 className="font-black text-gray-900 uppercase italic tracking-tighter">Draft New Shift Allocation</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Personnel</Label>
                                        <Select onValueChange={v => setShiftData({...shiftData, staff_id: v})}>
                                            <SelectTrigger className="bg-white border-none shadow-sm rounded-xl font-bold uppercase">
                                                <SelectValue placeholder="Select Staff" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white font-bold uppercase border-none shadow-2xl">
                                                {staff.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.full_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shift Date</Label>
                                        <Input 
                                            type="date"
                                            className="bg-white border-none shadow-sm rounded-xl font-bold"
                                            value={shiftData.shift_date}
                                            onChange={e => setShiftData({...shiftData, shift_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start Protocol</Label>
                                        <Input 
                                            type="time"
                                            className="bg-white border-none shadow-sm rounded-xl font-bold"
                                            value={shiftData.start_time}
                                            onChange={e => setShiftData({...shiftData, start_time: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End Protocol</Label>
                                        <Input 
                                            type="time"
                                            className="bg-white border-none shadow-sm rounded-xl font-bold"
                                            value={shiftData.end_time}
                                            onChange={e => setShiftData({...shiftData, end_time: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] px-8 rounded-xl h-11">Commit Log</Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddShiftOpen(false)} className="text-gray-400 font-bold uppercase text-[10px]">Cancel</Button>
                                </div>
                             </form>
                        ) : (
                            <ScrollArea className="h-[400px]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400">Personnel</th>
                                            <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400">Date</th>
                                            <th className="text-left py-4 text-[10px] font-black uppercase text-gray-400">Protocol Period</th>
                                            <th className="text-right py-4 text-[10px] font-black uppercase text-gray-400">Security Clearance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {shifts.map(shift => (
                                            <tr key={shift.id} className="group">
                                                <td className="py-4">
                                                    <p className="font-bold text-gray-900 uppercase italic text-sm">{shift.staff?.full_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{shift.staff?.role}</p>
                                                </td>
                                                <td className="py-4 font-bold text-gray-500 text-xs">{new Date(shift.shift_date).toLocaleDateString()}</td>
                                                <td className="py-4">
                                                    <Badge variant="outline" className="font-bold text-[10px] uppercase border-blue-100 bg-blue-50/30 text-blue-600">{shift.start_time} - {shift.end_time}</Badge>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Badge className="bg-green-100 text-green-700 font-black text-[9px] uppercase tracking-widest border border-green-200">Verified</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {shifts.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase text-xs italic tracking-widest">No shift protocols found in database</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}



